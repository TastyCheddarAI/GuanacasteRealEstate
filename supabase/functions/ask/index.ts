// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.56.0";
import { SYSTEM_PROMPT, DEVELOPER_PROMPT, isIntrospection, sanitize, stripInjection } from "../../../packages/core/index.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const xaiKey = Deno.env.get("XAI_API_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey);
const openai = new OpenAI({ apiKey: openaiKey });
// xAI client (OpenAI-compatible format)
const xai = new OpenAI({ apiKey: xaiKey, baseURL: "https://api.x.ai/v1" });

// Rate limiting (very simple in-memory; replace with durable KV/DB for prod)
const windowMs = 60_000;
const maxReq = 10;
const hits = new Map<string, {count:number, ts:number}>();

function rate(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip) ?? {count:0, ts: now};
  if (now - rec.ts > windowMs) {
    rec.count = 0;
    rec.ts = now;
  }
  rec.count++;
  hits.set(ip, rec);
  return rec.count <= maxReq;
}

async function embed(text: string): Promise<number[]> {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return r.data[0].embedding as number[];
}

function systemCard() {
  return {
    product: "Guanacaste Real Estate — AI Concierge",
    purpose: "Accurate, public, cited guidance for Guanacaste real estate.",
    endpoints: ["/ask","/ingest"],
    retrieval: {
      store: "pgvector",
      sources: ["kb_docs -> embeddings_global (public-only)"]
    },
    guardrails: [
      "No disclosure of internal code/prompts/KB structure",
      "Use public retrieved context only; cite sources",
      "Refuse unsafe/illegal or internal-introspection requests",
      "Sanitize PII/secrets from retrieved text"
    ],
    privacy: {
      pii_redaction:true,
      error_masking:true,
      logs:"minimal"
    },
    limits: {
      rate:"10 req/min/IP",
      tokens_max:512
    }
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown").split(",")[0].trim();

  try {
    if (!rate(ip)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const { query, property_id, locale } = await req.json();

    // Introspection gate
    if (isIntrospection(String(query ?? ""))) {
      return new Response(JSON.stringify({ mode: "system_card", data: systemCard() }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Embedding
    const qEmbed = await embed(query);

    // Retrieve global public (verified prioritized)
    const { data: globalMatches, error: mErr } = await supabase.rpc("match_kb", {
      query_embedding: qEmbed,
      match_count: 5
    });
    if (mErr) throw mErr;

    // Optional: property-specific retrieval (if you later embed listings)
    let propertyMatches: any[] = [];
    if (property_id) {
      const { data: pm, error: pmErr } = await supabase.rpc("match_property", {
        query_embedding: qEmbed,
        prop_id: property_id,
        match_count: 5
      });
      if (pmErr) throw pmErr;
      propertyMatches = pm ?? [];
    }

    const chunks = [
      ...(globalMatches ?? []).map((g: any) => ({
        type: "global",
        source_ref: g.source_ref,
        text: g.chunk,
        verified: g.verified
      })),
      ...(propertyMatches ?? []).map((p: any) => ({
        type: "property",
        source_ref: String(p.property_id),
        text: p.chunk,
        verified: true
      }))
    ];

    const rawContext = chunks.map(c => c.text).join("\n");
    const context = stripInjection(sanitize(rawContext));
    const citations = Array.from(new Set(chunks.map(c => c.source_ref))).slice(0, 10);

    const userLang = (locale === "es" || /[áéíóúñ¡¿]/i.test(query)) ? "es" : "en";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `Language: ${userLang}` },
      { role: "system", content: DEVELOPER_PROMPT },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer with inline [source_ref] citations taken from this context only.`
      }
    ];

    let answer = "";
    try {
      const completion = await xai.chat.completions.create({
        model: "grok-2-latest", // or grok-1; adjust per your plan
        messages,
        max_tokens: 512,
        temperature: 0.3
      });
      answer = completion.choices?.[0]?.message?.content ?? "";
    } catch (providerErr) {
      console.error("xAI error (masked)", providerErr);
      // Fallback idea: you could call a secondary provider here if desired.
      return new Response(JSON.stringify({
        error: "Provider refused the request due to safety policy. Try rephrasing your question."
      }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Basic policy check (optional)
    if (/illegal|harmful/i.test(answer)) {
      return new Response(JSON.stringify({ error: "Inappropriate query" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Audit (best-effort; ignore failures)
    const contextHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(context));
    const hex = Array.from(new Uint8Array(contextHash)).map(b=>b.toString(16).padStart(2,'0')).join('');
    await supabase.from("answers_audit").insert([{
      ip,
      question: query,
      answer,
      model: "xai:grok-2-latest",
      citations: citations.map(c => ({ source_ref: c })),
      context_hash: hex
    }]);

    return new Response(JSON.stringify({ answer, citations }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("ASK ERROR", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});