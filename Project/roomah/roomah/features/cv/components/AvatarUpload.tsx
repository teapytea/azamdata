"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client-browser";
import { updateAvatarPath } from "@/app/(app)/cv-saya/actions";

export default function AvatarUpload({
  currentPath,
}: {
  currentPath?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext ?? "jpg"}`;

      // upsert = true -> ganti file lama
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const res = await updateAvatarPath(path);
      if (!res?.ok) throw new Error(res?.message || "Gagal set avatar path");
    } catch (err) {
      console.error(err);
      alert("Upload avatar gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-1">Foto Profil</label>
      <input type="file" accept="image/*" onChange={onChange} disabled={busy} />
      {currentPath ? (
        <p className="text-xs text-muted-foreground mt-1">
          Tersimpan: {currentPath}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">Belum ada foto</p>
      )}
    </div>
  );
}
