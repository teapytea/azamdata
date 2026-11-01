// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_AFTER = new Set(["/", "/dashboard", "/admin", "/onboarding"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnTo = url.searchParams.get("returnTo") || "/dashboard";

  if (!code)
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));

  const supabase = createClient();

  // 1) tukar code -> session (set cookie oleh @supabase/ssr)
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  // 2) baca role dari JWT claim
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as any)?.role as
    | "admin"
    | "user"
    | undefined;

  let target = role === "admin" ? "/admin" : "/dashboard";
  if (ALLOWED_AFTER.has(returnTo)) target = returnTo;

  return NextResponse.redirect(new URL(target, req.url));
}
