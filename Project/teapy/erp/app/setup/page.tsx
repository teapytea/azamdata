import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-form";
import { setupAction } from "@/app/auth-actions";
import { one } from "@/lib/db";

export default async function SetupPage() {
  if (await one("select id from users where role = 'owner' limit 1")) redirect("/login");
  return (
    <AuthCard tagline="OPERATING SYSTEM" eyebrow="Setup Pertama" title="Buat akun owner" description="Masukkan kode setup dari pengaturan server, lalu buat akun owner."
      action={setupAction} submit="Buat akun"
      fields={[
        { name: "token", label: "Kode setup", type: "password" },
        { name: "name", label: "Nama", autoComplete: "name" },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Password (min. 8 karakter)", type: "password", autoComplete: "new-password" },
        { name: "confirm", label: "Ulangi password", type: "password", autoComplete: "new-password" },
      ]} />
  );
}
