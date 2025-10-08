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
    const method = req.method.toUpperCase();

    // GET /?q=list -> list contributors
    if (method === "GET" && (url.searchParams.get("q") === "list" || !url.searchParams.get("q"))) {
      const { data, error } = await supabase
        .from("contributors")
        .select("id, email, display_name, role, rep_score, badges, expertise, slashed, rep_last_update")
        .order("display_name");

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, contributors: data }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // POST: add or update contributor fields
    // body: { email, display_name, role, badges, expertise }
    if (method === "POST") {
      const body = await req.json();
      const { email, display_name, role, badges = [], expertise = [] } = body || {};

      if (!email || !display_name || !role) {
        return new Response(JSON.stringify({ error: "email, display_name, role required" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      // upsert contributor
      const { data, error } = await supabase
        .from("contributors")
        .upsert({ email, display_name, role, badges, expertise }, { onConflict: "email" })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, contributor: data }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // PATCH: adjust role/badges/expertise or rep
    // body: { id, role?, badges?, expertise?, rep_delta?, slash_reason? }
    if (method === "PATCH") {
      const body = await req.json();
      const { id, role, badges, expertise, rep_delta, slash_reason } = body || {};

      if (!id) {
        return new Response(JSON.stringify({ error: "id required" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      // update role/badges/expertise if present
      if (role || badges || expertise) {
        const { error: uErr } = await supabase
          .from("contributors")
          .update({
            ...(role ? { role } : {}),
            ...(badges ? { badges } : {}),
            ...(expertise ? { expertise } : {})
          })
          .eq("id", id);

        if (uErr) throw uErr;
      }

      // adjust rep if rep_delta present
      if (typeof rep_delta === "number" && rep_delta !== 0) {
        const { data: newRep, error: rErr } = await supabase.rpc("reputation_slash", {
          c_id: id,
          delta: rep_delta,
          reason: slash_reason ?? (rep_delta > 0 ? "manual reward" : "manual slash"),
          doc: null,
          judge: null
        });

        if (rErr) throw rErr;
      }

      const { data, error } = await supabase
        .from("contributors")
        .select("id,email,display_name,role,rep_score,badges,expertise,slashed,rep_last_update")
        .eq("id", id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, contributor: data }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("admin_contributors error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});