import type { ReactNode } from "react";

export type Stroke = [number, number][];

export function fillContract(body: string, p: { name: string; email: string; phone: string; address: string }) {
  return body.replaceAll("{{nama}}", p.name || "{{nama}}").replaceAll("{{email}}", p.email || "{{email}}")
    .replaceAll("{{telepon}}", p.phone || "{{telepon}}").replaceAll("{{alamat}}", p.address || "{{alamat}}");
}

/** Tanda tangan disimpan sebagai garis ternormalisasi 0-1 agar tajam di layar dan cetakan. */
export function SignatureSvg({ value, className = "" }: { value: Stroke[]; className?: string }) {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="none" className={className} aria-hidden>
      {value.map((s, i) => (
        <polyline key={i} points={s.map(([x, y]) => `${x * 600},${y * 200}`).join(" ")} fill="none" stroke="#1c1b1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export function ContractDoc({ title, body, draft, children }: { title: string; body: string; draft?: boolean; children?: ReactNode }) {
  return (
    <article className="rounded-md border border-[#e5d9cc] bg-paper p-6 md:p-10 print:border-0 print:p-0">
      <p className="mono tracking-[.12em] text-[#78645f]">TEAPY · PEOPLE & CULTURE{draft ? " · DRAFT" : ""}</p>
      <h2 className="mt-2 font-brand text-[26px] font-semibold leading-tight tracking-tight text-maroon">{title}</h2>
      <div className="mt-6 flex flex-col gap-3 text-[14px] leading-[24px] text-[#3a2a28]">
        {body.split(/\n\n+/).map((block, i) =>
          block.startsWith("## ")
            ? <h3 key={i} className="mt-4 font-brand text-[17px] font-semibold text-maroon">{block.slice(3)}</h3>
            : <p key={i}>{block}</p>)}
      </div>
      {children}
    </article>
  );
}
