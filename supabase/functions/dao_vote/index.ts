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
    const { email, proposal_id, choice } = body;

    if (!email || !proposal_id || !choice) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const { data: user } = await supabase.from("contributors").select("id, role").eq("email", email).single();
    if (!user) return new Response(JSON.stringify({ error: "Unknown contributor" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" }
    });

    const { error } = await supabase.from("dao_votes").insert([{
      proposal_id,
      voter: user.id,
      choice
    }]);

    if (error) throw error;

    // simple tally (you can move this to a cron)
    const { data: votes } = await supabase.from("dao_votes").select("choice, weight").eq("proposal_id", proposal_id);
    const tally = { yes:0, no:0, abstain:0 };
    for (const v of (votes||[])) tally[v.choice as keyof typeof tally] += Number(v.weight || 1);

    return new Response(JSON.stringify({ ok: true, tally }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("dao_vote error", e);
    return new Response(JSON.stringify({ error: "Vote failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});