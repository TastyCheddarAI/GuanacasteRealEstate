// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json();
    const { admin_email, contributor_id, delta, reason, kb_doc_id = null } = body;

    // Check admin
    const { data: admin } = await supabase.from("contributors").select("id, role").eq("email", admin_email).single();
    if (!admin || !['admin','curator'].includes(admin.role)) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Call reputation_slash
    const { data: newRep, error } = await supabase.rpc("reputation_slash", {
      c_id: contributor_id,
      delta,
      reason,
      doc: kb_doc_id,
      judge: admin.id
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, new_rep: newRep }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("rep_adjust error", e);
    return new Response(JSON.stringify({ error: "Adjust failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});