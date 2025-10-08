import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import OpenAI from 'https://esm.sh/openai@4.20.1';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';
import matter from 'https://esm.sh/gray-matter@4.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const xaiApiKey = Deno.env.get('XAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });
const grok = new OpenAI({ apiKey: xaiApiKey, baseURL: 'https://api.x.ai/v1' });

// Zod schemas
const IngestGlobalSchema = z.object({
  content: z.string(),
  source_ref: z.string(),
  verified: z.boolean().default(false),
});

const IngestPropertySchema = z.object({
  property_id: z.string().uuid(),
});

const AskSchema = z.object({
  query: z.string(),
  property_id: z.string().uuid().optional(),
});

// Utility functions
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function sanitizeContext(text: string): string {
  // Remove potential API keys (long alphanumeric strings with hyphens)
  text = text.replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, '[API_KEY_REDACTED]');

  // Remove potential API keys (long base64-like strings)
  text = text.replace(/\b[A-Za-z0-9+/]{20,}\b/g, '[API_KEY_REDACTED]');

  // Remove email addresses
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');

  // Remove phone numbers (various formats)
  text = text.replace(/\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE_REDACTED]');

  // Remove potential credit card numbers
  text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_NUMBER_REDACTED]');

  // Remove potential social security numbers
  text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');

  // Remove potential passwords (common patterns)
  text = text.replace(/\bpassword[\s]*:[\s]*[^\s]+\b/gi, 'password: [REDACTED]');
  text = text.replace(/\btoken[\s]*:[\s]*[^\s]+\b/gi, 'token: [REDACTED]');
  text = text.replace(/\bsecret[\s]*:[\s]*[^\s]+\b/gi, 'secret: [REDACTED]');

  // Remove potential private keys (BEGIN/END markers)
  text = text.replace(/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, '[PRIVATE_KEY_REDACTED]');

  return text;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Simple text extraction - in real implementation, use pdf-parse or similar
  // For now, placeholder
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();
  let text = '';
  for (const page of pages) {
    // This is a simplification; real PDF text extraction is more complex
    text += page.getTextContent?.() || '';
  }
  return text;
}

// Rate limiting (simple in-memory for demo)
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  const requests = rateLimit.get(ip) || 0;
  if (requests >= RATE_LIMIT_MAX) {
    return false;
  }
  rateLimit.set(ip, requests + 1);
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, time] of rateLimit.entries()) {
      if (time < windowStart) {
        rateLimit.delete(key);
      }
    }
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'ingest_global' && req.method === 'POST') {
      return await handleIngestGlobal(req);
    } else if (path === 'ingest_property' && req.method === 'POST') {
      return await handleIngestProperty(req);
    } else if (path === 'ask' && req.method === 'POST') {
      return await handleAsk(req);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleIngestGlobal(req: Request): Promise<Response> {
  const contentType = req.headers.get('content-type') || '';
  let content = '';
  let source_ref = '';
  let verified = false;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    source_ref = formData.get('source_ref') as string || file.name;
    verified = formData.get('verified') === 'true';

    if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
      content = await file.text();
      const parsed = matter(content);
      content = parsed.content;
      // Extract citations if available
    } else if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      content = await extractTextFromPDF(buffer);
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    const body = await req.json();
    const validated = IngestGlobalSchema.parse(body);
    content = validated.content;
    source_ref = validated.source_ref;
    verified = validated.verified;
  }

  const chunks = chunkText(content);
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    const { error } = await supabase
      .from('ai_embeddings_global')
      .insert({
        chunk,
        embedding,
        source_ref,
        verified,
        verified_at: verified ? new Date().toISOString() : null,
      });
    if (error) throw error;
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleIngestProperty(req: Request): Promise<Response> {
  const body = await req.json();
  const { property_id } = IngestPropertySchema.parse(body);

  const { data: property, error } = await supabase
    .from('properties')
    .select('description_md, title, town')
    .eq('id', property_id)
    .single();

  if (error || !property) {
    return new Response(JSON.stringify({ error: 'Property not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const content = `${property.title} ${property.town} ${property.description_md}`;
  const chunks = chunkText(content);
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    const { error: insertError } = await supabase
      .from('ai_embeddings_property')
      .insert({
        property_id,
        chunk,
        embedding,
        source_ref: property_id,
      });
    if (insertError) throw insertError;
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAsk(req: Request): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { query, property_id } = AskSchema.parse(body);

  const queryEmbedding = await generateEmbedding(query);

  let embeddingsQuery = supabase
    .from('ai_embeddings_global')
    .select('chunk, source_ref')
    .order('embedding <-> \'' + queryEmbedding.join(',') + '\'')
    .limit(5);

  if (property_id) {
    const propertyEmbeddings = await supabase
      .from('ai_embeddings_property')
      .select('chunk, source_ref')
      .eq('property_id', property_id)
      .order('embedding <-> \'' + queryEmbedding.join(',') + '\'')
      .limit(5);
    // Combine
  }

  const { data: globalChunks, error } = await embeddingsQuery;
  if (error) throw error;

  const rawContext = globalChunks.map(c => c.chunk).join('\n');
  const context = sanitizeContext(rawContext);

  const prompt = `You are a helpful assistant for real estate in Guanacaste, Costa Rica. Answer the user's question based on the provided context. Include citations where relevant. If the question is inappropriate or harmful, refuse to answer.

Context:
${context}

Question: ${query}

Answer:`;

  const completion = await grok.chat.completions.create({
    model: 'grok-1',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  });

  const answer = completion.choices[0].message.content;

  // Guardrail: check for harmful content
  if (answer?.toLowerCase().includes('harmful') || answer?.toLowerCase().includes('illegal')) {
    return new Response(JSON.stringify({ error: 'Inappropriate query' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ answer, citations: globalChunks.map(c => c.source_ref) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}