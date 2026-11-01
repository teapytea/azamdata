// Server-side Supabase client for App Router (route handlers, RSC)
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
// (optional) kalau kamu punya types: import type { Database } from "./types";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // next/headers cookies() bersifat immutable; set via .set
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
