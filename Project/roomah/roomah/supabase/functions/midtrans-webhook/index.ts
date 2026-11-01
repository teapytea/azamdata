import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function sha512Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-512", enc);
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  try {
    const notification = await req.json();
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SERVICE_ROLE_KEY");

    if (!serverKey || !supabaseUrl || !serviceRole) {
      return new Response("Missing environment", { status: 500 });
    }

    // Verifikasi signature: SHA512(order_id + status_code + gross_amount + server_key)
    const raw = `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`;
    const expected = await sha512Hex(raw);
    if (expected !== notification.signature_key) {
      return new Response("Invalid signature", { status: 403 });
    }

    const { order_id, transaction_status, fraud_status } = notification as {
      order_id: string;
      transaction_status: string;
      fraud_status?: string;
    };

    let newStatus: "posted" | "failed" | "expired" | "canceled" | null = null;

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "accept" || !fraud_status) {
        newStatus = "posted";
      } else if (fraud_status === "challenge") {
        newStatus = null; // Tetap pending untuk MVP
      }
    } else if (transaction_status === "cancel") newStatus = "canceled";
    else if (transaction_status === "deny") newStatus = "failed";
    else if (transaction_status === "expire") newStatus = "expired";

    if (newStatus) {
      const supabase = createClient(supabaseUrl, serviceRole);

      const { error } = await supabase
        .from("wallet_tx")
        .update({ status: newStatus })
        .eq("order_id", order_id)
        .eq("status", "pending"); // idempotent

      if (error) {
        console.error("Webhook DB update error:", error);
        return new Response("DB update failed", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("ERR", { status: 500 });
  }
});
