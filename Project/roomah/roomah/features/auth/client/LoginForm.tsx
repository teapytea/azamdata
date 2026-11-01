"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client-browser";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/cv-saya";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // jangan auto-redirect ke /register; tampilkan pesan di sini saja
        setErr(error.message || "Login gagal");
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 rounded-md border bg-neutral-50 px-3"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium">Password</label>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-md border bg-neutral-50 px-3 pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto text-sm"
            aria-label="Toggle password"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-md bg-green-600 text-white font-semibold"
      >
        {loading ? "Memproses..." : "Login"}
      </button>
    </form>
  );
}
