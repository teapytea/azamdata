import { createClient } from "@/lib/supabase/client-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const src = url.searchParams.get("src"); // 'reg' untuk register email/password
  const next = url.searchParams.get("next") ?? "/cv-saya";
  const origin = url.origin;

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );

  const target = src === "reg" ? "/onboarding/verify" : next;
  return NextResponse.redirect(`${origin}${target}`);
}
