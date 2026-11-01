// src/lib/supabase/storage.ts
import { createClient } from "./client";

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createClient();

  // 1. Buat path file yang unik untuk menghindari konflik
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  // 2. Unggah file ke bucket 'avatars'
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Gagal mengunggah avatar.");
  }

  // 3. Dapatkan URL publik dari file yang baru diunggah
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error("Gagal mendapatkan URL publik avatar.");
  }

  return data.publicUrl;
}
