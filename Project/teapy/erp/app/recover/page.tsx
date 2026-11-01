import { AuthCard } from "@/components/auth-form";
import { recoverAction } from "@/app/auth-actions";

export default function RecoverPage() {
  return (
    <AuthCard tagline="OPERATING SYSTEM" eyebrow="Pemulihan" title="Pulihkan akun owner" description="Masukkan kode setup dari pengaturan server, lalu buat password baru."
      action={recoverAction} submit="Simpan password"
      fields={[
        { name: "token", label: "Kode setup", type: "password" },
        { name: "email", label: "Email owner", type: "email", autoComplete: "email" },
        { name: "password", label: "Password baru (min. 8 karakter)", type: "password", autoComplete: "new-password" },
        { name: "confirm", label: "Ulangi password baru", type: "password", autoComplete: "new-password" },
      ]} />
  );
}
