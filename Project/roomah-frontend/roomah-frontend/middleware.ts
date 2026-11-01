// middleware.ts (root)
import { createMiddlewareClient } from "./src/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareClient(req);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  const redirect = (to: string) => NextResponse.redirect(new URL(to, req.url));

  // Ambil role dari JWT (jika sudah login)
  let role: string | null = null;
  if (session) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    role = (user?.app_metadata as any)?.role ?? null;
  }

  // ADMIN guard
  if (pathname.startsWith("/admin")) {
    if (!session) return redirect("/admin/login");
    if (pathname === "/admin/login") {
      return redirect(role === "admin" ? "/admin" : "/dashboard");
    }
    if (role !== "admin") return redirect("/dashboard");
  }

  // DASHBOARD guard (opsional tapi umum)
  if (pathname.startsWith("/dashboard") && !session) {
    return redirect("/login");
  }

  // Cegah akses /login & /register saat sudah login
  if (session && (pathname === "/login" || pathname === "/register")) {
    return redirect(role === "admin" ? "/admin" : "/dashboard");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
