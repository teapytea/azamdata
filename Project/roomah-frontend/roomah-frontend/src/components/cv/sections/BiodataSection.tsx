"use client";

import { Fragment, memo, useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Disclosure, Combobox, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CvFormData } from "../FormProvider";
import { validateWordLimit } from "../utils/longTextLimiter";
import { createClient } from "@/lib/supabase/client";

type Province = { id: number; name: string };

/* ————— UI TOKENS (hanya tampilan) ————— */
const ROW_GAP = "gap-x-8 lg:gap-x-10 gap-y-8"; // <<< jarak konsisten utk SEMUA row
const fieldWrap = "min-w-0 space-y-2"; // min-w-0 supaya gak “nyundul”
const labelCls = "block text-sm font-semibold text-slate-700";
const inputBase =
  "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 " +
  "placeholder:text-slate-500 hover:border-slate-300 focus:outline-none " +
  "focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-200";
const inputCls =
  inputBase +
  " [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const selectCls =
  inputBase +
  " pr-10 appearance-none bg-no-repeat bg-right bg-[length:16px_16px] " +
  "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQuNSA2TDggMTBsMy41LTQiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]";
const taCls =
  "w-full min-h-[160px] rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 " +
  "placeholder:text-slate-500 leading-6 whitespace-pre-wrap resize-none overflow-y-hidden " +
  "hover:border-slate-300 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-all duration-200";

