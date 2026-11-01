"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Eraser, FileText, Leaf, Loader2, LockKeyhole, PenLine, Printer, ShieldCheck } from "lucide-react";
import { ContractDoc, fillContract, SignatureSvg, type Stroke } from "@/components/contract";
import { fmtDateTime } from "@/lib/format";
import { createAccount, restartContract, signContract } from "./actions";

type Template = { id: string; title: string; body: string } | null;
type Submission = { id: string; title: string; body: string; hash: string; name: string; email: string; phone: string; address: string; printed_name: string; signature: Stroke[]; signed_at: string; user_id: string | null } | null;

const STEPS = ["Data diri", "Baca perjanjian", "Persetujuan & tanda tangan", "Selesai"];
const EMPTY = { name: "", email: "", phone: "", address: "" };
const eyebrow = "mono tracking-[.14em] text-[#78645f]";
const cardCls = "rounded-md border border-[#e5d9cc] bg-paper p-6 md:p-9";
const headCls = "font-brand text-[26px] font-semibold leading-tight tracking-tight text-maroon";

function SignaturePad({ value, onChange }: { value: Stroke[]; onChange: (v: Stroke[]) => void }) {
  const drawing = useRef(false);
  const current = useRef<Stroke>([]);
  const before = useRef<Stroke[]>([]);
  const pos = (e: PointerEvent<HTMLDivElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))];
  };
  const finish = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(current.current.length > 1 ? [...before.current, current.current] : before.current);
  };
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <strong className="flex items-center gap-1.5 text-[13px] text-maroon"><PenLine size={15} />Tanda tangan</strong>
        <button type="button" disabled={!value.length} onClick={() => onChange([])} className="flex items-center gap-1 text-[12px] font-medium text-maroon disabled:opacity-40"><Eraser size={14} />Hapus & ulangi</button>
      </div>
      <div role="img" aria-label="Area menggambar tanda tangan" className="relative h-44 touch-none overflow-hidden rounded border border-[#cdbbb0] bg-white"
        onPointerDown={(e) => {
          if (e.button !== 0 || value.length >= 100) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          before.current = value;
          current.current = [pos(e)];
        }}
        onPointerMove={(e) => {
          if (!drawing.current || current.current.length >= 2000) return;
          if (before.current.reduce((s, x) => s + x.length, 0) + current.current.length >= 5000) return;
          current.current = [...current.current, pos(e)];
          onChange([...before.current, current.current]);
        }}
        onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
        <SignatureSvg value={value} className="absolute inset-0 h-full w-full" />
        {!value.length && <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[#78645f]">Tanda tangan di sini<small>Gunakan jari, stylus, atau mouse.</small></span>}
        <span className="pointer-events-none absolute inset-x-8 bottom-8 border-b border-dashed border-[#cdbbb0]" />
      </div>
    </div>
  );
}

