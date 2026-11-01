import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-form";
import { loginAction } from "@/app/auth-actions";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EmployeeLogin() {
  const user = await currentUser();
  if (user?.role === "employee") redirect("/karyawan");
  return (
    <AuthCard tagline="PEOPLE & CULTURE" eyebrow="Ruang Pribadi Karyawan" title="Portal Karyawan" description="Masuk dengan email dan password dari kontrak kerja Anda."
      action={loginAction} extra={{ mode: "employee" }}
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]}
      footer={<>Belum punya akun? <Link href="/kontrak-kerja" className="font-medium text-maroon underline">Tanda tangani kontrak kerja</Link><br />Lupa password? Hubungi admin Teapy.</>} />
  );
}
