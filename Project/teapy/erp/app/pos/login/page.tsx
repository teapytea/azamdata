import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-form";
import { loginAction } from "@/app/auth-actions";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PosLogin() {
  const user = await currentUser();
  if (user && (["owner", "admin", "cashier"].includes(user.role) || user.pos_access)) redirect("/pos");
  return (
    <AuthCard tagline="POS / CASHIER" eyebrow="Cashier Workspace" title="Masuk ke Kasir Teapy" description="Gunakan akun Kasir atau Admin penuh."
      action={loginAction} extra={{ mode: "pos" }}
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]} />
  );
}
