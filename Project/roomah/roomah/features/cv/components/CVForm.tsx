"use client";

import { useFormStatus } from "react-dom";
import {
  saveDraftCv,
  submitCvForReview,
  updateProfileName,
} from "@/app/(app)/cv-saya/actions";

function Buttons({ readOnly }: { readOnly: boolean }) {
  const { pending } = useFormStatus();
  if (readOnly) return null;
  return (
    <div className="mt-6 flex gap-3">
      <button
        type="submit"
        formAction={saveDraftCv}
        disabled={pending}
        className="rounded-md border px-4 py-2"
      >
        {pending ? "Menyimpan…" : "Simpan Draft"}
      </button>
      <button
        type="submit"
        formAction={submitCvForReview}
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        {pending ? "Mengajukan…" : "Ajukan Review"}
      </button>
    </div>
  );
}

export default function CVForm({
  initialData,
  readOnly,
}: {
  initialData: any;
  readOnly: boolean;
}) {
  return (
    <form className="grid gap-6">
      <fieldset disabled={readOnly} className="grid gap-6">
        {/* ====== A. BIODATA ====== */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Biodata</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* NAMA LENGKAP (update ke profiles) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Nama Lengkap</label>
              <input
                name="__full_name_profiles"
                defaultValue={initialData?.full_name ?? ""}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Nama lengkap"
              />
              <div className="mt-2">
                {/* PENTING: formAction dipasang di BUTTON, bukan di input */}
                <button
                  type="submit"
                  className="rounded-md border px-3 py-2 text-sm"
                  formAction={async (formData) => {
                    const fullName = String(
                      formData.get("__full_name_profiles") ?? ""
                    );
                    await updateProfileName(fullName);
                  }}
                >
                  Simpan Nama
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                (Nama disimpan di <code>profiles.full_name</code>)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium">Tanggal Lahir</label>
              <input
                type="date"
                name="date_of_birth"
                defaultValue={initialData?.date_of_birth ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Status Pernikahan
              </label>
              <input
                name="marital_status"
                defaultValue={initialData?.marital_status ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Domisili (Provinsi)
              </label>
              <input
                name="domicile_province"
                defaultValue={initialData?.domicile_province ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Alamat Lengkap
              </label>
              <input
                name="full_address"
                defaultValue={initialData?.full_address ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Pendidikan</label>
              <input
                name="education"
                defaultValue={initialData?.education ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Pekerjaan</label>
              <input
                name="job"
                defaultValue={initialData?.job ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Pendapatan/Bulan
              </label>
              <input
                name="income_range"
                defaultValue={initialData?.income_range ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Tinggi (cm)</label>
                <input
                  type="number"
                  name="height_cm"
                  defaultValue={initialData?.height_cm ?? ""}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Berat (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  defaultValue={initialData?.weight_kg ?? ""}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Deskripsi Fisik (≤ 20 kata)
              </label>
              <textarea
                name="physical_description"
                defaultValue={initialData?.physical_description ?? ""}
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Anak ke-</label>
              <input
                type="number"
                name="child_order"
                defaultValue={initialData?.child_order ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Jumlah Saudara Kandung
              </label>
              <input
                type="number"
                name="siblings_count"
                defaultValue={initialData?.siblings_count ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Pekerjaan Orang Tua
              </label>
              <input
                name="parent_job"
                defaultValue={initialData?.parent_job ?? ""}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* ====== B. IBADAH ====== */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Kebiasaan Ibadah</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="prayer_habits"
              defaultValue={initialData?.prayer_habits ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Shalat fardhu"
            />
            <input
              name="sunnah_prayer_habits"
              defaultValue={initialData?.sunnah_prayer_habits ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Shalat sunnah"
            />
            <input
              name="quran_reading_habits"
              defaultValue={initialData?.quran_reading_habits ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Bacaan Qur'an"
            />
            <input
              name="quran_memorization"
              defaultValue={initialData?.quran_memorization ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Hafalan Qur'an"
            />
            <input
              name="fasting_habits"
              defaultValue={initialData?.fasting_habits ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Puasa"
            />
            <input
              name="islamic_studies"
              defaultValue={initialData?.islamic_studies ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Kajian"
            />
          </div>
        </div>

        {/* ====== C. KRITERIA PASANGAN ====== */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Kriteria Pasangan</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              name="partner_age_min"
              defaultValue={initialData?.partner_age_min ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Usia minimal"
            />
            <input
              type="number"
              name="partner_age_max"
              defaultValue={initialData?.partner_age_max ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Usia maksimal"
            />
            <input
              name="partner_education"
              defaultValue={initialData?.partner_education ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Pendidikan"
            />
            <input
              name="partner_income_range"
              defaultValue={initialData?.partner_income_range ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Rentang penghasilan"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Deskripsi Fisik Pasangan (≤ 20 kata)
              </label>
              <textarea
                name="partner_physical_description"
                defaultValue={initialData?.partner_physical_description ?? ""}
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* ====== D. RENCANA PERNIKAHAN ====== */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Rencana Pernikahan</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              name="marriage_year_plan"
              defaultValue={initialData?.marriage_year_plan ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Tahun rencana menikah"
            />
            <input
              name="post_marriage_residence"
              defaultValue={initialData?.post_marriage_residence ?? ""}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Tempat tinggal pasca nikah"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Visi Pernikahan (≤ 250)
              </label>
              <textarea
                name="marriage_vision"
                defaultValue={initialData?.marriage_vision ?? ""}
                rows={2}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Misi Pernikahan (≤ 250)
              </label>
              <textarea
                name="marriage_mission"
                defaultValue={initialData?.marriage_mission ?? ""}
                rows={2}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* ====== E. RANGKUMAN (MVP) ====== */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Ringkasan</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium">
                Riwayat Penyakit (ringkas)
              </label>
              <textarea
                name="disease_history_summary"
                defaultValue={initialData?.disease_history_summary ?? ""}
                rows={2}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Kriteria Pasangan (ringkas)
              </label>
              <textarea
                name="partner_criteria_summary"
                defaultValue={initialData?.partner_criteria_summary ?? ""}
                rows={2}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>
        </div>
      </fieldset>

      <Buttons readOnly={readOnly} />
    </form>
  );
}
