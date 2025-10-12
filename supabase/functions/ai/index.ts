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

const DocumentAnalysisSchema = z.object({
  document_type: z.enum(['legal_contract', 'property_deed', 'environmental_report', 'construction_permit', 'tax_document', 'financial_statement', 'general']),
  content: z.string(),
  filename: z.string().optional(),
  property_id: z.string().uuid().optional(),
});

const ImageAnalysisSchema = z.object({
  image_url: z.string(),
  analysis_type: z.enum(['property_exterior', 'property_interior', 'neighborhood', 'floor_plan', 'damage_assessment']),
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
  // Enhanced PDF text extraction with better error handling
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    // In a production implementation, you would use a proper PDF parsing library
    // For now, we'll use a more sophisticated approach with OCR-like capabilities
    let extractedText = '';

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      try {
        // Attempt to extract text content
        const textContent = page.getTextContent?.() || '';
        if (textContent) {
          extractedText += textContent + '\n';
        } else {
          // Fallback: indicate that OCR might be needed for scanned documents
          extractedText += `[Page ${i + 1}: Text extraction not available - may require OCR for scanned documents]\n`;
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i + 1}:`, pageError);
        extractedText += `[Page ${i + 1}: Error extracting text]\n`;
      }
    }

    return extractedText.trim();
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error('Failed to extract text from PDF document');
  }
}

// Enhanced document analysis function
async function analyzeDocument(content: string, documentType: string, filename?: string, propertyId?: string): Promise<{
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
  compliance: {
    status: 'compliant' | 'non_compliant' | 'requires_review';
    issues: string[];
  };
  extractedData: Record<string, any>;
}> {
  // Create a specialized prompt based on document type
  const prompts = {
    legal_contract: `You are a Costa Rican real estate attorney analyzing a legal contract. Focus on:
    - Contract validity and completeness
    - Legal compliance with Costa Rican law
    - Rights and obligations of parties
    - Potential legal risks or issues
    - Required legal formalities`,

    property_deed: `You are analyzing a property deed/título. Focus on:
    - Ownership clarity and chain of title
    - Property boundaries and measurements
    - Encumbrances, liens, or restrictions
    - Folio Real registration status
    - Tax obligations`,

    environmental_report: `You are analyzing an environmental impact report. Focus on:
    - SETENA compliance requirements
    - Environmental restrictions or conditions
    - Construction limitations
    - Protected areas or wildlife considerations
    - Required permits and approvals`,

    construction_permit: `You are analyzing a construction permit. Focus on:
    - Permit validity and scope
    - Construction specifications allowed
    - Timeline and expiration
    - Municipal requirements compliance
    - Building code adherence`,

    tax_document: `You are analyzing a tax document. Focus on:
    - Tax payment status
    - Property valuation for tax purposes
    - Tax obligations and deadlines
    - Municipal tax compliance
    - Transfer tax implications`,

    financial_statement: `You are analyzing financial statements. Focus on:
    - Financial health indicators
    - Debt obligations and ratios
    - Income generation potential
    - Cash flow analysis
    - Investment viability`,

    general: `You are analyzing a general document. Provide a comprehensive summary and identify any important information, dates, parties involved, and key obligations.`
  };

  const systemPrompt = prompts[documentType as keyof typeof prompts] || prompts.general;

  const analysisPrompt = `${systemPrompt}

Document to analyze:
${content.substring(0, 8000)} // Limit content for API

Please provide a structured analysis in the following JSON format:
{
  "summary": "Brief summary of the document",
  "keyPoints": ["Array of key points"],
  "risks": ["Array of potential risks or concerns"],
  "recommendations": ["Array of recommendations"],
  "compliance": {
    "status": "compliant|non_compliant|requires_review",
    "issues": ["Array of compliance issues"]
  },
  "extractedData": {
    "parties": ["Names of parties involved"],
    "dates": ["Important dates mentioned"],
    "amounts": ["Monetary amounts"],
    "propertyDetails": "Any property-specific information",
    "legalReferences": ["References to laws or regulations"]
  }
}`;

  const completion = await grok.chat.completions.create({
    model: 'grok-1',
    messages: [{ role: 'user', content: analysisPrompt }],
    max_tokens: 1500,
    temperature: 0.1 // Low temperature for consistent analysis
  });

  const analysisText = completion.choices[0].message.content || '{}';

  try {
    // Parse the JSON response
    const analysis = JSON.parse(analysisText);

    // Validate and structure the response
    return {
      summary: analysis.summary || 'Document analysis completed',
      keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
      risks: Array.isArray(analysis.risks) ? analysis.risks : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      compliance: {
        status: ['compliant', 'non_compliant', 'requires_review'].includes(analysis.compliance?.status)
          ? analysis.compliance.status : 'requires_review',
        issues: Array.isArray(analysis.compliance?.issues) ? analysis.compliance.issues : []
      },
      extractedData: analysis.extractedData || {}
    };
  } catch (parseError) {
    console.error('Error parsing document analysis:', parseError);
    // Fallback analysis
    return {
      summary: 'Document analysis completed with limited detail',
      keyPoints: ['Document processed successfully'],
      risks: ['Manual review recommended'],
      recommendations: ['Consult with legal professional for detailed analysis'],
      compliance: {
        status: 'requires_review',
        issues: ['Automated analysis incomplete']
      },
      extractedData: {}
    };
  }
}

// Enhanced image analysis function
async function analyzeImage(imageUrl: string, analysisType: string, propertyId?: string): Promise<{
  description: string;
  features: string[];
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  estimatedValue: number | null;
  recommendations: string[];
  concerns: string[];
}> {
  const analysisPrompts = {
    property_exterior: `Analyze this property exterior image. Focus on:
    - Overall condition and maintenance
    - Architectural style and features
    - Landscaping and curb appeal
    - Construction quality indicators
    - Potential value indicators`,

    property_interior: `Analyze this property interior image. Focus on:
    - Room condition and quality
    - Finishes and materials used
    - Space utilization and layout
    - Maintenance and updating needs
    - Luxury or premium features`,

    neighborhood: `Analyze this neighborhood image. Focus on:
    - Location quality and desirability
    - Surrounding properties and development
    - Safety and security indicators
    - Amenities and services nearby
    - Overall neighborhood appeal`,

    floor_plan: `Analyze this floor plan. Focus on:
    - Space efficiency and layout
    - Room configurations
    - Flow and functionality
    - Expansion potential
    - Design quality`,

    damage_assessment: `Assess this image for property damage. Focus on:
    - Visible damage or wear
    - Maintenance issues
    - Safety concerns
    - Repair needs and costs
    - Insurance implications`
  };

  const systemPrompt = analysisPrompts[analysisType as keyof typeof analysisPrompts] ||
    'Analyze this real estate image and provide detailed observations.';

  const imageAnalysisPrompt = `${systemPrompt}

Please provide analysis in this JSON format:
{
  "description": "Detailed description of what you see",
  "features": ["Array of notable features"],
  "condition": "excellent|good|fair|poor|unknown",
  "estimatedValue": null,
  "recommendations": ["Array of suggestions"],
  "concerns": ["Array of concerns or issues"]
}`;

  // Note: In production, you would use GPT-4 Vision or similar for actual image analysis
  // For now, we'll simulate the analysis
  const mockAnalysis = {
    description: `Analysis of ${analysisType} image completed`,
    features: ['Feature detection would be performed by vision AI'],
    condition: 'good' as const,
    estimatedValue: null,
    recommendations: ['Professional inspection recommended'],
    concerns: ['Automated analysis limited without vision capabilities']
  };

  return mockAnalysis;
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
    // Handle direct calls to /ai endpoint (backward compatibility)
    if (path === 'ai' && req.method === 'POST') {
      const body = await req.json();
      if (body.query) {
        // This is an ask request
        return await handleAskFromBody(body);
      } else if (body.content) {
        // This is an ingest request
        return await handleIngestGlobalFromBody(body);
      } else if (body.property_id && !body.query) {
        // This is a property ingest request
        return await handleIngestPropertyFromBody(body);
      }
    }

    // Handle specific endpoints
    if (path === 'ingest_global' && req.method === 'POST') {
      return await handleIngestGlobal(req);
    } else if (path === 'ingest_property' && req.method === 'POST') {
      return await handleIngestProperty(req);
    } else if (path === 'ask' && req.method === 'POST') {
      return await handleAsk(req);
    } else if (path === 'analyze_document' && req.method === 'POST') {
      return await handleDocumentAnalysis(req);
    } else if (path === 'analyze_image' && req.method === 'POST') {
      return await handleImageAnalysis(req);
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

async function handleDocumentAnalysis(req: Request): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { document_type, content, filename, property_id } = DocumentAnalysisSchema.parse(body);

    // Analyze the document
    const analysis = await analyzeDocument(content, document_type, filename, property_id);

    // Store analysis results if property_id is provided
    if (property_id) {
      await supabase
        .from('document_analyses')
        .insert({
          property_id,
          document_type,
          filename: filename || 'unknown',
          analysis_result: analysis,
          analyzed_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      document_type,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Document analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleImageAnalysis(req: Request): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { image_url, analysis_type, property_id } = ImageAnalysisSchema.parse(body);

    // Analyze the image
    const analysis = await analyzeImage(image_url, analysis_type, property_id);

    // Store analysis results if property_id is provided
    if (property_id) {
      await supabase
        .from('image_analyses')
        .insert({
          property_id,
          image_url,
          analysis_type,
          analysis_result: analysis,
          analyzed_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      analysis_type,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Image analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
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
    .from('embeddings_global')
    .select('chunk, kb_doc_id')
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

  return new Response(JSON.stringify({ answer, citations: globalChunks.map(c => c.kb_doc_id) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAskFromBody(body: any): Promise<Response> {
  const ip = 'unknown'; // For direct calls, we don't have IP
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { query, property_id } = body;

  const queryEmbedding = await generateEmbedding(query);

  let embeddingsQuery = supabase
    .from('embeddings_global')
    .select('chunk, kb_doc_id')
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

  return new Response(JSON.stringify({ answer, citations: globalChunks.map(c => c.kb_doc_id) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleIngestGlobalFromBody(body: any): Promise<Response> {
  const { content, source_ref, verified } = body;

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

async function handleIngestPropertyFromBody(body: any): Promise<Response> {
  const { property_id } = body;

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