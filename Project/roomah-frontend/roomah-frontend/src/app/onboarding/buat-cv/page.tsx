// src/app/onboarding/buat-cv/page.tsx (VERSI SUPABASE)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CreateCVPage() {
  const supabase = createClient();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dob: "",
    job: "",
    education: "",
    city: "",
    shortBio: "", // Akan masuk ke kolom 'criteria' atau 'bio'
    vision: "", // Bisa digabung ke 'criteria' atau kolom baru
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 1. Dapatkan user yang sedang login dari Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sesi Anda tidak valid. Silakan login kembali.");
      setIsSubmitting(false);
      // Arahkan ke login jika tidak ada user
      router.push("/login");
      return;
    }

    // 2. Siapkan data untuk dimasukkan ke tabel 'cvs'
    // Pastikan nama properti di sini SESUAI dengan nama kolom di tabel Anda
    const cvDataToInsert = {
      user_id: user.id, // Ambil dari sesi user
      full_name: formData.fullName,
      // 'unique_code' akan kita generate nanti, untuk sekarang bisa NULL
      // 'avatar_url' akan diisi saat ada fitur upload foto
      // 'status' sudah memiliki default 'menunggu_review'
      criteria: `Deskripsi: ${formData.shortBio}\n\nVisi Pernikahan: ${formData.vision}`, // Gabungkan 2 field
      job_title: formData.job,
      education: formData.education,
      domicile_prov: formData.city,
      date_birth: formData.dob,
      gender: formData.gender,
      // Anda punya kolom 'age', kita bisa biarkan NULL karena bisa dihitung dari dob
    };

    // 3. Panggil Supabase untuk menyimpan data
    const { error: insertError } = await supabase
      .from("cvs")
      .insert([cvDataToInsert]);

    if (insertError) {
      setError(`Gagal menyimpan CV: ${insertError.message}`);
      setIsSubmitting(false);
    } else {
      // 4. Jika berhasil, arahkan ke dashboard
      router.push("/dashboard/cv-saya");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-color px-4 pt-32 sm:pt-28 pb-12">
      <div className="w-full max-w-4xl p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Lengkapi Biodata {"Ta'aruf"} Anda
          </h1>
          <p className="text-text-secondary mt-2">
            Isilah data berikut dengan informasi yang benar dan jelas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAMA LENGKAP */}
            <div className="w-full">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-text-primary block mb-2"
              >
                Nama Lengkap (sesuai KTP){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>

            {/* GENDER (Tidak ada di state/tabel, Anda bisa tambahkan jika perlu) */}
            <div className="w-full">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-text-primary block mb-2"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                id="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white box-border appearance-none"
              >
                <option value="">Pilih Gender</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </select>
            </div>

            {/* TANGGAL LAHIR */}
            <div className="w-full">
              <label
                htmlFor="dob"
                className="text-sm font-medium text-text-primary block mb-2"
              >
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                id="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>

            {/* PEKERJAAN */}
            <div className="w-full">
              <label
                htmlFor="job"
                className="text-sm font-medium text-text-primary block mb-2"
              >
                Pekerjaan Saat Ini <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job"
                id="job"
                required
                value={formData.job}
                onChange={handleChange}
                placeholder="Contoh: Software Developer, Guru, Dokter"
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>

            {/* PENDIDIKAN */}
            <div className="w-full">
              <label
                htmlFor="education"
                className="text-sm font-medium text-text-primary block mb-2"
              >
                Pendidikan Terakhir <span className="text-red-500">*</span>
              </label>
              <select
                name="education"
                id="education"
                required
                value={formData.education}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white box-border appearance-none"
              >
                <option value="">Pilih Pendidikan</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            {/* KOTA DOMISILI */}
            <div className="w-full">
              <label
                htmlFor="city"
                className="text-sm font-medium text-text-primary block mb-2"
              >
                Kota Domisili <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                id="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Contoh: Jakarta, Bandung, Surabaya"
                className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border"
              />
            </div>
          </div>

          {/* DESKRIPSI SINGKAT */}
          <div className="w-full">
            <label
              htmlFor="shortBio"
              className="text-sm font-medium text-text-primary block mb-2"
            >
              Deskripsi Singkat Tentang Anda{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortBio"
              id="shortBio"
              rows={4}
              required
              value={formData.shortBio}
              onChange={handleChange}
              placeholder="Ceritakan tentang diri Anda, hobi, kepribadian, dan hal-hal yang ingin diketahui calon pasangan..."
              className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border resize-vertical"
            />
          </div>

          {/* VISI PERNIKAHAN */}
          <div className="w-full">
            <label
              htmlFor="vision"
              className="text-sm font-medium text-text-primary block mb-2"
            >
              Visi Pernikahan Anda <span className="text-red-500">*</span>
            </label>
            <textarea
              name="vision"
              id="vision"
              rows={4}
              required
              value={formData.vision}
              onChange={handleChange}
              placeholder="Bagaimana visi Anda tentang pernikahan dan keluarga yang ingin dibangun..."
              className="block w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary box-border resize-vertical"
            />
          </div>

          <div className="w-full pt-4 space-y-3">
            <button
              type="submit"
              className="block w-full px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-secondary transition-colors"
            >
              Simpan Biodata & Lanjutkan
            </button>
            {/* --- TOMBOL BARU DI SINI --- */}
            <Link
              href="/dashboard/cv-saya"
              className="block w-full text-center"
            >
              <button
                type="button" // Pastikan tipenya "button" agar tidak men-submit form
                className="w-full px-4 py-3 font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Lewati untuk Sekarang
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
