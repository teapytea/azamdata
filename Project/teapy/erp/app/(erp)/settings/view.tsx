"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Card, Field, FormModal, PageHead, useRun } from "@/components/ui";
import type { PublicSettings } from "@/lib/settings";
import { saveAccount, saveSettings } from "./actions";

type Account = { id: string; email: string; name: string; role: string; active: boolean };
const ROLE: Record<string, string> = { owner: "Owner", admin: "Admin penuh", marketing: "Admin Marketing", cashier: "Kasir" };

export function SettingsView({ settings: s, accounts }: { settings: PublicSettings; accounts: Account[] }) {
  const { busy, run } = useRun();
  const [edit, setEdit] = useState<Partial<Account> | null>(null);
  const num = (label: string, name: keyof PublicSettings, hint?: string) => (
    <Field label={label} hint={hint}><input className="input" type="number" step="any" min="0" name={name} required defaultValue={s[name] as number} /></Field>
  );
  const text = (label: string, name: keyof PublicSettings) => <Field label={label}><input className="input" name={name} defaultValue={s[name] as string} /></Field>;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run(saveSettings, Object.fromEntries(new FormData(e.currentTarget)) as never, "Pengaturan disimpan.");
  }

  return (
    <>
      <PageHead crumb="Pengaturan & Akun" title="Pengaturan & Akun" description="Identitas outlet, pajak, aturan kasir, jam shift, dan akun admin." />
      <form onSubmit={submit} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card title="Identitas outlet & struk"><div className="grid grid-cols-2 gap-3">{text("Nama toko", "store_name")}{text("Nama outlet", "outlet")}<div className="col-span-2">{text("Alamat", "address")}</div>{text("Catatan kaki struk", "footer")}{text("WiFi di struk", "wifi")}</div></Card>
        <Card title="Pajak & pembulatan"><div className="grid grid-cols-2 gap-3">{num("Service (%)", "service_pct")}{num("Pajak (%)", "tax_pct")}{text("Label pajak", "tax_label")}{num("Pembulatan total (Rp)", "rounding", "1 = tanpa pembulatan")}{num("Potongan kanal kurir (%)", "courier_fee_pct")}{num("Target margin (%)", "margin_target")}</div></Card>
        <Card title="Takaran saji"><div className="grid grid-cols-2 gap-3">{num("Gula normal (ml)", "sugar_normal_ml")}{num("Gula less (ml)", "sugar_less_ml")}{num("Takaran topping (g)", "topping_qty")}{num("Harga topping (Rp)", "topping_price")}{num("Batas pakai batch (jam)", "batch_expiry_hours")}</div></Card>
        <Card title="Member & poin"><div className="grid grid-cols-2 gap-3">{num("Diskon member (%)", "member_discount_pct")}{num("1 poin setiap (Rp)", "points_per")}{num("Syarat tukar (poin)", "redeem_points")}{num("Nilai tukar (Rp)", "redeem_value")}</div></Card>
        <Card title="Jam shift"><div className="grid grid-cols-2 gap-3">
          {(["shift1_start", "shift1_end", "shift2_start", "shift2_end"] as const).map((k, i) => <Field key={k} label={["Shift 1 mulai", "Shift 1 selesai", "Shift 2 mulai", "Shift 2 selesai"][i]}><input className="input" type="time" name={k} required defaultValue={s[k]} /></Field>)}
        </div><p className="mono mt-2 text-soft">Berlaku untuk jadwal baru. Naskah kontrak diubah terpisah di SDM & Shift.</p></Card>
        <Card title="Keamanan kasir">
          <Field label="PIN supervisor untuk void" hint={s.has_void_pin ? "PIN sudah diatur. Kosongkan bila tidak diganti." : "Belum diatur: hanya admin yang bisa membatalkan transaksi."}><input className="input" type="password" inputMode="numeric" name="void_pin" autoComplete="new-password" /></Field>
        </Card>
        <div className="lg:col-span-2"><button className="btn btn-primary" disabled={busy}>Simpan pengaturan</button></div>
      </form>

      <Card flush title="Akun Admin & Kasir" subtitle="Akun karyawan dibuat dari halaman kontrak kerja." right={<button className="btn btn-sm btn-primary" onClick={() => setEdit({})}><Plus size={13} />Tambah akun</button>}>
        <div className="overflow-x-auto"><table className="tbl min-w-[560px]"><thead><tr><th>Nama</th><th>Email login</th><th>Peran</th><th>Status</th><th className="num">Aksi</th></tr></thead><tbody>
          {accounts.map((a) => <tr key={a.id}><td className="font-medium">{a.name}</td><td className="mono">{a.email}</td><td>{ROLE[a.role]}</td><td><span className={`badge ${a.active ? "badge-moss" : ""}`}>{a.active ? "Aktif" : "Nonaktif"}</span></td><td className="num">{a.role !== "owner" && <button className="link" onClick={() => setEdit(a)}>Edit / reset</button>}</td></tr>)}
        </tbody></table></div>
      </Card>

      {edit && (
        <FormModal title={edit.id ? "Edit Akun" : "Tambah Akun"} action={saveAccount} extra={{ id: edit.id }} success="Akun disimpan." onClose={() => setEdit(null)}>
          <Field label="Nama"><input className="input" name="name" required defaultValue={edit.name} /></Field>
          <Field label="Email login"><input className="input" type="email" name="email" required defaultValue={edit.email} /></Field>
          <Field label={edit.id ? "Password sementara baru (opsional)" : "Password awal"}><input className="input" type="text" name="password" minLength={8} required={!edit.id} autoComplete="off" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Peran"><select className="input" name="role" defaultValue={edit.role || "cashier"}><option value="admin">Admin penuh</option><option value="marketing">Admin Marketing</option><option value="cashier">Kasir · POS saja</option></select></Field>
            <Field label="Status"><select className="input" name="active" defaultValue={String(edit.active ?? true)}><option value="true">Aktif</option><option value="false">Dinonaktifkan</option></select></Field>
          </div>
        </FormModal>
      )}
    </>
  );
}
