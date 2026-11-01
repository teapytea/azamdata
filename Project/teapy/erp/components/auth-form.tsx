"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff, Leaf, Loader2, LogIn, ShieldCheck } from "lucide-react";
import type { Result } from "@/lib/action";

export function AuthCard({ tagline, eyebrow, title, description, action, extra, submit = "Login", fields, footer, onDone }: {
  tagline: string; eyebrow: string; title: string; description: string;
  action: (input: any) => Promise<Result<{ next: string }>>;
  extra?: Record<string, string>; submit?: string;
  fields: { name: string; label: string; type?: string; autoComplete?: string }[];
  footer?: ReactNode; onDone?: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await action({ ...Object.fromEntries(new FormData(e.currentTarget)), ...extra });
      if (!res.ok) { setError(res.error); return; }
      onDone?.();
      window.location.assign(res.data.next);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-cream to-surface px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Leaf size={22} className="text-maroon" />
        <span className="font-brand text-[24px] font-bold tracking-tight text-maroon">teapy</span>
        <span className="mono ml-2 border-l border-hair pl-3 tracking-[.1em] text-soft">{tagline}</span>
      </div>
      <main className="w-full max-w-[400px] rounded-xl bg-paper p-8 shadow-sm">
        <div className="mb-5 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mid text-maroon"><ShieldCheck size={22} /></span>
          <p className="micro mb-2">{eyebrow}</p>
          <h1 className="text-[24px] font-semibold tracking-tight text-maroon">{title}</h1>
          <p className="muted mt-1">{description}</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {fields.map((f) => (
            <label key={f.name} className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-maroon">{f.label}</span>
              <span className="relative">
                <input required name={f.name} autoComplete={f.autoComplete} className="input pr-9"
                  type={f.type === "password" && show ? "text" : f.type || "text"} />
                {f.type === "password" && (
                  <button type="button" aria-label={show ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShow(!show)} className="absolute right-2 top-2.5 text-soft">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </span>
            </label>
          ))}
          {error && <p role="alert" className="flex items-start gap-1.5 rounded bg-danger-soft px-3 py-2 text-[12px] text-[#93000a]"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error}</p>}
          <button className="btn btn-primary mt-1 h-10" disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}{submit}
          </button>
        </form>
        {footer && <div className="muted mt-5 border-t border-line pt-4 text-center text-[12px]">{footer}</div>}
      </main>
      <p className="mono mt-6 tracking-[.1em] text-soft">TEAPY · BACK TO ESSENCE</p>
    </div>
  );
}
