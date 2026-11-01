import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Tipe data untuk notifikasi dari Midtrans
type MidtransNotification = {
  transaction_status:
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "expire"
    | "cancel";
  order_id: string;
  gross_amount: string;
};

serve(async (req) => {
  // Handle preflight request for CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const notification: MidtransNotification = await req.json();
    console.log(
      `[INFO] Received notification for order: ${notification.order_id} with status: ${notification.transaction_status}`
    );

    const { transaction_status, order_id } = notification;

    // Kita hanya proses transaksi yang statusnya berhasil
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      // Inisialisasi klien Supabase di dalam function menggunakan kunci Service Role yang aman
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // 1. Update status transaksi di tabel 'transactions' kita
      const { data: updatedTransaction, error: updateError } =
        await supabaseAdmin
          .from("transactions")
          .update({ status: "success" })
          .eq("payment_gateway_id", order_id)
          .select()
          .single();

      if (updateError || !updatedTransaction) {
        throw new Error(
          `[ERROR] Transaction with order_id ${order_id} not found or failed to update.`
        );
      }

      // 2. Tambahkan koin ke saldo pengguna dengan memanggil fungsi database
      const { error: rpcError } = await supabaseAdmin.rpc("add_coins_to_user", {
        user_id_input: updatedTransaction.user_id,
        coins_to_add: updatedTransaction.coins_purchased,
      });

      if (rpcError) {
        throw new Error(
          `[ERROR] Failed to add coins for user ${updatedTransaction.user_id}: ${rpcError.message}`
        );
      }

      console.log(
        `[SUCCESS] Processed order ${order_id}. ${updatedTransaction.coins_purchased} coins added to user ${updatedTransaction.user_id}.`
      );
    }

    return new Response(
      JSON.stringify({ message: "Notification processed successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[FATAL] Error processing webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
