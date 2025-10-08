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
    const { email, title, description, payload } = body;

    if (!email || !title || !description || !payload) {
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

    const { data: prop, error } = await supabase.from("dao_proposals").insert([{
      title,
      description,
      payload,
      created_by: user.id
    }]).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, proposal: prop }), {
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("dao_proposals error", e);
    return new Response(JSON.stringify({ error: "Create proposal failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});