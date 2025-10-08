// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { chunkText } from "../../../packages/core/index.ts";
import FrontMatter from "https://esm.sh/gray-matter@4.0.3";
import OpenAI from "https://esm.sh/openai@4.56.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function embed(text: string): Promise<number[]> {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return r.data[0].embedding as number[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // Admin check (simple): require service role header or allowed email (extend as needed)
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Send multipart/form-data with file" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return new Response(JSON.stringify({ error: "file missing" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" }
    });

    const buf = await file.text();
    const parsed = FrontMatter(buf);
    const fm = parsed.data as any;
    const content = parsed.content;

    // Insert kb_doc
    const { data: doc, error: docErr } = await supabase
      .from("kb_docs")
      .insert([{
        title: fm.title ?? file.name,
        topic: fm.topic ?? "general",
        location_scope: fm.location_scope ?? "guanacaste",
        sensitivity: fm.sensitivity ?? "public",
        verified: fm.verified ?? true,
        law_refs: fm.law_refs ?? [],
        content_md: content
      }])
      .select()
      .single();

    if (docErr) throw docErr;

    // Chunk + embed
    const chunks = chunkText(content, 1000);
    for (const chunk of chunks) {
      const vec = await embed(chunk);
      const { error: insErr } = await supabase.from("embeddings_global").insert([{
        kb_doc_id: doc.id,
        chunk,
        embedding: vec,
        sensitivity: "public",
        verified: doc.verified
      }]);
      if (insErr) throw insErr;
    }

    return new Response(JSON.stringify({ ok: true, kb_doc_id: doc.id }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("INGEST ERROR", e);
    return new Response(JSON.stringify({ error: "Failed to ingest file" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});