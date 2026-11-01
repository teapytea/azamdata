"use server";

import { createClient } from "@/lib/supabase/client-server";
import { revalidatePath } from "next/cache";

const TAARUF_COST = 10; // koin untuk ajukan

async function ensureWallet(supabase: any, uid: string) {
  const { data } = await supabase
    .from("wallets")
    .select("user_id")
    .eq("user_id", uid)
    .maybeSingle();

  if (!data) {
    await supabase.from("wallets").insert({ user_id: uid, balance: 0 });
  }
}

export async function createRequest(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Anda harus login." };
  if (user.id === targetUserId)
    return {
      success: false,
      message: "Tidak bisa mengajukan ke diri sendiri.",
    };

  // Kedua pihak harus punya CV approved
  const { data: cvs, error: cvErr } = await supabase
    .from("cvs")
    .select("user_id,status")
    .in("user_id", [user.id, targetUserId]);

  if (
    cvErr ||
    !cvs ||
    cvs.length !== 2 ||
    cvs.some((c) => c.status !== "approved")
  ) {
    return {
      success: false,
      message: "Kedua pihak harus memiliki CV yang disetujui.",
    };
  }

  // Cegah duplikasi pending A↔B
  const { data: dup } = await supabase
    .from("taaruf_requests")
    .select("id")
    .or(
      `and(requester_id.eq.${user.id},target_user_id.eq.${targetUserId},status.eq.pending),` +
        `and(requester_id.eq.${targetUserId},target_user_id.eq.${user.id},status.eq.pending)`
    )
    .maybeSingle();

  if (dup) {
    return {
      success: false,
      message: "Sudah ada permintaan pending antara kalian.",
    };
  }

  // Pastikan wallet ada & saldo cukup
  await ensureWallet(supabase, user.id);

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!wallet || wallet.balance < TAARUF_COST) {
    return { success: false, message: "Koin tidak cukup." };
  }

  // Debit koin internal (diizinkan RLS "users_spend_feature")
  const { error: debitErr } = await supabase.from("wallet_tx").insert({
    user_id: user.id,
    amount: TAARUF_COST,
    kind: "debit",
    source: "spend_feature",
    status: "posted", // trigger wallet akan langsung mengurangi saldo & set posted_at
    note: `Ajukan taaruf ke ${targetUserId.slice(0, 8)}`,
  });
  if (debitErr) {
    return { success: false, message: "Gagal mengurangi koin." };
  }

  // Buat permintaan
  const { error: reqErr } = await supabase.from("taaruf_requests").insert({
    requester_id: user.id,
    target_user_id: targetUserId,
  });
  if (reqErr) {
    return { success: false, message: "Gagal membuat permintaan." };
  }

  revalidatePath("/koin");
  revalidatePath("/taaruf");
  return { success: true, message: "Permintaan terkirim." };
}

export async function acceptRequest(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("taaruf_requests")
    .update({ status: "accepted", decided_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, message: "Gagal menerima permintaan." };
  revalidatePath("/taaruf");
  return { success: true, message: "Permintaan diterima." };
}

export async function rejectRequest(id: number, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("taaruf_requests")
    .update({ status: "rejected", note, decided_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, message: "Gagal menolak permintaan." };
  revalidatePath("/taaruf");
  return { success: true, message: "Permintaan ditolak." };
}

export async function cancelRequest(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("taaruf_requests")
    .update({ status: "cancelled", decided_at: new Date().toISOString() })
    .eq("id", id);

  if (error)
    return { success: false, message: "Gagal membatalkan permintaan." };
  revalidatePath("/taaruf");
  return { success: true, message: "Permintaan dibatalkan." };
}