export function ContractApp({ template, draft, submission }: { template: Template; draft: { title: string; body: string } | null; submission: Submission }) {
  const router = useRouter();
  const [step, setStep] = useState(submission ? 3 : 0);
  const [profile, setProfile] = useState(EMPTY);
  const [signature, setSignature] = useState<Stroke[]>([]);
  const [printedName, setPrintedName] = useState("");
  const [read, setRead] = useState(false);
  const [readEnd, setReadEnd] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const doc = template || draft || { title: "Perjanjian Kerja", body: "" };
  const isDraft = !template;

  useEffect(() => {
    let t = "";
    try { t = sessionStorage.getItem("teapy-contract-attempt") || ""; } catch {}
    if (!t) {
      t = crypto.randomUUID();
      try { sessionStorage.setItem("teapy-contract-attempt", t); } catch {}
    }
    setToken(t);
  }, []);
  useEffect(() => {
    if (step !== 1 || !endRef.current) return;
    const o = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) setReadEnd(true); }, { threshold: 0.4 });
    o.observe(endRef.current);
    return () => o.disconnect();
  }, [step]);

  function go(n: number) {
    setError("");
    setStep(n);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  const edit = (key: keyof typeof EMPTY, v: string) => { setProfile({ ...profile, [key]: v }); setRead(false); setConsent(false); setReadEnd(false); };

  async function sign(e: FormEvent) {
    e.preventDefault();
    if (!template) return;
    setBusy(true);
    setError("");
    try {
      const res = await signContract({ requestToken: token, templateId: template.id, profile, signature, printedName, consent, read });
      if (!res.ok) { setError(res.error); return; }
      try { sessionStorage.removeItem("teapy-contract-attempt"); } catch {}
      router.refresh();
      go(3);
    } catch {
      setError("Koneksi terputus. Tekan kirim kembali; data tidak akan tersimpan dua kali.");
    } finally {
      setBusy(false);
    }
  }

  async function account(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await createAccount({ password: String(f.get("password")), confirm: String(f.get("confirm")) });
      if (!res.ok) { setError(res.error); return; }
      window.location.assign(res.data.next);
    } catch {
      setError("Koneksi terputus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function restart() {
    await restartContract();
    window.location.reload();
  }

  const field = (label: string, key: keyof typeof EMPTY, type = "text", max = 120, auto?: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-maroon">{label}</span>
      <input className="input !h-11" required type={type} maxLength={max} autoComplete={auto} value={profile[key]} onChange={(e) => edit(key, e.target.value)} />
    </label>
  );

  return (
    <div className="min-h-screen bg-cream text-maroon">
      <header className="no-print mx-auto flex max-w-[1400px] items-center justify-between gap-4 border-b border-[#e5d9cc] px-[5%] py-5">
        <a href="/kontrak-kerja" className="flex items-center gap-2"><Leaf size={24} /><strong className="font-brand text-[26px] tracking-tight">teapy</strong><span className="mono ml-3 hidden border-l border-[#e5d9cc] pl-4 tracking-[.14em] sm:inline">PEOPLE & CULTURE</span></a>
        <a href="/karyawan/login" className="flex items-center gap-2 text-[14px] font-semibold"><ShieldCheck size={16} />Portal karyawan<ArrowRight size={15} /></a>
      </header>

      <main ref={topRef} className="mx-auto max-w-[1280px] scroll-mt-4 px-[5%] pb-20 pt-10">
        <div className="no-print mb-8">
          <p className={eyebrow}>A NEW CHAPTER, TOGETHER</p>
          <h1 className="mt-4 font-brand text-[clamp(34px,4.1vw,54px)] font-semibold leading-[1.15] tracking-tight">Mari tumbuh<br /><em className="not-italic text-[#8c5853]">bersama Teapy.</em></h1>
        </div>
        <ol className="no-print mb-8 grid grid-cols-2 border-y border-[#e5d9cc] md:grid-cols-4" aria-label="Tahapan kontrak">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={step === i ? "step" : undefined} className={`relative flex items-center gap-3 px-2 py-5 ${step >= i ? "" : "opacity-50"}`}>
              {step === i && <span className="absolute inset-x-0 -top-px h-[3px] bg-maroon" />}
              <span className={`mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${step === i ? "border-maroon bg-maroon text-cream" : step > i ? "border-[#b2c7ae] bg-[#e0ebdf] text-[#31563d]" : "border-[#cdbbb0]"}`}>{step > i ? <Check size={15} /> : String(i + 1).padStart(2, "0")}</span>
              <span><small className="mono block text-[9px] tracking-wider">LANGKAH {i + 1}</small><strong className="block text-[13px] font-semibold leading-snug">{s}</strong></span>
            </li>
          ))}
        </ol>

        {error && <div role="alert" className="no-print mb-5 flex items-start gap-2 rounded border border-[#e7b9b4] bg-[#fbe9e7] p-3 text-[14px] text-[#8c1d18]"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
        {isDraft && step < 3 && (
          <div className="no-print mb-5 flex items-start gap-2 rounded border border-[#e6cf9a] bg-[#fbf2dc] p-3 text-[14px] text-[#6a4e12]">
            <FileText size={18} className="mt-0.5 shrink-0" />
            <div><strong>Persetujuan belum dibuka: naskah masih draft.</strong><p>Data diri boleh diisi dan naskah boleh dibaca. Admin Teapy perlu menerbitkan naskah final melalui SDM & Shift, tab Kontrak kerja.</p></div>
          </div>
        )}

        {step === 0 && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
            <section className={cardCls}>
              <p className={eyebrow}><span className="mr-2 text-[#8c5853]">01</span>KENAL LEBIH DEKAT</p>
              <h2 className={`${headCls} mt-3`}>Lengkapi data diri</h2>
              <p className="mt-1 text-[14px] text-[#78645f]">Data ini akan tercantum pada perjanjian dan akun karyawan Anda.</p>
              <form className="mt-6" onSubmit={(e) => { e.preventDefault(); setPrintedName(profile.name); go(1); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  {field("Nama lengkap sesuai identitas", "name", "text", 120, "name")}
                  {field("Alamat email pribadi", "email", "email", 254, "email")}
                  {field("Nomor telepon / WhatsApp", "phone", "tel", 25, "tel")}
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[13px] font-medium text-maroon">Alamat tempat tinggal</span>
                    <textarea className="input" required minLength={8} maxLength={500} rows={3} autoComplete="street-address" value={profile.address} onChange={(e) => edit("address", e.target.value)} />
                  </label>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" className="text-[13px] font-medium underline" onClick={() => go(1)}>Baca naskah dahulu</button>
                  <button className="btn btn-primary !h-11 !px-5 !text-[14px]">Lanjut baca perjanjian<ArrowRight size={16} /></button>
                </div>
              </form>
            </section>
            <aside className="rounded-md bg-maroon p-8 text-cream">
              <Leaf size={46} />
              <p className="mono mt-5 tracking-[.14em] opacity-70">YOUR NEXT STEP</p>
              <h2 className="mt-2 font-brand text-[26px] font-semibold leading-tight">Setiap peran,<br />punya arti.</h2>
              <p className="mt-3 text-[14px] leading-6 opacity-85">Luangkan waktu untuk membaca setiap bagian. Jika ada yang belum jelas, tanyakan kepada admin Teapy sebelum menyetujui.</p>
              <div className="mt-5 flex gap-2 border-t border-white/20 pt-5 text-[13px]"><FileText size={20} className="shrink-0" /><span>{doc.title}<small className="mt-1 block opacity-70">{isDraft ? "Draft untuk ditinjau · belum dapat ditandatangani" : "Naskah aktif · siap dibaca"}</small></span></div>
              <small className="mt-4 block opacity-70">Akun portal dibuat setelah persetujuan tersimpan.</small>
            </aside>
          </div>
        )}

        {step === 1 && (
          <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-5">
              <p className={eyebrow}><span className="mr-2 text-[#8c5853]">02</span>PAHAMI PERJANJIANNYA</p>
              <h2 className={`${headCls} mt-3`}>Kesepakatan<br />yang jelas.</h2>
              <p className="mt-2 text-[14px] text-[#78645f]">Baca seluruh isi hingga bagian akhir. Anda dapat kembali memperbaiki data sebelum memberikan persetujuan.</p>
              <dl className="mt-4 flex flex-col gap-2 text-[13px]">
                <div><dt className="mono text-[#78645f]">Status naskah</dt><dd>{isDraft ? "Draft untuk ditinjau" : "Diterbitkan Teapy"}</dd></div>
                <div><dt className="mono text-[#78645f]">Nama karyawan</dt><dd>{profile.name || "Belum diisi"}</dd></div>
              </dl>
              <button className="mt-4 flex items-center gap-1.5 text-[13px] font-medium" onClick={() => go(0)}><ArrowLeft size={15} />Ubah data diri</button>
            </aside>
            <div>
              <ContractDoc title={doc.title} body={fillContract(doc.body, profile)} draft={isDraft} />
              <div ref={endRef} className="mt-5 rounded-md border border-[#e5d9cc] bg-paper p-5">
                <label className="flex items-start gap-2 text-[14px]"><input type="checkbox" className="mt-1" checked={read} disabled={!readEnd} onChange={(e) => setRead(e.target.checked)} /><span>Saya sudah membaca seluruh isi perjanjian di atas.</span></label>
                <div className="mt-4 flex flex-wrap justify-between gap-2">
                  <button className="btn !h-11" onClick={() => go(0)}><ArrowLeft size={16} />Kembali</button>
                  <button className="btn btn-primary !h-11" disabled={!read} onClick={() => {
                    if (!profile.name || !profile.email || !profile.phone || profile.address.length < 8) { go(0); setError("Lengkapi data diri terlebih dahulu."); return; }
                    setPrintedName(profile.name);
                    go(2);
                  }}>Lanjut ke persetujuan<ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
            <section className={cardCls}>
              <p className={eyebrow}><span className="mr-2 text-[#8c5853]">03</span>PERSETUJUAN ANDA</p>
              <h2 className={`${headCls} mt-3`}>Sepakat untuk melangkah.</h2>
              <p className="mt-1 text-[14px] text-[#78645f]">Periksa nama dan bubuhkan tanda tangan Anda. Persetujuan disimpan bersama versi naskah yang telah Anda baca.</p>
              <form onSubmit={sign} className="mt-5 flex flex-col gap-4">
                <label className="flex items-start gap-2 rounded bg-cream p-3 text-[14px]"><input required type="checkbox" className="mt-1" checked={consent} disabled={busy} onChange={(e) => setConsent(e.target.checked)} /><span>Saya telah membaca dan memahami seluruh isi perjanjian ini, menyetujui isinya tanpa paksaan, dan menyatakan bahwa data, nama terang, serta tanda tangan yang saya berikan adalah milik saya.</span></label>
                <SignaturePad value={signature} onChange={setSignature} />
                <label className="flex flex-col gap-1"><span className="text-[13px] font-medium">Nama terang</span><input className="input !h-11" required autoComplete="name" maxLength={120} value={printedName} disabled={busy} onChange={(e) => setPrintedName(e.target.value)} /><small className="text-[#78645f]">Harus sama dengan nama lengkap: {profile.name}</small></label>
                {isDraft && <p className="text-[13px] text-[#6a4e12]">Tombol belum aktif karena naskah belum diterbitkan.</p>}
                <div className="flex flex-wrap justify-between gap-2">
                  <button type="button" className="btn !h-11" onClick={() => go(1)}><ArrowLeft size={16} />Kembali</button>
                  <button className="btn btn-primary !h-11" disabled={busy || isDraft || !consent || signature.length === 0 || !printedName.trim()}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}Setujui & kirim</button>
                </div>
              </form>
            </section>
            <aside className={cardCls}>
              <p className={eyebrow}>RINGKASAN</p>
              <dl className="mt-3 flex flex-col gap-3 text-[14px]">
                <div><dt className="mono text-[#78645f]">Dokumen</dt><dd>{doc.title}</dd></div>
                <div><dt className="mono text-[#78645f]">Nama</dt><dd>{profile.name}</dd></div>
                <div><dt className="mono text-[#78645f]">Email</dt><dd className="break-all">{profile.email}</dd></div>
                <div><dt className="mono text-[#78645f]">Telepon</dt><dd>{profile.phone}</dd></div>
              </dl>
            </aside>
          </div>
        )}

        {step === 3 && submission && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
            <div>
              <ContractDoc title={submission.title} body={submission.body}>
                <div className="mt-8 grid gap-6 border-t border-[#e5d9cc] pt-6 md:grid-cols-2">
                  <div className="text-[13px]"><p className="mono text-[#78645f]">PIHAK PERTAMA</p><p className="mt-16 font-semibold">Azam Azri Ahmad</p><p>Owner Teapy · pengesahan terpisah</p></div>
                  <div className="text-[13px]"><p className="mono text-[#78645f]">PIHAK KEDUA</p><SignatureSvg value={submission.signature} className="h-20 w-full" /><p className="font-semibold">{submission.printed_name}</p><p>Disetujui {fmtDateTime(submission.signed_at)}</p></div>
                </div>
                <p className="mono mt-5 break-all text-[#78645f]">Sidik naskah: {submission.hash}</p>
              </ContractDoc>
            </div>
            <aside className="no-print flex flex-col gap-4 lg:sticky lg:top-5">
              <section className={cardCls}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0ebdf] text-[#31563d]"><Check size={22} /></span>
                <h2 className={`${headCls} mt-3`}>Persetujuan tersimpan.</h2>
                <p className="mt-1 text-[14px] text-[#78645f]">Simpan salinan untuk arsip pribadi Anda.</p>
                <button className="btn mt-3 w-full !h-11" onClick={() => window.print()}><Printer size={16} />Simpan salinan / cetak PDF</button>
              </section>
              <section className={cardCls}>
                <p className={eyebrow}><LockKeyhole size={13} className="mr-1 inline" />AKUN PORTAL KARYAWAN</p>
                {submission.user_id ? (
                  <><p className="mt-2 text-[14px]">Akun sudah dibuat.</p><a className="btn btn-primary mt-3 w-full !h-11" href="/karyawan/login">Masuk ke portal</a></>
                ) : (
                  <form className="mt-3 flex flex-col gap-3" onSubmit={account}>
                    <p className="text-[14px] text-[#78645f]">Login memakai email <b>{submission.email}</b>.</p>
                    <label className="flex flex-col gap-1"><span className="text-[13px] font-medium">Buat password (min. 8 karakter)</span><input className="input !h-11" type="password" name="password" required minLength={8} autoComplete="new-password" /></label>
                    <label className="flex flex-col gap-1"><span className="text-[13px] font-medium">Ulangi password</span><input className="input !h-11" type="password" name="confirm" required minLength={8} autoComplete="new-password" /></label>
                    <button className="btn btn-primary !h-11" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}Buat akun & masuk</button>
                  </form>
                )}
                <p className="mt-3 text-[12px] text-[#78645f]">Jadwal dan tugas tampil setelah admin memverifikasi kontrak Anda.</p>
              </section>
              <button className="text-[12px] underline" onClick={restart}>Bukan Anda? Mulai kontrak baru</button>
            </aside>
          </div>
        )}
      </main>
      <footer className="no-print mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-[#e5d9cc] px-[5%] py-5">
        <span className="mono flex items-center gap-2 tracking-[.1em]"><Leaf size={15} />TEAPY · BACK TO ESSENCE</span>
        <span className="mono">People & Culture</span>
      </footer>
    </div>
  );
}
