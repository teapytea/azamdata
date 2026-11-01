"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cvCoreSchema } from "@/lib/validators/cv";

export async function saveOnboardingCv(fd: FormData) {
  // ⬇️ Next 15: await cookies()
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // di server action boleh read-only juga; set/remove tak dibutuhkan di sini
        get: (key: string) => cookieStore.get(key)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/cv");

  const raw = Object.fromEntries(fd);

  const parsed = cvCoreSchema.parse({
    date_of_birth: String(raw.date_of_birth ?? ""),
    marital_status: String(raw.marital_status ?? ""),
    domicile_province: String(raw.domicile_province ?? ""),
    education: String(raw.education ?? ""),
    job: String(raw.job ?? ""),
    income_range: String(raw.income_range ?? ""),
    height_cm: Number(raw.height_cm ?? 0),
    weight_kg: Number(raw.weight_kg ?? 0),
    disease_history_summary: String(raw.disease_history_summary ?? ""),
    partner_criteria_summary: String(raw.partner_criteria_summary ?? ""),
  });

  await supabase
    .from("cvs")
    .upsert({ user_id: user.id, ...parsed }, { onConflict: "user_id" });

  await supabase
    .from("profiles")
    .update({ is_onboarded: true })
    .eq("id", user.id);

  redirect("/cv-saya");
}

export async function skipCv() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({ is_onboarded: true })
      .eq("id", user.id);
  }
  redirect("/cv-saya");
}
