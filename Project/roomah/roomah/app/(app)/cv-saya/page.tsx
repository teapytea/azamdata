import { createClient } from "@/lib/supabase/client-server";
import Image from "next/image";
import Link from "next/link";
import CVForm from "@/features/cv/components/CVForm";

type Search = Promise<{ tab?: string }>;

export default async function CvSayaPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "preview" ? "preview" : "edit";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cv } = await supabase
    .from("cvs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // admin notes (jika ada)
  let adminNotes: string | null = null;
  if (cv?.id) {
    const { data: notes } = await supabase
      .from("cvs_admin_notes")
      .select("admin_notes")
      .eq("cv_id", cv.id)
      .maybeSingle();
    adminNotes = notes?.admin_notes ?? null;
  }

  // avatar signed URL
  const { data: profile } = await supabase
    .from("profiles")
    .select("gender")
    .eq("id", user.id)
    .maybeSingle();

  const gender = (cv?.gender ?? profile?.gender ?? "ikhwan").toLowerCase();
  const placeholder =
    gender === "akhwat"
      ? "/avatar-akhwat-placeholder.jpg"
      : "/avatar-ikhwan-placeholder.jpg";

  // Tentukan sumber avatar
  let avatarSrc = placeholder;

  if (cv?.avatar_path) {
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(cv.avatar_path, 3600); // 1 jam
    if (signed?.signedUrl) {
      avatarSrc = signed.signedUrl; // absolute https://...supabase.co/storage/...
    }
  }

  const isReadOnly = cv?.status === "approved";
  const statusLabel = cv?.status ? String(cv.status).toUpperCase() : "DRAFT";

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CV Saya</h1>
        <span className="rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground">
          Status: {statusLabel}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Image
          src={avatarSrc}
          alt="Avatar"
          width={96}
          height={96}
          className="rounded-full border"
        />
        <div className="text-sm text-muted-foreground">
          <p>Perbarui foto agar profil Anda lebih meyakinkan.</p>
        </div>
      </div>

      {cv?.status === "rejected" && adminNotes && (
        <p className="mt-4 rounded-md border border-destructive bg-destructive/10 p-4">
          <strong>Alasan penolakan:</strong> {adminNotes}
        </p>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-4 border-b pb-2 text-sm">
        <Link
          href="/cv-saya?tab=edit"
          className={tab === "edit" ? "font-semibold underline" : "opacity-70"}
        >
          Edit / Buat CV
        </Link>
        <Link
          href="/cv-saya?tab=preview"
          className={
            tab === "preview" ? "font-semibold underline" : "opacity-70"
          }
        >
          Preview
        </Link>
      </div>

      {/* Body */}
      <div className="mt-6">
        {tab === "preview" ? (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Pratinjau</h3>
            <div className="grid gap-2">
              <Item label="Nama">{cv?.full_name}</Item>
              <Item label="Tanggal Lahir">{cv?.date_of_birth}</Item>
              <Item label="Status Pernikahan">{cv?.marital_status}</Item>
              <Item label="Domisili">{cv?.domicile_province}</Item>
              <Item label="Alamat">{cv?.full_address}</Item>
              <Item label="Pendidikan">{cv?.education}</Item>
              <Item label="Pekerjaan">{cv?.job}</Item>
              <Item label="Penghasilan">{cv?.income_range}</Item>
              <Item label="Tinggi / Berat">
                {cv?.height_cm ? `${cv.height_cm} cm` : "-"} /{" "}
                {cv?.weight_kg ? `${cv.weight_kg} kg` : "-"}
              </Item>
              <Item label="Deskripsi Fisik">{cv?.physical_description}</Item>

              <h4 className="mt-4 font-semibold">Ibadah</h4>
              <Item label="Shalat">{cv?.prayer_habits}</Item>
              <Item label="Shalat Sunnah">{cv?.sunnah_prayer_habits}</Item>
              <Item label="Bacaan Qur'an">{cv?.quran_reading_habits}</Item>
              <Item label="Hafalan Qur'an">{cv?.quran_memorization}</Item>
              <Item label="Puasa">{cv?.fasting_habits}</Item>
              <Item label="Kajian">{cv?.islamic_studies}</Item>

              <h4 className="mt-4 font-semibold">Preferensi Pasangan</h4>
              <Item label="Usia">
                {cv?.partner_age_min} - {cv?.partner_age_max}
              </Item>
              <Item label="Pendidikan">{cv?.partner_education}</Item>
              <Item label="Penghasilan">{cv?.partner_income_range}</Item>
              <Item label="Deskripsi Fisik">
                {cv?.partner_physical_description}
              </Item>

              <h4 className="mt-4 font-semibold">Rencana Pernikahan</h4>
              <Item label="Tahun Rencana">{cv?.marriage_year_plan}</Item>
              <Item label="Tempat Tinggal">{cv?.post_marriage_residence}</Item>
              <Item label="Visi">{cv?.marriage_vision}</Item>
              <Item label="Misi">{cv?.marriage_mission}</Item>

              <h4 className="mt-4 font-semibold">Ringkasan</h4>
              <Item label="Riwayat Penyakit">
                {cv?.disease_history_summary}
              </Item>
              <Item label="Kriteria Pasangan">
                {cv?.partner_criteria_summary}
              </Item>
            </div>
          </div>
        ) : (
          <CVForm initialData={cv ?? {}} readOnly={isReadOnly} />
        )}
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: any }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="col-span-2">
        {children ?? <span className="opacity-60">—</span>}
      </div>
    </div>
  );
}
