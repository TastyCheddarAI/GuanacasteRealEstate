// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.56.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

function chunk(text: string, size = 1000) {
  const out: string[] = [];
  for (let i=0; i<text.length; i+=size) out.push(text.slice(i, i+size));
  return out;
}

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
    // Optional filter by topic or doc id
    const url = new URL(req.url);
    const docId = url.searchParams.get("kb_doc_id");

    const base = supabase.from("kb_docs").select("*").eq("sensitivity","public").eq("verified", true);
    const { data: docs, error } = docId ? await base.eq("id", docId) : await base;

    if (error) throw error;

    for (const d of (docs || [])) {
      // delete old embeddings for this doc (simple strategy)
      await supabase.from("embeddings_global").delete().eq("kb_doc_id", d.id);

      const chunks = chunk(d.content_md, 1000);
      for (const ch of chunks) {
        const vec = await embed(ch);
        const { error: insErr } = await supabase.from("embeddings_global").insert([{
          kb_doc_id: d.id,
          chunk: ch,
          embedding: vec,
          sensitivity: "public",
          verified: d.verified
        }]);
        if (insErr) throw insErr;
      }
    }

    return new Response(JSON.stringify({ ok: true, reembedded: (docs || []).length }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("kb_publish error", e);
    return new Response(JSON.stringify({ error: "Publish failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});