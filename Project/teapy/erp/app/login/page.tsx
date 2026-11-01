import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-form";
import { loginAction } from "@/app/auth-actions";
import { currentUser, homeFor } from "@/lib/auth";
import { one } from "@/lib/db";

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect(homeFor(user.role));
  if (!(await one("select id from users where role = 'owner' limit 1"))) redirect("/setup");
  return (
    <AuthCard tagline="OPERATING SYSTEM" eyebrow="Teapy Workspace" title="Masuk ke Teapy" description="Gunakan email dan password akun admin Anda."
      action={loginAction} extra={{ mode: "erp" }}
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]}
      footer={<>Lupa password owner? <Link href="/recover" className="font-medium text-maroon underline">Pulihkan akun</Link><br />Karyawan? <Link href="/karyawan/login" className="font-medium text-maroon underline">Masuk ke portal karyawan</Link></>} />
  );
}
