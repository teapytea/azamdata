import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const APP_PROTECTED = [
  "/dashboard",
  "/cv-saya",
  "/koin",
  "/taaruf",
  "/notifikasi",
  "/settings",
];

function startsWithAny(pathname: string, bases: string[]) {
  return bases.some((b) => pathname === b || pathname.startsWith(`${b}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  // Guard area app
  if (startsWithAny(pathname, APP_PROTECTED)) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  // Guard admin (semua /admin kecuali /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!user) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.is_admin === true;
    const isEmailProvider = user.app_metadata?.provider === "email";
    if (!isAdmin || !isEmailProvider) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url); // ⬅️ tidak perlu signOut di middleware
    }
  }

  return response;
}

export const config = {
  matcher: [
    // jalankan di semua path kecuali asset statis umum
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
