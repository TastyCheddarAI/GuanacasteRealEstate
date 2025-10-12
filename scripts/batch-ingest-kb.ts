import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Direct PostgreSQL connection to bypass PostgREST schema cache issues
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
});

// Embedding function (mock for now, will be replaced with real OpenAI when API key is available)
async function embed(text: string): Promise<number[]> {
  // Using mock embeddings for beta testing
  // TODO: Replace with real OpenAI embeddings when API key is configured
  console.log(`Generating mock embedding for: "${text.substring(0, 50)}..."`);
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}

// Import chunkText from core package
const { chunkText } = require('../packages/core/index.ts');

interface KBFrontmatter {
  title: string;
  topic?: string;
  location_scope?: 'guanacaste' | 'national';
  verified?: boolean;
  law_refs?: string[];
}

async function ingestFile(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(content);
  const frontmatter = parsed.data as KBFrontmatter;
  const body = parsed.content;

  const fileName = path.basename(filePath);

  console.log(`Ingesting: ${fileName}`);

  try {
    // Insert kb_doc
    const docQuery = `
      INSERT INTO kb_docs (title, topic, location_scope, sensitivity, verified, law_refs, content_md)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const docValues = [
      frontmatter.title ?? fileName,
      frontmatter.topic ?? 'general',
      frontmatter.location_scope ?? 'guanacaste',
      'public',
      frontmatter.verified ?? true,
      JSON.stringify(frontmatter.law_refs ?? []),
      body
    ];

    const docResult = await client.query(docQuery, docValues);
    const docId = docResult.rows[0].id;

    // Chunk + embed
    const chunks = chunkText(body, 1000);
    for (const chunk of chunks) {
      const vec = await embed(chunk);
      const embedQuery = `
        INSERT INTO embeddings_global (kb_doc_id, chunk, embedding, sensitivity, verified)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const embedValues = [
        docId,
        chunk,
        JSON.stringify(vec),
        'public',
        frontmatter.verified ?? true
      ];

      await client.query(embedQuery, embedValues);
    }

    console.log(`✅ Successfully ingested ${fileName}: kb_doc_id=${docId}`);
  } catch (error) {
    console.error(`❌ Error ingesting ${fileName}:`, error);
  }
}

async function createTables(): Promise<void> {
  const migrationSQL = `
    -- Enable pgcrypto (uuid) and pgvector
    create extension if not exists "pgcrypto";
    create extension if not exists "vector";

    -- KB documents (governance + content)
    create table if not exists kb_docs (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      topic text not null,
      location_scope text not null check (location_scope in ('guanacaste','national')),
      sensitivity text not null default 'public' check (sensitivity in ('public','internal','secret')),
      verified boolean not null default true,
      law_refs jsonb not null default '[]',
      content_md text not null,
      updated_at timestamptz not null default now()
    );

    -- Global embeddings table
    create table if not exists embeddings_global (
      id bigserial primary key,
      kb_doc_id uuid references kb_docs(id) on delete cascade,
      chunk text not null,
      embedding vector(1536) not null,
      sensitivity text not null default 'public' check (sensitivity in ('public','internal','secret')),
      verified boolean not null default true,
      created_at timestamptz not null default now()
    );
    create index if not exists idx_embeddings_global_embedding on embeddings_global using ivfflat (embedding vector_cosine_ops) with (lists = 100);
    create index if not exists idx_embeddings_global_verified on embeddings_global (verified);
    create index if not exists idx_embeddings_global_sensitivity on embeddings_global (sensitivity);
  `;

  await client.query(migrationSQL);
  console.log('Tables created successfully');
}

async function batchIngestKB(): Promise<void> {
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');

    // Create tables if they don't exist
    await createTables();

    const kbDir = path.join(__dirname, '..', 'seed', 'kb');

    if (!fs.existsSync(kbDir)) {
      throw new Error(`KB directory not found: ${kbDir}`);
    }

    const files = fs.readdirSync(kbDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(kbDir, file));

    console.log(`Found ${files.length} KB files to ingest`);

    for (const file of files) {
      await ingestFile(file);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🎉 KB ingestion completed!');
  } finally {
    // Close database connection
    await client.end();
    console.log('Database connection closed');
  }
}

batchIngestKB().catch(console.error);