import { z } from "zod";

/** Batasan string pendek (≤250) untuk yang "≤ 20 kata" versi MVP */
const shortText = z.string().max(250, "Maksimal 250 karakter").optional();

/** Core Schema - Field wajib untuk onboarding */
export const cvCoreSchema = z.object({
  // Biodata inti yang wajib
  date_of_birth: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Format tanggal tidak valid"),
  marital_status: z.string().min(1, "Status pernikahan wajib diisi"),
  domicile_province: z.string().min(1, "Domisili provinsi wajib diisi"),
  education: z.string().min(1, "Pendidikan wajib diisi"),
  job: z.string().min(1, "Pekerjaan wajib diisi"),
  income_range: z.string().min(1, "Range penghasilan wajib diisi"),
  height_cm: z.coerce
    .number()
    .int()
    .min(100, "Tinggi minimal 100 cm")
    .max(250, "Tinggi maksimal 250 cm"),
  weight_kg: z.coerce
    .number()
    .int()
    .min(30, "Berat minimal 30 kg")
    .max(200, "Berat maksimal 200 kg"),

  // Summary field wajib
  disease_history_summary: z
    .string()
    .min(1, "Riwayat penyakit wajib diisi")
    .max(250, "Maksimal 250 karakter"),
  partner_criteria_summary: z
    .string()
    .min(1, "Kriteria pasangan wajib diisi")
    .max(250, "Maksimal 250 karakter"),
});

/** Draft: semua opsional (akan diisi placeholder di actions bila kosong) */
export const CvDraftSchema = z.object({
  // biodata dasar
  date_of_birth: z.string().optional(), // yyyy-mm-dd
  marital_status: z.string().optional(),
  domicile_province: z.string().optional(),
  education: z.string().optional(),
  job: z.string().optional(),
  income_range: z.string().optional(),
  height_cm: z.coerce.number().int().min(0).max(300).optional().nullable(),
  weight_kg: z.coerce.number().int().min(0).max(500).optional().nullable(),

  // alamat & keluarga
  full_address: z.string().optional().nullable(),
  physical_description: shortText.nullable().optional(),
  child_order: z.coerce.number().int().min(0).max(20).optional().nullable(),
  siblings_count: z.coerce.number().int().min(0).max(20).optional().nullable(),
  parent_job: z.string().optional().nullable(),

  // ibadah
  prayer_habits: z.string().optional().nullable(),
  sunnah_prayer_habits: z.string().optional().nullable(),
  quran_reading_habits: z.string().optional().nullable(),
  quran_memorization: z.string().optional().nullable(),
  fasting_habits: z.string().optional().nullable(),
  islamic_studies: z.string().optional().nullable(),

  // preferensi pasangan
  partner_age_min: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  partner_age_max: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  partner_education: z.string().optional().nullable(),
  partner_income_range: z.string().optional().nullable(),
  partner_physical_description: shortText.nullable().optional(),

  // rencana pernikahan
  marriage_year_plan: z.coerce
    .number()
    .int()
    .min(2024)
    .max(2100)
    .optional()
    .nullable(),
  post_marriage_residence: z.string().optional().nullable(),
  marriage_vision: shortText.nullable().optional(),
  marriage_mission: shortText.nullable().optional(),

  // rangkuman (MVP)
  disease_history_summary: shortText.nullable().optional(),
  partner_criteria_summary: shortText.nullable().optional(),
});

/** Full Schema - Gabungan core + additional fields untuk CV lengkap */
export const cvFullSchema = CvDraftSchema.extend({
  date_of_birth: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal lahir tidak valid"),
  marital_status: z.string().min(1, "Wajib diisi"),
  domicile_province: z.string().min(1, "Wajib diisi"),
});

/** Submit Review: field minimal wajib sesuai MVP */
export const CvSubmitSchema = CvDraftSchema.extend({
  date_of_birth: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal lahir tidak valid"),
  marital_status: z.string().min(1, "Wajib diisi"),
  domicile_province: z.string().min(1, "Wajib diisi"),
});

// Type exports
export type CvCoreData = z.infer<typeof cvCoreSchema>;
export type CvDraftData = z.infer<typeof CvDraftSchema>;
export type CvFullData = z.infer<typeof cvFullSchema>;
export type CvSubmitData = z.infer<typeof CvSubmitSchema>;
