"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { Disclosure } from "@headlessui/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  BookOpenIcon,
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

function IbadahSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>();

  const religiousStudyValidation = validateWordLimit(
    watch("religious_study") || "",
    20
  );
  const handleReligiousStudyChange = createLongTextHandler(
    setValue,
    "religious_study",
    { maxWords: 20, titleCase: true }
  );

  return (
    <Disclosure>
      {({ open }) => (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
            <div className="flex items-center gap-3">
              <BookOpenIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-slate-900">
                Kondisi Ibadah
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
                  Shalat Fardu
                </label>
                <select
                  {...register("fard_prayer")}
                  className={`${selectClass} w-full`}
                >
                  <option value="">Pilih Status</option>
                  <option value="Terjaga">Terjaga</option>
                  <option value="Kadang-kadang">Kadang-kadang</option>
                  <option value="Belum Istiqomah">Belum Istiqomah</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Shalat Sunnah
                </label>
                <input
                  {...register("sunnah_prayer")}
                  type="text"
                  className={`${inputClass} w-full`}
                  placeholder="Tahajud, Dhuha, dll"
                />
                {errors.sunnah_prayer && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.sunnah_prayer.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Bacaan Al-Qur'an
                </label>
                <select
                  {...register("quran_reading")}
                  className={`${selectClass} w-full`}
                >
                  <option value="">Pilih Level</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Masih Belajar">Masih Belajar</option>
                  <option value="Belum Bisa">Belum Bisa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Hafalan Al-Qur'an
                </label>
                <input
                  {...register("quran_memorization")}
                  type="text"
                  className={`${inputClass} w-full`}
                  placeholder="Juz 30"
                />
                {errors.quran_memorization && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.quran_memorization.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Puasa
                </label>
                <input
                  {...register("fasting")}
                  type="text"
                  className={`${inputClass} w-full`}
                  placeholder="Senin Kamis, Arafah, dll"
                />
                {errors.fasting && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.fasting.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-900 mb-2">
                Kajian yang Diikuti
                <span
                  className={`ml-2 text-xs ${
                    !religiousStudyValidation.isValid
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  ({religiousStudyValidation.wordCount}/20 kata)
                </span>
              </label>
              <textarea
                {...register("religious_study")}
                rows={3}
                className={`${textareaClass} w-full ${
                  !religiousStudyValidation.isValid
                    ? "border-red-300 focus:border-red-600"
                    : ""
                }`}
                placeholder="Online - Ustadz Adi Hidayat, Ustadz Felix S dan dr. Aisah Dahlan"
                onChange={handleReligiousStudyChange}
              />
              {!religiousStudyValidation.isValid && (
                <p className="mt-1 text-xs text-red-600">
                  {religiousStudyValidation.message}
                </p>
              )}
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

export default memo(IbadahSection);
