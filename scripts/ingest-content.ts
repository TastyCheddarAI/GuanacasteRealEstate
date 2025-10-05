import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';

// Load environment variables
config({ path: '../.env.local' }); // Adjust path as needed

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

interface ContentFrontmatter {
  title: string;
  slug: string;
  summary: string;
  last_verified_at: string;
  sources: Array<{ title: string; url: string }>;
  author: string;
  reviewer: string;
}

function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002', // Adjust model as needed
    input: text,
  });
  return response.data[0].embedding;
}

async function ingestContent(contentDir: string) {
  console.log('Ingesting content from:', contentDir);

  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content) as { data: ContentFrontmatter; content: string };

    console.log('Processing:', data.slug);

    // Chunk the body
    const chunks = chunkText(body);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      const { error } = await supabase
        .from('ai_embeddings_global')
        .insert({
          chunk,
          embedding,
          source_ref: data.slug,
          verified: true,
          verified_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error inserting embedding:', error);
      } else {
        console.log('Inserted chunk for:', data.slug);
      }
    }
  }

  console.log('Content ingestion completed!');
}

// Run the script
const contentDir = process.argv[2] || '../content';
ingestContent(contentDir).catch(console.error);