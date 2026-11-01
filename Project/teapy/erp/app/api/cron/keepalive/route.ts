import { NextResponse } from "next/server";
import { one } from "@/lib/db";

/** Dipanggil Vercel Cron sekali sehari agar project Supabase tidak dijeda karena tidak aktif. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    await one("select key from app_settings where key = 'main'");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
