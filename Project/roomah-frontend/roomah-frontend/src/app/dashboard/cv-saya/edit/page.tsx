"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Combobox, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  PhotoIcon,
  UserCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Fragment } from "react";
import Link from "next/link";

type Province = { id: number; name: string };

// Definisikan state awal untuk form dengan nama kolom yang benar
const initialFormData = {
  full_name: "",
  gender: "",
  date_birth: "",
  job_title: "",
  education: "",
  domicile_prov: "",
  criteria: "",
  avatar_url: "",
};

export default function EditCvPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk upload avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // State untuk provinces
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [provinceQuery, setProvinceQuery] = useState("");

  // Word count untuk criteria
  const [wordCount, setWordCount] = useState(0);
  const maxWords = 200;

  // Fetch provinces dari Supabase
  useEffect(() => {
    const fetchProvinces = async () => {
      const { data } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");
      setProvinces(data || []);
    };
    fetchProvinces();
  }, [supabase]);

  const fetchExistingCv = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      const existingData = { ...initialFormData, ...data };
      setFormData(existingData);
      setIsEditing(true);

      // Set selected province berdasarkan data yang ada
      const matchedProvince = provinces.find(
        (p) => p.name === data.domicile_prov
      );
      if (matchedProvince) {
        setSelectedProvince(matchedProvince);
      }

      // Set word count untuk criteria
      const words = (data.criteria || "")
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount(words.length);
    }
    if (error && error.code !== "PGRST116") {
      setError("Gagal memuat data CV Anda.");
    }
    setIsLoading(false);
  }, [user, supabase, provinces]);

  useEffect(() => {
    if (provinces.length > 0) {
      fetchExistingCv();
    }
  }, [fetchExistingCv, provinces]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update word count untuk criteria
    if (name === "criteria") {
      const words = value.split(/\s+/).filter((word) => word.length > 0);
      setWordCount(words.length);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // --- VALIDASI TIPE FILE ---
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Tipe file tidak valid. Harap pilih file JPG, PNG, WEBP, atau SVG."
        );
        e.target.value = "";
        return;
      }

      // --- VALIDASI UKURAN FILE (1 MB) ---
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSizeInBytes) {
        alert("Ukuran file terlalu besar. Maksimal adalah 1 MB.");
        e.target.value = "";
        return;
      }

      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validasi word count
    if (wordCount > maxWords) {
      alert(
        `Deskripsi maksimal ${maxWords} kata. Saat ini: ${wordCount} kata.`
      );
      return;
    }

    setIsSubmitting(true);

    let finalAvatarUrl = formData.avatar_url;

    if (avatarFile) {
      setIsUploading(true);
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      setIsUploading(false);

      if (uploadError) {
        alert("Gagal mengunggah foto: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      finalAvatarUrl = publicUrl;
    }

    const dataToSubmit = {
      ...formData,
      avatar_url: finalAvatarUrl,
      domicile_prov: selectedProvince?.name || formData.domicile_prov,
    };

    delete (dataToSubmit as any).id;
    delete (dataToSubmit as any).created_at;

    try {
      if (isEditing) {
        const { error: updateError } = await supabase
          .from("cvs")
          .update(dataToSubmit)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
        alert("CV berhasil diperbarui!");
      } else {
        const dataToInsert = {
          ...dataToSubmit,
          user_id: user.id,
          status: "review" as const,
        };
        await supabase.from("cvs").insert([dataToInsert]);
        alert("CV berhasil dikirim dan sedang menunggu review!");
      }
      router.push("/dashboard/cv-saya");
      router.refresh();
    } catch (error: any) {
      alert(`Gagal menyimpan CV: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProvinces =
    provinceQuery === ""
      ? provinces
      : provinces.filter((prov) =>
          prov.name.toLowerCase().includes(provinceQuery.toLowerCase())
        );

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat form CV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dengan Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link
              href="/dashboard/cv-saya"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing
                  ? "Edit Biodata Ta'aruf"
                  : "Lengkapi Biodata Ta'aruf"}
              </h1>
              <p className="text-sm text-gray-500">
                Isilah data berikut dengan informasi yang benar dan jelas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="text-center pb-8 border-b border-gray-100">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                    <Image
                      src={
                        previewUrl ||
                        formData.avatar_url ||
                        (formData.gender === "Ikhwan"
                          ? "/images/avatar-ikhwan-placeholder.jpg"
                          : "/images/avatar-akhwat-placeholder.jpg")
                      }
                      alt="Preview Avatar"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <PhotoIcon className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    name="avatar"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Format: JPG, PNG, WEBP, SVG (Maks. 1 MB)
                </p>
                {isUploading && (
                  <p className="mt-2 text-blue-600 font-medium text-sm">
                    Mengunggah...
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nama Lengkap */}
                <div className="lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <UserCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Nama Lengkap (sesuai KTP){" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Masukkan nama lengkap sesuai KTP"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <UserCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Gender <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  >
                    <option value="">Pilih Gender</option>
                    <option value="Ikhwan">Ikhwan</option>
                    <option value="Akhwat">Akhwat</option>
                  </select>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Tanggal Lahir <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_birth"
                    required
                    value={formData.date_birth || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  />
                </div>

                {/* Pekerjaan */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Pekerjaan Saat Ini{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    required
                    value={formData.job_title || ""}
                    onChange={handleChange}
                    placeholder="Contoh: Software Developer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Pendidikan */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Pendidikan Terakhir{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="education"
                    required
                    value={formData.education || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  >
                    <option value="">Pilih Pendidikan</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>

                {/* Domisili Provinsi */}
                <div className="lg:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Provinsi Domisili{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Combobox
                    value={selectedProvince}
                    onChange={(prov) => {
                      setSelectedProvince(prov);
                      setFormData((prev) => ({
                        ...prev,
                        domicile_prov: prov?.name || "",
                      }));
                    }}
                  >
                    <div className="relative">
                      <div className="relative w-full overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors bg-white">
                        <Combobox.Input
                          className="w-full bg-transparent border-0 outline-none ring-0 shadow-none py-3 pl-4 pr-12 text-gray-900 placeholder-gray-400"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                          onChange={(e) => setProvinceQuery(e.target.value)}
                          displayValue={(p: Province) => p?.name || ""}
                          placeholder="Cari dan pilih provinsi domisili"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setProvinceQuery("")}
                      >
                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 border border-gray-200 focus:outline-none">
                          {filteredProvinces.length === 0 &&
                          provinceQuery !== "" ? (
                            <div className="py-3 px-4 text-gray-500 text-center text-sm">
                              Tidak ada hasil ditemukan
                            </div>
                          ) : (
                            filteredProvinces.slice(0, 50).map((prov) => (
                              <Combobox.Option
                                key={prov.id}
                                value={prov}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                                    active
                                      ? "bg-blue-50 text-blue-900"
                                      : "text-gray-900"
                                  }`
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {prov.name}
                                    </span>
                                    {selected && (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? "text-blue-600"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        <CheckIcon className="h-5 w-5" />
                                      </span>
                                    )}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>
                </div>
              </div>

              {/* Deskripsi Diri */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                    Deskripsi Diri, Visi Misi, Kriteria{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <span
                    className={`text-sm font-medium ${
                      wordCount > maxWords
                        ? "text-red-600"
                        : wordCount > maxWords * 0.8
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {wordCount}/{maxWords} kata
                  </span>
                </div>
                <textarea
                  name="criteria"
                  rows={5}
                  required
                  value={formData.criteria || ""}
                  onChange={handleChange}
                  placeholder="Ceritakan tentang diri Anda, visi pernikahan, dan kriteria pasangan yang Anda cari..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-gray-900 placeholder-gray-400 resize-vertical ${
                    wordCount > maxWords
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  } bg-white`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal {maxWords} kata. Jelaskan secara singkat dan jelas
                  tentang diri Anda.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting || wordCount > maxWords}
                  className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : isEditing ? (
                    "Simpan Perubahan"
                  ) : (
                    "Simpan & Kirim CV"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
