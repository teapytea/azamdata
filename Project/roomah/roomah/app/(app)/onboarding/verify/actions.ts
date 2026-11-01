"use server";
import { createClient } from "@/lib/supabase/client-server";
import { VerificationSchema } from "@/lib/validators/onboarding";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitVerification(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const rawData = Object.fromEntries(formData.entries());
  const validation = VerificationSchema.safeParse(rawData);

  if (!validation.success) {
    throw new Error("Invalid form data.");
  }

  const { error } = await supabase
    .from("onboarding_verifications")
    .upsert({ user_id: user.id, ...validation.data });

  if (error) {
    console.error("Error saving verification:", error);
    throw new Error("Could not save verification results.");
  }

  // Jika ada jawaban "tidak", MVP tetap meloloskan, tapi di masa depan bisa redirect ke halaman edukasi.
  // const allYes = Object.values(validation.data).every(Boolean);

  revalidatePath("/onboarding/verify");
  redirect("/onboarding/cv");
}
