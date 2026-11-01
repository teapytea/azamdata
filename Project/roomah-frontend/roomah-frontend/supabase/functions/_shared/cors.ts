// supabase/functions/_shared/cors.ts

// Header ini secara eksplisit mengizinkan permintaan dari domain mana pun (*),
// mengizinkan metode POST dan OPTIONS, serta header yang dibutuhkan oleh Supabase Auth.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Izinkan semua origin
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Izinkan metode yang kita butuhkan
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
