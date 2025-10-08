// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role required for RPCs
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json();
    const { email, display_name, role = "author", doc } = body;

    if (!email || !display_name || !doc) {
      return new Response(JSON.stringify({ error: "Missing fields (email, display_name, doc)" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Upsert contributor
    const { data: c } = await supabase.rpc("upsert_contributor", {
      p_email: email,
      p_name: display_name,
      p_role: role
    });

    // Queue doc
    const { data: q } = await supabase.rpc("queue_proposed_doc", {
      p_doc: doc,
      p_contributor: c
    });

    return new Response(JSON.stringify({ ok: true, contributor_id: c, queue_id: q }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("kb_submit error", e);
    return new Response(JSON.stringify({ error: "Submit failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});