/* textarea auto-grow (tanpa scrollbar) */
function autoGrow(e: React.FormEvent<HTMLTextAreaElement>) {
  const el = e.currentTarget;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function BiodataSection() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await createClient()
          .from("provinces")
          .select("id,name")
          .order("name");
        if (mounted) setProvinces(data || []);
      } catch {
        if (mounted) setProvinces([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered =
    q === ""
      ? provinces
      : provinces.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const physical = watch("physical_traits") || "";
  const medical = watch("medical_history") || "";
  const physicalV = validateWordLimit(physical, 20);
  const medicalV = validateWordLimit(medical, 20);

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <div
          className={
            "rounded-2xl bg-white/90 overflow-hidden backdrop-blur " +
            "shadow-[0_6px_24px_rgba(16,24,40,0.06)] transition-shadow duration-300"
          }
        >
          {/* HEADER CARD — tidak mengubah ukuran/skin card */}
          <Disclosure.Button
            className={[
              "group relative w-full flex items-center justify-between",
              "bg-gradient-to-r from-slate-50 to-slate-100", // ← semula from-blue-50 to-indigo-50
              "px-5 py-4",
              "transition duration-300",
              "outline-none focus-visible:outline-none",
              "hover:shadow-sm focus-visible:shadow-sm",
              "active:scale-[.995]",
              // HAPUS baris 'after:*' kalau tidak mau garis hairline di bawah header:
              // "after:content-[''] after:absolute after:inset-x-5 after:bottom-0",
              // "after:h-px after:bg-gradient-to-r after:from-transparent after:via-slate-200 after:to-transparent",
              // "after:transition-opacity after:duration-300",
              // "aria-expanded:after:opacity-0",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-8 w-8 rounded-xl bg-white/70 ring-1 ring-slate-200 text-blue-600">
                <UserIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Biodata Lengkap
              </span>
            </div>

            <svg
              className="h-4 w-4 text-slate-600 transition-transform duration-300 aria-expanded:rotate-180"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Disclosure.Button>

          {/* PANEL — hanya menambah padding internal agar ada jarak dari tepi card */}
          <Transition
            as={Fragment}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all ease-in duration-250"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Disclosure.Panel className="bg-white">
              <div className="px-8 lg:px-10 pt-6 pb-8 space-y-8">
                {/* Row 1 — 4 form (jarak seragam) */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 ${ROW_GAP}`}
                >
                  <div className={fieldWrap}>
                    <label htmlFor="full_name" className={labelCls}>
                      Nama Lengkap *
                    </label>
                    <input
                      id="full_name"
                      {...register("full_name")}
                      type="text"
                      required
                      className={inputCls}
                    />
                    {errors.full_name && (
                      <p className="text-xs text-red-500">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="gender" className={labelCls}>
                      Gender *
                    </label>
                    <select
                      id="gender"
                      {...register("gender")}
                      required
                      className={selectCls}
                    >
                      <option value="">Pilih Gender</option>
                      <option value="Ikhwan">Ikhwan</option>
                      <option value="Akhwat">Akhwat</option>
                    </select>
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="date_birth" className={labelCls}>
                      Tanggal Lahir *
                    </label>
                    <input
                      id="date_birth"
                      {...register("date_birth")}
                      type="date"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="marital_status" className={labelCls}>
                      Status
                    </label>
                    <select
                      id="marital_status"
                      {...register("marital_status")}
                      className={selectCls}
                    >
                      <option value="Single (Belum menikah)">
                        Single (Belum menikah)
                      </option>
                      <option value="Duda">Duda</option>
                      <option value="Janda">Janda</option>
                    </select>
                  </div>
                </div>

                {/* Row 2 — 2 form */}
                <div className={`grid grid-cols-1 xl:grid-cols-2 ${ROW_GAP}`}>
                  <div className={fieldWrap}>
                    <label htmlFor="origin_area" className={labelCls}>
                      Alamat Tinggal Lengkap
                    </label>
                    <input
                      id="origin_area"
                      {...register("origin_area")}
                      type="text"
                      className={inputCls}
                      placeholder="Jl. Merdeka No. 123, Kelurahan ABC, Kecamatan XYZ"
                    />
                  </div>

                  <div className={fieldWrap}>
                    <label className={labelCls}>Provinsi Domisili</label>
                    <Controller
                      name="domicile_prov"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          value={
                            provinces.find((p) => p.name === field.value) ||
                            null
                          }
                          onChange={(prov) => field.onChange(prov?.name || "")}
                        >
                          <div className="relative">
                            <Combobox.Input
                              className={inputCls + " pr-12"}
                              placeholder="Cari provinsi"
                              displayValue={(p: Province | null) =>
                                p?.name || ""
                              }
                              onChange={(e) => setQ(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
                            </Combobox.Button>

                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-200"
                              enterFrom="opacity-0 -translate-y-1"
                              enterTo="opacity-100 translate-y-0"
                              leave="transition ease-in duration-150"
                              leaveFrom="opacity-100 translate-y-0"
                              leaveTo="opacity-0 -translate-y-1"
                              afterLeave={() => setQ("")}
                            >
                              <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-xl border border-slate-200 focus:outline-none">
                                {q !== "" && filtered.length === 0 ? (
                                  <div className="py-3 px-4 text-sm text-slate-500">
                                    Tidak ditemukan
                                  </div>
                                ) : (
                                  filtered.slice(0, 50).map((p) => (
                                    <Combobox.Option
                                      key={p.id}
                                      value={p}
                                      className={({ active }) =>
                                        `relative cursor-pointer select-none py-3 pl-10 pr-4 text-sm ${
                                          active
                                            ? "bg-green-50 text-green-900"
                                            : "text-slate-900"
                                        }`
                                      }
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${
                                              selected
                                                ? "font-semibold"
                                                : "font-normal"
                                            }`}
                                          >
                                            {p.name}
                                          </span>
                                          {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                              <CheckIcon className="h-5 w-5" />
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </Combobox.Option>
                                  ))
                                )}
                              </Combobox.Options>
                            </Transition>
                          </div>
                        </Combobox>
                      )}
                    />
                  </div>
                </div>

                {/* Row 3 — 3 form */}
                <div className={`grid grid-cols-1 md:grid-cols-3 ${ROW_GAP}`}>
                  <div className={fieldWrap}>
                    <label htmlFor="education" className={labelCls}>
                      Pendidikan
                    </label>
                    <select
                      id="education"
                      {...register("education")}
                      className={selectCls}
                    >
                      <option value="">Pilih Pendidikan</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="job_title" className={labelCls}>
                      Pekerjaan
                    </label>
                    <input
                      id="job_title"
                      {...register("job_title")}
                      type="text"
                      className={inputCls}
                      placeholder="Wiraswasta"
                    />
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="income_level" className={labelCls}>
                      Tingkat Penghasilan
                    </label>
                    <select
                      id="income_level"
                      {...register("income_level")}
                      className={selectCls}
                    >
                      <option value="">Pilih Rentang</option>
                      <option value="Rp 0 - Rp 2,000,000">
                        Rp 0 - Rp 2,000,000
                      </option>
                      <option value="Rp 2,000,001 - Rp 5,000,000">
                        Rp 2,000,001 - Rp 5,000,000
                      </option>
                      <option value="Rp 5,000,001 - Rp 10,000,000">
                        Rp 5,000,001 - Rp 10,000,000
                      </option>
                      <option value="Rp 10,000,001 - Rp 20,000,000">
                        Rp 10,000,001 - Rp 20,000,000
                      </option>
                      <option value="Di atas Rp 20,000,000">
                        Di atas Rp 20,000,000
                      </option>
                    </select>
                  </div>
                </div>

                {/* Row 4 — 5 form */}
                <div className={`grid grid-cols-1 md:grid-cols-5 ${ROW_GAP}`}>
                  <div className={fieldWrap}>
                    <label htmlFor="height" className={labelCls}>
                      Tinggi (cm)
                    </label>
                    <input
                      id="height"
                      {...register("height")}
                      type="number"
                      className={inputCls}
                      placeholder="150"
                      style={{ MozAppearance: "textfield" }}
                    />
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="weight" className={labelCls}>
                      Berat (kg)
                    </label>
                    <input
                      id="weight"
                      {...register("weight")}
                      type="number"
                      className={inputCls}
                      placeholder="50"
                      style={{ MozAppearance: "textfield" }}
                    />
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="child_position" className={labelCls}>
                      Anak ke-
                    </label>
                    <input
                      id="child_position"
                      {...register("child_position")}
                      type="number"
                      className={inputCls}
                      placeholder="1"
                      style={{ MozAppearance: "textfield" }}
                    />
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="total_siblings" className={labelCls}>
                      Dari total saudara
                    </label>
                    <input
                      id="total_siblings"
                      {...register("total_siblings")}
                      type="number"
                      className={inputCls}
                      placeholder="3"
                      style={{ MozAppearance: "textfield" }}
                    />
                  </div>
                  <div className={fieldWrap}>
                    <label htmlFor="parent_occupation" className={labelCls}>
                      Pekerjaan Orang Tua
                    </label>
                    <input
                      id="parent_occupation"
                      {...register("parent_occupation")}
                      type="text"
                      className={inputCls}
                      placeholder="Wiraswasta"
                    />
                  </div>
                </div>

                {/* Row 5 — 2 form (textarea) */}
                <div className={`grid grid-cols-1 md:grid-cols-2 ${ROW_GAP}`}>
                  <div className={fieldWrap}>
                    <label htmlFor="physical_traits" className={labelCls}>
                      Ciri Fisik{" "}
                      <span
                        className={`ml-2 text-xs font-normal ${
                          !physicalV.isValid ? "text-red-500" : "text-slate-500"
                        }`}
                      >
                        ({physicalV.wordCount}/20 kata)
                      </span>
                    </label>
                    <textarea
                      id="physical_traits"
                      {...register("physical_traits")}
                      className={taCls}
                      rows={4}
                      placeholder={`Contoh:\nTinggi 165 cm, berat 55 kg\nKulit sawo matang\nRambut hitam lurus sebahu\nMata sipit, hidung mancung`}
                      onInput={autoGrow}
                      onChange={(e) =>
                        setValue("physical_traits", e.target.value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    {!physicalV.isValid && (
                      <p className="text-xs text-red-500">
                        {physicalV.message}
                      </p>
                    )}
                  </div>

                  <div className={fieldWrap}>
                    <label htmlFor="medical_history" className={labelCls}>
                      Riwayat Penyakit{" "}
                      <span
                        className={`ml-2 text-xs font-normal ${
                          !medicalV.isValid ? "text-red-500" : "text-slate-500"
                        }`}
                      >
                        ({medicalV.wordCount}/20 kata)
                      </span>
                    </label>
                    <textarea
                      id="medical_history"
                      {...register("medical_history")}
                      className={taCls}
                      rows={4}
                      placeholder={`Contoh:\nAsma ringan (sudah terkontrol)\nMaag kronis\nAlergi seafood\nAtau tulis 'Tidak ada' jika sehat`}
                      onInput={autoGrow}
                      onChange={(e) =>
                        setValue("medical_history", e.target.value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    {!medicalV.isValid && (
                      <p className="text-xs text-red-500">{medicalV.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}

export default memo(BiodataSection);
