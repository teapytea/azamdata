"use server";

import { createClient } from "@/lib/supabase/client-server";
import { revalidatePath } from "next/cache";
import { ulid } from "ulid";
import { TopUpSchema } from "@/lib/validators/wallet";

async function ensureWallet(supabase: any, userId: string) {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) {
    const { error } = await supabase
      .from("wallets")
      .insert({ user_id: userId, balance: 0 });
    if (error) throw new Error("Failed to init wallet");
  }
}

export async function createTopupIntent(amountRaw: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = TopUpSchema.safeParse({ amount: amountRaw });
  if (!parsed.success) {
    throw new Error(parsed.error.issues?.[0]?.message ?? "Invalid amount");
  }
  const amount = parsed.data.amount;

  await ensureWallet(supabase, user.id);

  const orderId = `TOPUP_${user.id.slice(0, 8)}_${ulid()}`;

  // 1) catat transaksi pending
  const { error: txError } = await supabase.from("wallet_tx").insert({
    user_id: user.id,
    order_id: orderId,
    amount,
    kind: "credit",
    source: "topup_request",
    status: "pending",
  });
  if (txError) throw new Error("Failed to create transaction record");

  // 2) panggil Edge Function untuk Snap token
  const { data, error: fnError } = await supabase.functions.invoke(
    "midtrans-create-snap",
    {
      body: {
        order_id: orderId,
        amount,
        full_name: user.user_metadata?.full_name || "User",
        email: user.email,
      },
    }
  );
  if (fnError) throw new Error("Failed to create payment intent");

  revalidatePath("/koin");
  return { token: data.token as string };
}
