// src/components/cv/sections/AvatarUpload.tsx (UPDATED)
"use client";

import { memo, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { UserCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CvFormData } from "../FormProvider";
import { useAuth } from "@/context/AuthContext"; // <-- Import AuthContext
import { uploadAvatar } from "@/lib/supabase/storage"; // <-- Import helper baru

function AvatarUpload() {
  const { watch, setValue } = useFormContext<CvFormData>();
  const { user } = useAuth(); // <-- Dapatkan user
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = watch("avatar_url");

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!user) {
        alert("Sesi tidak valid. Silakan login ulang.");
        return;
      }

      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB

      if (!allowedTypes.includes(file.type)) {
        setError("Tipe file tidak valid. Pilih JPG, PNG, atau WEBP.");
        return;
      }
      if (file.size > maxSizeInBytes) {
        setError("Ukuran file maksimal 1 MB.");
        return;
      }

      setError(null);
      setIsUploading(true);
      console.log("Mulai mengunggah file...");

      try {
        // Gunakan helper untuk mengunggah dan mendapatkan URL
        const publicUrl = await uploadAvatar(user.id, file);

        // Simpan URL PERMANEN ke form state
        console.log("Upload berhasil! URL Publik:", publicUrl);
        setValue("avatar_url", publicUrl, { shouldDirty: true });
      } catch (uploadError: any) {
        console.error("GAGAL MENGUNGGAH:", uploadError); // <-- PENTING UNTUK DEBUG
        setError(uploadError.message || "Gagal mengunggah foto. Cek console.");
      } finally {
        setIsUploading(false);
        // Kosongkan input file agar bisa memilih file yang sama lagi
        e.target.value = "";
      }
    },
    [setValue, user]
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl">
      <div className="relative">
        <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl bg-slate-100">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
            </div>
          )}
        </div>
        <label
          htmlFor="avatarFile"
          className="absolute -bottom-1 -right-1 h-6 w-6 cursor-pointer rounded-full bg-green-600 p-1 text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-all duration-200"
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <PencilIcon className="h-4 w-4" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            id="avatarFile"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-slate-900">Foto Profil</p>
        <p className="text-xs text-slate-600">JPG, PNG, WEBP (Maks. 1 MB)</p>
        {isUploading && (
          <p className="text-xs text-green-600 animate-pulse">Mengunggah...</p>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}

export default memo(AvatarUpload);
