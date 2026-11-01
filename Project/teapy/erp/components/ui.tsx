"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import type { Result } from "@/lib/action";

/* Toast ------------------------------------------------------------------ */
export function toast(message: string, kind: "ok" | "error" = "ok") {
  window.dispatchEvent(new CustomEvent("teapy-toast", { detail: { message, kind } }));
}

export function Toaster() {
  const [item, setItem] = useState<{ message: string; kind: string } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setItem((e as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setItem(null), 4500);
    };
    window.addEventListener("teapy-toast", on);
    return () => window.removeEventListener("teapy-toast", on);
  }, []);
  if (!item) return null;
  return (
    <div role="status" className={`no-print fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 max-w-[90vw] rounded-lg px-4 py-2.5 text-[13px] font-medium shadow-lg ${item.kind === "error" ? "bg-danger text-white" : "bg-forest text-white"}`}>
      {item.message}
    </div>
  );
}

/* Menjalankan server action ---------------------------------------------- */
type Action<I = any, O = any> = (input: I) => Promise<Result<O>>;

export function useRun() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run<I, O>(action: Action<I, O>, input: I, success?: string): Promise<O | undefined> {
    setBusy(true);
    try {
      const res = await action(input);
      if (!res.ok) {
        toast(res.error, "error");
        return undefined;
      }
      if (success) toast(success);
      router.refresh();
      return res.data ?? (true as O);
    } catch {
      toast("Koneksi bermasalah. Periksa jaringan lalu coba lagi.", "error");
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  return { busy, run };
}

export function ActionButton({ action, input, success, confirm, className = "btn", children }: {
  action: Action; input?: unknown; success?: string; confirm?: string; className?: string; children: ReactNode;
}) {
  const { busy, run } = useRun();
  return (
    <button type="button" className={className} disabled={busy}
      onClick={() => { if (!confirm || window.confirm(confirm)) run(action, input, success); }}>
      {busy ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

/* Modal -------------------------------------------------------------------- */
export function Modal({ title, description, onClose, children, wide }: {
  title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(248,249,248,.8)] p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`card my-6 w-full border border-high shadow-xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
            {description && <p className="muted mt-0.5">{description}</p>}
          </div>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded p-1 hover:bg-mid"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function FormModal({ title, description, action, extra, success, submit = "Simpan", onClose, onDone, children, wide, danger }: {
  title: string; description?: string; action: Action; extra?: Record<string, unknown>; success?: string; submit?: string;
  onClose: () => void; onDone?: (data: any) => void; children: ReactNode; wide?: boolean; danger?: boolean;
}) {
  const { busy, run } = useRun();
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = await run(action, { ...Object.fromEntries(new FormData(e.currentTarget)), ...extra }, success);
    if (data !== undefined) {
      onDone?.(data);
      onClose();
    }
  }
  return (
    <Modal title={title} description={description} onClose={onClose} wide={wide}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {children}
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className="btn btn-flat" onClick={onClose}>Batal</button>
          <button className={danger ? "btn btn-danger" : "btn btn-primary"} disabled={busy}>
            {busy && <Loader2 size={14} className="animate-spin" />}{submit}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[12px] font-medium text-soft">{label}</span>
      {children}
      {hint && <span className="mono text-outline">{hint}</span>}
    </label>
  );
}

export function SearchBox({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="pointer-events-none absolute left-2.5 top-2.5 text-outline" />
      <input className="input search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="tablist">
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`tab ${value === t.id ? "tab-on" : ""}`}>{t.label}</button>
      ))}
    </div>
  );
}

export function PageHead({ crumb, tag, title, description, actions, right }: {
  crumb: string; tag?: string; title: string; description: string; actions?: ReactNode; right?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="mono flex items-center gap-1 text-soft">
          <span>Workspace</span><span className="text-hair">/</span><span className="font-medium text-maroon">{crumb}</span>
        </div>
        {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
      </div>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="flex max-w-3xl flex-col gap-1">
          {tag && <span className="micro self-start rounded bg-sand px-2 py-0.5 !text-[#51443d]">{tag}</span>}
          <h1 className="h-display">{title}</h1>
          <p className="text-[14px] leading-[22px] text-soft">{description}</p>
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </section>
  );
}

export function Kpi({ label, value, unit, note, icon, tone, children }: {
  label: string; value: ReactNode; unit?: string; note?: ReactNode; icon?: ReactNode; tone?: "red" | "moss"; children?: ReactNode;
}) {
  return (
    <div className="card flex flex-col justify-between gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className={`micro ${tone === "red" ? "!text-danger" : ""}`}>{label}</span>
        {icon && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-mid text-maroon">{icon}</span>}
      </div>
      <div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className={`text-[26px] font-semibold leading-tight tracking-tight ${tone === "red" ? "text-danger" : ""}`}>{value}</span>
          {unit && <span className="muted">{unit}</span>}
        </div>
        {note && <div className="mono mt-1 text-soft">{note}</div>}
      </div>
      {children}
    </div>
  );
}

export function Bar({ value, tone }: { value: number; tone?: "red" | "moss" }) {
  const color = tone === "red" ? "var(--color-danger)" : tone === "moss" ? "var(--color-moss)" : undefined;
  return <div className="bar"><span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}

export function Card({ title, subtitle, right, children, className = "", flush }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; className?: string; flush?: boolean;
}) {
  return (
    <section className={`card ${flush ? "overflow-hidden" : ""} ${className}`}>
      {title && (
        <div className={`flex flex-wrap items-start justify-between gap-2 ${flush ? "bg-low px-5 py-4" : "px-5 pt-5"}`}>
          <div>
            <h2 className="h-card">{title}</h2>
            {subtitle && <p className="muted text-[12px] leading-[18px]">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="muted rounded-lg bg-low px-4 py-8 text-center">{children}</div>;
}

export function usePaged<T>(rows: T[], size = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages);
  return { page: current, pages, setPage, items: rows.slice((current - 1) * size, current * size), total: rows.length };
}

export function Pager({ page, pages, setPage, total, noun }: { page: number; pages: number; setPage: (n: number) => void; total: number; noun: string }) {
  return (
    <div className="mono flex flex-wrap items-center justify-between gap-2 bg-low px-5 py-3 text-soft">
      <span>Total {total.toLocaleString("id-ID")} {noun}</span>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Sebelumnya" className="rounded p-1 hover:bg-high disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
        <span className="rounded bg-white px-2 py-0.5 text-ink">{page}</span><span>/ {pages}</span>
        <button type="button" aria-label="Berikutnya" className="rounded p-1 hover:bg-high disabled:opacity-40" disabled={page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

export function Sparkline({ values, width = 90, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 3 - ((v - min) / (max - min || 1)) * (height - 6)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--color-moss)" strokeWidth="1.5" />
    </svg>
  );
}
