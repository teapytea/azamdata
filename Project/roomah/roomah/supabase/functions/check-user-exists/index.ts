// Deno / Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

const svc = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST")
    return json({ exists: false, error: "method_not_allowed" }, 405);

  try {
    const { email } = await req.json().catch(() => ({}));
    const target = String(email || "")
      .trim()
      .toLowerCase();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      return json({ exists: false, error: "invalid_email" }, 400);
    }

    const { data, error } = await svc
      .from("profiles")
      .select("id")
      .eq("email", target)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      return json({ exists: false, error: error.message }, 500);
    }

    return json({ exists: !!data });
  } catch {
    return json({ exists: false, error: "exception" }, 500);
  }
});
