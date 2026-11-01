import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import OnboardingCVForm, {
  type CvCoreData,
} from "@/features/cv/components/OnboardingCVForm";
import { saveOnboardingCv, skipCv } from "./actions";

export default async function Page() {
  // ⬇️ Next 15: dynamic API cookies() harus di-await
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // cukup read-only di server component
        get: (key: string) => cookieStore.get(key)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/cv");

  const { data: existingCv } = await supabase
    .from("cvs")
    .select(
      "date_of_birth, marital_status, domicile_province, education, job, income_range, height_cm, weight_kg, disease_history_summary, partner_criteria_summary"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <OnboardingCVForm
      initialData={existingCv as Partial<CvCoreData> | undefined}
      saveAction={saveOnboardingCv}
      skipAction={skipCv}
    />
  );
}
