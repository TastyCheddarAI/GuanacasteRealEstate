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
    const { reviewer_email, decision, queue_id, notes = "" } = body;

    if (!reviewer_email || !decision || !queue_id) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Get reviewer contributor id (must exist as admin/curator)
    const { data: contrib, error: cErr } = await supabase
      .from("contributors")
      .select("id, role")
      .eq("email", reviewer_email)
      .single();

    if (cErr || !contrib) return new Response(JSON.stringify({ error: "Reviewer not found" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" }
    });

    if (!["admin","curator"].includes(contrib.role)) return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 403,
      headers: { ...cors, "Content-Type": "application/json" }
    });

    if (decision === "approve") {
      const { data: docId, error: aErr } = await supabase.rpc("approve_queue_item", {
        p_queue_id: queue_id,
        p_reviewer: contrib.id,
        p_changelog: notes
      });
      if (aErr) return new Response(JSON.stringify({ error: "Approve failed" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
      return new Response(JSON.stringify({ ok: true, kb_doc_id: docId }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    } else if (decision === "reject") {
      const { error: rErr } = await supabase.rpc("reject_queue_item", {
        p_queue_id: queue_id,
        p_reviewer: contrib.id,
        p_notes: notes
      });
      if (rErr) return new Response(JSON.stringify({ error: "Reject failed" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid decision" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("kb_review error", e);
    return new Response(JSON.stringify({ error: "Review failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});