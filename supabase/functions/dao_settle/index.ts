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
    const { proposal_id, execute = false } = body;

    if (!proposal_id) {
      return new Response(JSON.stringify({ error: "proposal_id required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const { data: status1, error: e1 } = await supabase.rpc("dao_decide", { proposal: proposal_id });
    if (e1) throw e1;

    let executed_action = null;
    if (execute && status1 === 'passed') {
      const { data: execRes, error: e2 } = await supabase.rpc("dao_execute", { proposal: proposal_id });
      if (e2) throw e2;
      executed_action = execRes;
    }

    // Return fresh tally
    const { data: votes } = await supabase.from("dao_votes").select("choice, voter");

    return new Response(JSON.stringify({ ok: true, status: status1, executed_action, votes }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("dao_settle error", e);
    return new Response(JSON.stringify({ error: "Settle failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});