// app/(app)/koin/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client-server";
import Packages from "@/features/wallet/Packages";

async function ensureWallet(supabase: any, userId: string) {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) {
    // RLS kita mengizinkan INSERT oleh pemilik row
    await supabase.from("wallets").insert({ user_id: userId, balance: 0 });
  }
}

export default async function KoinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jangan diam-diam return null → redirect agar tidak blank
  if (!user) redirect("/login?next=/koin");

  // Pastikan dompet ada
  await ensureWallet(supabase, user.id);

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: txs } = await supabase
    .from("wallet_tx")
    .select("order_id, amount, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const balance = wallet?.balance ?? 0;
  const hasClientKey = Boolean(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dompet Koin</h1>
        <span className="text-sm px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
          Saldo: <b>{balance}</b>
        </span>
      </div>

      {/* Paket Top Up */}
      <div className="mt-6">
        {!hasClientKey ? (
          <p className="text-sm text-muted-foreground">
            (MIDTRANS belum dikonfigurasi: set{" "}
            <code>NEXT_PUBLIC_MIDTRANS_CLIENT_KEY</code> di
            <code>.env.local</code>)
          </p>
        ) : (
          <Packages />
        )}
      </div>

      {/* Riwayat */}
      <div className="mt-10">
        <h2 className="font-semibold">Riwayat Transaksi</h2>
        {txs && txs.length > 0 ? (
          <ul className="text-sm mt-3 space-y-1">
            {txs.map((t) => (
              <li key={t.order_id} className="flex items-center gap-3">
                <span className="w-48">
                  {new Date(t.created_at).toLocaleString()}
                </span>
                <span className="flex-1 truncate">{t.order_id}</span>
                <span className="w-28">Rp{t.amount}</span>
                <span className="w-24 uppercase">{t.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            Belum ada transaksi.
          </p>
        )}
      </div>
    </div>
  );
}
