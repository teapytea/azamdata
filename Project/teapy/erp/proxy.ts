import { NextResponse, type NextRequest } from "next/server";

/** Domain pos.* langsung menampilkan aplikasi kasir, domain lain menampilkan ERP. */
export function proxy(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;
  if (host.startsWith("pos.") && !pathname.startsWith("/pos")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/pos" : pathname === "/login" ? "/pos/login" : pathname;
    if (url.pathname !== pathname) return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|menu|favicon).*)"] };
