// src/lib/supabaseClient.ts
import { createBrowserClient } from "@supabase/ssr";

// Definisikan tipe untuk variabel environment agar TypeScript tidak error
// Anda mungkin sudah memiliki ini di file lain, tapi ini untuk memastikan
type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

// Pastikan Anda memiliki file .env.local dengan variabel ini
const env: SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

export const supabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
