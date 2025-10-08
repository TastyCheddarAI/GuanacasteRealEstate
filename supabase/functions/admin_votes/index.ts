// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token"
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const ADMIN_PANEL_TOKEN = Deno.env.get("ADMIN_PANEL_TOKEN")!;

function checkAuth(req: Request) {
  const t = req.headers.get("x-admin-token") || "";
  return ADMIN_PANEL_TOKEN && t === ADMIN_PANEL_TOKEN;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (!checkAuth(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(req.url);
    const p = url.searchParams.get("proposal_id");

    if (!p) {
      // list proposals
      const { data, error } = await supabase
        .from("dao_proposals")
        .select("id, title, description, status, quorum, pass_ratio, created_at, closes_at, executed_at, payload")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, proposals: data }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // details & weighted tally
    const { data: prop, error: pErr } = await supabase
      .from("dao_proposals")
      .select("id, title, description, status, quorum, pass_ratio, created_at, closes_at, executed_at, payload")
      .eq("id", p)
      .single();

    if (pErr) throw pErr;

    const { data: votes, error: vErr } = await supabase
      .from("dao_votes")
      .select("id, voter, choice, rep_snapshot, badges_snapshot, weight_calc")
      .eq("proposal_id", p);

    if (vErr) throw vErr;

    // compute fresh tally via RPC
    const { data: tally } = await supabase.rpc("dao_tally", { proposal: p });

    // expand voters
    const voterIds = Array.from(new Set((votes||[]).map(v => v.voter)));
    let voters: Record<string, any> = {};

    if (voterIds.length) {
      const { data: rows } = await supabase
        .from("contributors")
        .select("id, display_name, email, rep_score, badges")
        .in("id", voterIds);

      for (const r of (rows||[])) voters[r.id] = r;
    }

    return new Response(JSON.stringify({ ok: true, proposal: prop, votes, voters, tally }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("admin_votes error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});