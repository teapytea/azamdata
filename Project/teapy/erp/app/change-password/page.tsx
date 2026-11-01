import { AuthCard } from "@/components/auth-form";
import { changePasswordAction } from "@/app/auth-actions";
import { requirePage } from "@/lib/auth";

export default async function ChangePasswordPage() {
  await requirePage(["owner", "admin", "marketing", "cashier", "employee"]);
  return (
    <AuthCard tagline="OPERATING SYSTEM" eyebrow="Akun" title="Ganti password" description="Gunakan password yang hanya Anda ketahui."
      action={changePasswordAction} submit="Simpan password"
      fields={[
        { name: "current", label: "Password saat ini", type: "password", autoComplete: "current-password" },
        { name: "password", label: "Password baru (min. 8 karakter)", type: "password", autoComplete: "new-password" },
        { name: "confirm", label: "Ulangi password baru", type: "password", autoComplete: "new-password" },
      ]} />
  );
}
