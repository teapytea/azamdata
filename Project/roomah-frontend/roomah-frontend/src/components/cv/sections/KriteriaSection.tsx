"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { Disclosure } from "@headlessui/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { CvFormData } from "../FormProvider";
import {
  createLongTextHandler,
  validateWordLimit,
} from "../utils/longTextLimiter";

const inputClass =
  "h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-all duration-200";
const selectClass =
  "h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-all duration-200";
const textareaClass =
  "rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-all duration-200 resize-none";

function KriteriaSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>();

  const physicalTraitsValidation = validateWordLimit(
    watch("partner_physical_traits") || "",
    20
  );
  const specialCriteriaValidation = validateWordLimit(
    watch("partner_special_criteria") || "",
    20
  );

  const handlePhysicalTraitsChange = createLongTextHandler(
    setValue,
    "partner_physical_traits",
    { maxWords: 20, titleCase: true }
  );
  const handleSpecialCriteriaChange = createLongTextHandler(
    setValue,
    "partner_special_criteria",
    { maxWords: 20, titleCase: true }
  );

  return (
    <Disclosure>
      {({ open }) => (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all duration-200">
            <div className="flex items-center gap-3">
              <HeartIcon className="h-5 w-5 text-rose-600" />
              <span className="text-sm font-semibold text-slate-900">
                Kriteria Pasangan
              </span>
            </div>
            {open ? (
              <ChevronUpIcon className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-slate-600" />
            )}
          </Disclosure.Button>
          <Disclosure.Panel className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Usia Minimal
                </label>
                <input
                  {...register("partner_min_age")}
                  type="number"
                  className={`${inputClass} w-full`}
                  placeholder="28"
                />
                {errors.partner_min_age && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.partner_min_age.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Usia Maksimal
                </label>
                <input
                  {...register("partner_max_age")}
                  type="number"
                  className={`${inputClass} w-full`}
                  placeholder="35"
                />
                {errors.partner_max_age && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.partner_max_age.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Pendidikan
                </label>
                <select
                  {...register("partner_education")}
                  className={`${selectClass} w-full`}
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Penghasilan
                </label>
                <select
                  {...register("partner_income")}
                  className={`${selectClass} w-full`}
                >
                  <option value="">Pilih Tingkat</option>
                  <option value="Rendah">Rendah</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sangat Tinggi">Sangat Tinggi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Tinggi Minimal (cm)
                </label>
                <input
                  {...register("partner_min_height")}
                  type="number"
                  className={`${inputClass} w-full`}
                  placeholder="170"
                />
                {errors.partner_min_height && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.partner_min_height.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Asal Daerah
                </label>
                <input
                  {...register("partner_origin")}
                  type="text"
                  className={`${inputClass} w-full`}
                  placeholder="Jakarta"
                />
                {errors.partner_origin && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.partner_origin.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Ciri Fisik Pasangan
                  <span
                    className={`ml-2 text-xs ${
                      !physicalTraitsValidation.isValid
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    ({physicalTraitsValidation.wordCount}/20 kata)
                  </span>
                </label>
                <textarea
                  {...register("partner_physical_traits")}
                  rows={3}
                  className={`${textareaClass} w-full ${
                    !physicalTraitsValidation.isValid
                      ? "border-red-300 focus:border-red-600"
                      : ""
                  }`}
                  placeholder="Deskripsi ciri fisik yang diinginkan..."
                  onChange={handlePhysicalTraitsChange}
                />
                {!physicalTraitsValidation.isValid && (
                  <p className="mt-1 text-xs text-red-600">
                    {physicalTraitsValidation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Kriteria Khusus
                  <span
                    className={`ml-2 text-xs ${
                      !specialCriteriaValidation.isValid
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    ({specialCriteriaValidation.wordCount}/20 kata)
                  </span>
                </label>
                <textarea
                  {...register("partner_special_criteria")}
                  rows={3}
                  className={`${textareaClass} w-full ${
                    !specialCriteriaValidation.isValid
                      ? "border-red-300 focus:border-red-600"
                      : ""
                  }`}
                  placeholder="Tidak merokok, suka traveling, dll..."
                  onChange={handleSpecialCriteriaChange}
                />
                {!specialCriteriaValidation.isValid && (
                  <p className="mt-1 text-xs text-red-600">
                    {specialCriteriaValidation.message}
                  </p>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

export default memo(KriteriaSection);
