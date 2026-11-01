"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client-server";
import { CvSubmitSchema, CvDraftSchema } from "@/lib/validators/cv";

/** Placeholder untuk kolom NOT NULL (dari U1) saat draft kosong */
const DRAFT_PLACEHOLDERS = {
  date_of_birth: "1970-01-01",
  domicile_province: "Belum diisi",
};

async function getUserAndClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function mapFormToPayload(form: FormData) {
  const raw = Object.fromEntries(form);

  const payload: any = {
    // dasar
    date_of_birth: String(raw.date_of_birth ?? ""),
    domicile_province: String(raw.domicile_province ?? ""),
    marital_status: String(raw.marital_status ?? ""),
    education: String(raw.education ?? ""),
    job: String(raw.job ?? ""),
    income_range: String(raw.income_range ?? ""),

    height_cm: raw.height_cm ? Number(raw.height_cm) : null,
    weight_kg: raw.weight_kg ? Number(raw.weight_kg) : null,

    // alamat & keluarga
    full_address: raw.full_address ? String(raw.full_address) : null,
    physical_description: raw.physical_description
      ? String(raw.physical_description)
      : null,
    child_order: raw.child_order ? Number(raw.child_order) : null,
    siblings_count: raw.siblings_count ? Number(raw.siblings_count) : null,
    parent_job: raw.parent_job ? String(raw.parent_job) : null,

    // ibadah
    prayer_habits: raw.prayer_habits ? String(raw.prayer_habits) : null,
    sunnah_prayer_habits: raw.sunnah_prayer_habits
      ? String(raw.sunnah_prayer_habits)
      : null,
    quran_reading_habits: raw.quran_reading_habits
      ? String(raw.quran_reading_habits)
      : null,
    quran_memorization: raw.quran_memorization
      ? String(raw.quran_memorization)
      : null,
    fasting_habits: raw.fasting_habits ? String(raw.fasting_habits) : null,
    islamic_studies: raw.islamic_studies ? String(raw.islamic_studies) : null,

    // preferensi pasangan
    partner_age_min: raw.partner_age_min ? Number(raw.partner_age_min) : null,
    partner_age_max: raw.partner_age_max ? Number(raw.partner_age_max) : null,
    partner_education: raw.partner_education
      ? String(raw.partner_education)
      : null,
    partner_income_range: raw.partner_income_range
      ? String(raw.partner_income_range)
      : null,
    partner_physical_description: raw.partner_physical_description
      ? String(raw.partner_physical_description)
      : null,

    // rencana pernikahan
    marriage_year_plan: raw.marriage_year_plan
      ? Number(raw.marriage_year_plan)
      : null,
    post_marriage_residence: raw.post_marriage_residence
      ? String(raw.post_marriage_residence)
      : null,
    marriage_vision: raw.marriage_vision ? String(raw.marriage_vision) : null,
    marriage_mission: raw.marriage_mission
      ? String(raw.marriage_mission)
      : null,

    // rangkuman (MVP)
    disease_history_summary: raw.disease_history_summary
      ? String(raw.disease_history_summary)
      : null,
    partner_criteria_summary: raw.partner_criteria_summary
      ? String(raw.partner_criteria_summary)
      : null,
  };

  return payload;
}

/** Pastikan baris CV milik user ada (kalau kosong, buat draft minimal) */
async function ensureCvRow(supabase: any, userId: string) {
  const { data: existing } = await supabase
    .from("cvs")
    .select("id, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("cvs").insert({
      user_id: userId,
      status: "draft",
      date_of_birth: DRAFT_PLACEHOLDERS.date_of_birth,
      domicile_province: DRAFT_PLACEHOLDERS.domicile_province,
    });
  }
}

export async function saveDraftCv(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  await ensureCvRow(supabase, user.id);

  const candidate = mapFormToPayload(formData);
  const parsed = CvDraftSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Draft tidak valid (parsial)." };
  }

  // placeholder NOT NULL
  if (!parsed.data.date_of_birth)
    parsed.data.date_of_birth = DRAFT_PLACEHOLDERS.date_of_birth;
  if (!parsed.data.domicile_province)
    parsed.data.domicile_province = DRAFT_PLACEHOLDERS.domicile_province;

  const { error } = await supabase
    .from("cvs")
    .update({
      ...parsed.data,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("saveDraftCv error:", error);
    return { ok: false, message: error.message };
  }

  revalidatePath("/cv-saya");
  return { ok: true, message: "Draf disimpan." };
}

export async function submitCvForReview(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  await ensureCvRow(supabase, user.id);

  const candidate = mapFormToPayload(formData);
  const parsed = CvSubmitSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Data tidak valid. Harap lengkapi field wajib.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from("cvs")
    .update({
      ...parsed.data,
      status: "review",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("submitCvForReview error:", error);
    return { ok: false, message: error.message };
  }

  revalidatePath("/cv-saya");
  return { ok: true, message: "CV diajukan untuk review." };
}

export async function updateAvatarPath(path: string) {
  const { supabase, user } = await getUserAndClient();
  const { error } = await supabase
    .from("cvs")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/cv-saya");
  return { ok: true };
}

export async function updateProfileName(full_name: string) {
  const { supabase, user } = await getUserAndClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/cv-saya");
  return { ok: true };
}
