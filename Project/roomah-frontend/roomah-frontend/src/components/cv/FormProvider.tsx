"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useForm, FormProvider as RHFProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Zod Schema (tidak ada perubahan)
const cvSchema = z.object({
  id: z.string().uuid().optional(), // Tambahkan ID untuk pengecekan yang lebih baik
  // Basic Info
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  unique_code: z.string().optional(),
  gender: z.string().min(1, "Gender harus dipilih"),
  date_birth: z.string().min(1, "Tanggal lahir harus diisi"),
  job_title: z.string().optional(),
  education: z.string().optional(),
  domicile_prov: z.string().optional(),
  criteria: z.string().optional(),
  avatar_url: z.string().optional(),
  status: z.string().optional(),
  marital_status: z.string().optional(),

  // Extended Biodata Fields
  origin_area: z.string().max(200, "Maksimal 200 karakter").optional(),
  income_level: z.string().optional(),
  height: z.coerce
    .number()
    .min(100)
    .max(250, "Tinggi tidak realistis")
    .optional()
    .nullable(),
  weight: z.coerce
    .number()
    .min(30)
    .max(200, "Berat tidak realistis")
    .optional()
    .nullable(),
  physical_traits: z.string().max(300, "Maksimal 20 kata").optional(),
  medical_history: z.string().max(300, "Maksimal 20 kata").optional(),
  child_position: z.coerce.number().min(1).max(20).optional().nullable(),
  total_siblings: z.coerce.number().min(1).max(20).optional().nullable(),
  parent_occupation: z.string().max(100, "Maksimal 100 karakter").optional(),

  // Ibadah fields
  fard_prayer: z.string().optional(),
  sunnah_prayer: z.string().max(200, "Maksimal 200 karakter").optional(),
  quran_reading: z.string().optional(),
  quran_memorization: z.string().max(100, "Maksimal 100 karakter").optional(),
  fasting: z.string().max(200, "Maksimal 200 karakter").optional(),
  religious_study: z.string().max(300, "Maksimal 20 kata").optional(),

  // Partner Criteria fields
  partner_min_age: z.coerce.number().min(17).max(60).optional().nullable(),
  partner_max_age: z.coerce.number().min(17).max(70).optional().nullable(),
  partner_education: z.string().optional(),
  partner_income: z.string().optional(),
  partner_origin: z.string().max(100, "Maksimal 100 karakter").optional(),
  partner_physical_traits: z.string().max(300, "Maksimal 20 kata").optional(),
  partner_min_height: z.coerce.number().min(100).max(250).optional().nullable(),
  partner_special_criteria: z.string().max(300, "Maksimal 20 kata").optional(),

  // Marriage Plans
  marriage_year: z.coerce
    .number()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 10)
    .optional()
    .nullable(),
  residence_plan: z.string().optional(),
  marriage_vision_mission: z.string().max(300, "Maksimal 20 kata").optional(),
});

export type CvFormData = z.infer<typeof cvSchema>;

const defaultValues: Partial<CvFormData> = {
  full_name: "",
  gender: "",
  date_birth: "",
  job_title: "",
  education: "",
  domicile_prov: "",
  criteria: "",
  avatar_url: "",
  marital_status: "Single (Belum menikah)",
  origin_area: "",
  income_level: "",
  physical_traits: "",
  medical_history: "",
  parent_occupation: "",
  fard_prayer: "",
  sunnah_prayer: "",
  quran_reading: "",
  quran_memorization: "",
  fasting: "",
  religious_study: "",
  partner_education: "",
  partner_income: "",
  partner_origin: "",
  partner_physical_traits: "",
  partner_special_criteria: "",
  residence_plan: "",
  marriage_vision_mission: "",
};

// 1. Definisikan tipe untuk status submit
type SubmissionStatus = "idle" | "success" | "error";

// 2. Perbarui tipe Context untuk menyertakan status
interface FormContextType {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleAjukanPosting: () => Promise<void>;
  submissionStatus: SubmissionStatus;
}

const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within FormProvider");
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const { user } = useAuth();
  const router = useRouter();

  // 3. Buat state untuk melacak status submit
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");

  const methods = useForm<CvFormData>({
    resolver: zodResolver(cvSchema),
    defaultValues,
    mode: "onChange",
  });

  const { reset } = methods;

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const { data } = await createClient()
          .from("cvs")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (data) {
          reset(data);
        }
      } catch (error) {
        // Tidak perlu console.error di sini karena error wajar jika CV belum ada
      }
    };
    loadData();
  }, [user, reset]);

  // 4. Modifikasi fungsi submit untuk mengelola state status
  const handleFormSubmit = async (data: CvFormData) => {
    if (!user) {
      alert("Sesi tidak valid, silakan login ulang.");
      setSubmissionStatus("error");
      return;
    }

    setSubmissionStatus("idle"); // Reset status setiap kali submit dimulai

    try {
      const { id, ...formData } = data;
      const dataToSubmit = {
        ...formData,
        user_id: user.id,
        status: data.status === "approve" ? "approve" : "review", // Pertahankan status approve jika sudah
      };

      if (id) {
        // Pengecekan berdasarkan ID dari form
        const { error } = await createClient()
          .from("cvs")
          .update(dataToSubmit)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await createClient()
          .from("cvs")
          .insert([dataToSubmit]);
        if (error) throw error;
      }

      setSubmissionStatus("success"); // Set status sukses
      setTimeout(() => setSubmissionStatus("idle"), 3000); // Reset pesan sukses setelah 3 detik
      router.refresh(); // Refresh data di halaman
    } catch (error: any) {
      console.error("Gagal menyimpan CV:", error);
      setSubmissionStatus("error"); // Set status error
      alert(`Gagal menyimpan CV: ${error.message}`); // Tetap tampilkan alert untuk error
    }
  };

  const handleAjukanPosting = async () => {
    const cvId = methods.getValues("id");
    if (!cvId || !user) return;

    if (
      !window.confirm(
        "Anda yakin ingin mengajukan CV ini untuk ditampilkan di media sosial?"
      )
    ) {
      return;
    }

    try {
      const { error } = await createClient()
        .from("cvs")
        .update({ social_media_status: "siap_posting" })
        .eq("id", cvId);
      if (error) throw error;
      alert("CV Anda berhasil dikirim ke antrian posting!");
      router.refresh();
    } catch (error: any) {
      alert("Gagal mengajukan posting: " + error.message);
    }
  };

  // 5. Kirim status dan fungsi submit yang sudah dibungkus ke dalam context
  const contextValue: FormContextType = {
    handleSubmit: methods.handleSubmit(handleFormSubmit),
    handleAjukanPosting,
    submissionStatus,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <RHFProvider {...methods}>{children}</RHFProvider>
    </FormContext.Provider>
  );
}
