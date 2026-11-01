"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client-browser";

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    if (pwd !== cpwd) {
      setErr("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setErr(error.message || "Registrasi gagal");
        return;
      }

      // pastikan nama juga ada di profiles (aman bila sudah ada trigger)
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", data.user.id);
      }

      // alur kita: register -> onboarding 5Q
      router.push("/onboarding/verify");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Nama */}
      <div>
        <label className="block text-sm font-medium">Nama Lengkap</label>
        <input
          name="full_name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full h-12 rounded-md border bg-neutral-50 px-3"
        />
      </div>

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

      {/* Password + Confirm */}
      <div>
        <label className="block text-sm font-medium">Password</label>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full h-12 rounded-md border bg-neutral-50 px-3 pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto text-sm"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Konfirmasi Password</label>
        <input
          name="confirm_password"
          type={show ? "text" : "password"}
          required
          value={cpwd}
          onChange={(e) => setCpwd(e.target.value)}
          className="w-full h-12 rounded-md border bg-neutral-50 px-3"
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-md bg-green-600 text-white font-semibold"
      >
        {loading ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}
