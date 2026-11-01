// supabase/functions/create-midtrans-transaction/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle preflight request for CORS. Ini penting untuk keamanan browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[INFO] Function 'create-midtrans-transaction' invoked.");
    const { packageId } = await req.json();
    if (!packageId) {
      throw new Error("Package ID is required in the request body.");
    }
    console.log(`[INFO] Received packageId: ${packageId}`);

    // 1. Buat klien Supabase yang bisa meneruskan otentikasi pengguna dari frontend.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 2. Dapatkan data pengguna yang sedang login. Middleware memastikan ini aman.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found. Invalid or expired token.");
    }
    console.log(`[INFO] Authenticated user: ${user.email}`);

    // 3. Buat klien Supabase dengan hak akses admin (service_role) untuk operasi database yang aman.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4. Ambil detail paket dari database kita (jangan pernah percaya harga/info dari client).
    console.log("[INFO] Fetching package details from database...");
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from("coin_packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (packageError || !packageData) {
      throw new Error(`Package with ID ${packageId} not found.`);
    }
    console.log(
      `[INFO] Package found: ${packageData.name} (Price: ${packageData.price})`
    );

    // 5. Buat entri transaksi di database kita dengan status 'pending'.
    const orderId = `RMH-${user.id.substring(0, 6)}-${Date.now()}`;
    console.log(`[INFO] Creating transaction record with Order ID: ${orderId}`);

    const { error: insertError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: user.id,
        package_id: packageData.id,
        amount_paid: packageData.price,
        coins_purchased: packageData.coins_amount,
        status: "pending",
        payment_gateway_id: orderId,
      });

    if (insertError) {
      throw new Error(
        "Failed to create transaction record: " + insertError.message
      );
    }
    console.log("[INFO] Transaction record created successfully.");

    // 6. Siapkan parameter untuk dikirim ke Midtrans API.
    const params = {
      transaction_details: {
        order_id: orderId,
        gross_amount: packageData.price,
      },
      customer_details: {
        email: user.email,
        // Anda bisa tambahkan `first_name` di sini jika ada di profil Anda
      },
      item_details: [
        {
          id: packageData.id,
          price: packageData.price,
          quantity: 1,
          name: packageData.name,
        },
      ],
      callbacks: {
        finish: `${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/dashboard/koin-saya`,
      },
    };

    // 7. Minta token transaksi ke Midtrans menggunakan Server Key yang rahasia.
    console.log("[INFO] Requesting transaction token from Midtrans...");
    const midtransServerKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;
    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Basic " + btoa(midtransServerKey + ":"), // Format otentikasi Basic Auth
        },
        body: JSON.stringify(params),
      }
    );

    const midtransData = await midtransResponse.json();
    if (!midtransResponse.ok) {
      throw new Error("Midtrans API Error: " + JSON.stringify(midtransData));
    }
    console.log("[SUCCESS] Midtrans token received.");

    // 8. Kirim kembali token ke frontend.
    return new Response(JSON.stringify({ token: midtransData.token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Jika terjadi error di mana pun di dalam blok try, tangkap di sini.
    console.error(
      "[FATAL] Error in create-midtrans-transaction:",
      error.message
    );
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500, // Gunakan status 500 untuk error server
    });
  }
});
