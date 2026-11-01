"use client";

import { createClient } from "@/lib/supabase/client-browser";
import { useRouter } from "next/navigation";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/"); // balik ke beranda setelah logout
    router.refresh();
  };

  return (
    <button onClick={onLogout} className={`text-sm underline ${className}`}>
      Logout
    </button>
  );
}
