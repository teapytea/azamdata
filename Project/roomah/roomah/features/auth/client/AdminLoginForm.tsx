"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client-browser";

export default function AdminLoginForm() {
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setMsg(error.message);
    router.push(next);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            className="border px-2 py-1 rounded"
          />
        </label>
        <label className="block">
          <span>Password</span>
          <input
            type="password"
            name="password"
            required
            className="border px-2 py-1 rounded"
          />
        </label>
        <button className="bg-primary text-primary-foreground px-3 py-2 rounded">
          Login Admin
        </button>
      </form>
      {msg && <p className="text-destructive">{msg}</p>}
    </div>
  );
}
