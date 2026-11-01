// scripts/scaffold-roomah.mjs
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const dirs = [
  "app/(public)",
  "app/(public)/tentang",
  "app/(auth)/login",
  "app/(auth)/callback",
  "app/(app)/dashboard",
  "app/(app)/cv-saya",
  "app/(app)/koin",
  "app/(app)/taaruf",
  "app/(app)/notifikasi",
  "app/(app)/settings",
  "app/(admin)/admin",
  "app/(admin)/admin/verifikasi-cv",
  "app/(admin)/admin/proses-taaruf",
  "app/(admin)/admin/koin-transaksi",
  "app/(admin)/admin/audit",
  "app/api/health",
  "features/auth/server",
  "features/auth/client",
  "features/cv/server",
  "features/cv/components",
  "features/koin",
  "features/taaruf",
  "features/notifications",
  "features/admin",
  "components/ui",
  "components/forms",
  "components/layout",
  "components/icons",
  "lib/supabase",
  "lib/validators",
  "styles",
  "public",
  "edge-functions/create-transaction",
  "edge-functions/midtrans-webhook",
  "supabase/migrations",
  "db/sql",
  "db/seed",
  "tests/unit",
  "tests/e2e",
  "tests/contracts",
  "scripts",
];

const files = {
  "app/(public)/layout.tsx": `export default function PublicLayout({children}:{children:React.ReactNode}){return(<div><header>{/* Navbar publik */}</header><main>{children}</main></div>);}`,
  "app/(public)/page.tsx": `export default function Home(){return(<div>Home (public)</div>);}`,
  "app/(public)/tentang/page.tsx": `export default function Tentang(){return(<div>Tentang Roomah</div>);}`,
  "app/(auth)/login/page.tsx": `"use client";export default function Login(){return(<div>Login</div>);}`,
  "app/(auth)/callback/route.ts": `import { NextResponse } from "next/server";export async function GET(){return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"));}`,
  "app/(app)/layout.tsx": `export default function AppLayout({children}:{children:React.ReactNode}){return(<div><header>{/* Navbar user */}</header><main>{children}</main></div>);}`,
  "app/(app)/dashboard/page.tsx": `export default function Dashboard(){return(<div>Dashboard</div>);}`,
  "app/(app)/cv-saya/page.tsx": `export default function CvSaya(){return(<div>CV Saya</div>);}`,
  "app/(app)/cv-saya/actions.ts": `// Server Actions untuk CV (isi nanti)`,
  "app/(app)/koin/page.tsx": `export default function Koin(){return(<div>Koin</div>);}`,
  "app/(app)/taaruf/page.tsx": `export default function Taaruf(){return(<div>Ta'aruf</div>);}`,
  "app/(app)/notifikasi/page.tsx": `export default function Notifikasi(){return(<div>Notifikasi</div>);}`,
  "app/(app)/settings/page.tsx": `export default function Settings(){return(<div>Settings</div>);}`,
  "app/(admin)/admin/layout.tsx": `export default function AdminLayout({children}:{children:React.ReactNode}){return(<div><aside>{/* Sidebar admin */}</aside><main>{children}</main></div>);}`,
  "app/(admin)/admin/page.tsx": `export default function AdminHome(){return(<div>Admin KPI</div>);}`,
  "app/(admin)/admin/verifikasi-cv/page.tsx": `export default function VerifikasiCV(){return(<div>Verifikasi CV</div>);}`,
  "app/(admin)/admin/proses-taaruf/page.tsx": `export default function ProsesTaaruf(){return(<div>Proses Ta'aruf</div>);}`,
  "app/(admin)/admin/koin-transaksi/page.tsx": `export default function KoinTransaksi(){return(<div>Koin & Transaksi</div>);}`,
  "app/(admin)/admin/audit/page.tsx": `export default function Audit(){return(<div>Audit Log</div>);}`,
  "app/api/health/route.ts": `export const GET=async()=>new Response("ok",{status:200});`,
  "app/layout.tsx": `import "@/styles/globals.css";export default function Root({children}:{children:React.ReactNode}){return(<html lang="id"><body>{children}</body></html>);}`,
  "app/error.tsx": `"use client";export default function Error(){return(<div>Terjadi kesalahan.</div>);}`,
  "app/loading.tsx": `export default function Loading(){return(<div>Memuat…</div>);}`,
  "components/ui/Button.tsx": `"use client";export default function Button({children}:{children:React.ReactNode}){return(<button className="px-3 py-2 rounded-md bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{children}</button>);}`,
  "components/layout/Navbar.tsx": `export default function Navbar(){return(<nav>Navbar</nav>);}`,
  "lib/supabase/client-browser.ts": `import { createBrowserClient } from "@supabase/ssr";export const createClient=()=>createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);`,
  "lib/supabase/client-server.ts": `import { createServerClient,type CookieOptions } from "@supabase/ssr";import { cookies } from "next/headers";export const createClient=()=>{const store=cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{get:(n)=>store.get(n)?.value,set:(n,v,o)=>store.set({name:n,value:v,...o}),remove:(n,o)=>store.set({name:n,value:"",...o})}});};`,
  "styles/globals.css": `@import "tailwindcss";@theme{--color-background:hsl(100 22% 97%);--color-foreground:hsl(220 25% 12%);--color-card:hsl(0 0% 100%);--color-popover:hsl(0 0% 100%);--color-muted:hsl(100 20% 95%);--color-muted-foreground:hsl(220 15% 36%);--color-primary:hsl(84 60% 42%);--color-primary-foreground:hsl(0 0% 100%);--color-secondary:hsl(100 18% 90%);--color-secondary-foreground:hsl(220 25% 18%);--color-accent:hsl(42 92% 50%);--color-accent-foreground:hsl(26 90% 12%);--color-link:hsl(200 85% 42%);--color-border:hsl(100 12% 86%);--color-input:hsl(100 12% 96%);--color-ring:hsl(84 70% 50%);--color-destructive:hsl(0 75% 50%);--radius:0.5rem;}html,body{height:100%}body{@apply bg-background text-foreground;font-feature-settings:"rlig" 1,"calt" 1;}`,
  "edge-functions/create-transaction/index.ts": `export default async function handler(req: Request){return new Response("create-transaction placeholder");}`,
  "edge-functions/midtrans-webhook/index.ts": `export default async function handler(req: Request){return new Response("midtrans-webhook placeholder");}`,
  "db/sql/001_init_extensions.sql": `-- idempotent\ncreate extension if not exists pgcrypto;`,
  "db/sql/002_storage_buckets.sql": `-- (isi di fase berikutnya)`,
  "db/sql/003_auth_profiles_bootstrap.sql": `-- (isi di fase berikutnya)`,
  ".env.local": `NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\n`,
};

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}
function ensureFile(fp, content) {
  ensureDir(dirname(fp));
  if (!existsSync(fp)) writeFileSync(fp, content);
}

dirs.forEach(ensureDir);
Object.entries(files).forEach(([p, c]) => ensureFile(p, c));

console.log("✅ Scaffold Roomah selesai. (Tidak menimpa file yang sudah ada)");
