"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { Disclosure } from "@headlessui/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
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

function RencanaNikahSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>();

  const visionMissionValidation = validateWordLimit(
    watch("marriage_vision_mission") || "",
    20
  );
  const handleVisionMissionChange = createLongTextHandler(
    setValue,
    "marriage_vision_mission",
    { maxWords: 20, titleCase: true }
  );

  return (
    <Disclosure>
      {({ open }) => (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 transition-all duration-200">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-900">
                Rencana Pernikahan
              </span>
            </div>
            {open ? (
              <ChevronUpIcon className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-slate-600" />
            )}
          </Disclosure.Button>
          <Disclosure.Panel className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Tahun Rencana Nikah
                </label>
                <input
                  {...register("marriage_year")}
                  type="number"
                  className={`${inputClass} w-full`}
                  placeholder="2026"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                />
                {errors.marriage_year && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.marriage_year.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-2">
                  Rencana Tempat Tinggal
                </label>
                <select
                  {...register("residence_plan")}
                  className={`${selectClass} w-full`}
                >
                  <option value="">Pilih Rencana</option>
                  <option value="Ikut Suami">Ikut Suami</option>
                  <option value="Ikut Istri">Ikut Istri</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="Dekat Keluarga">Dekat Keluarga</option>
                  <option value="Bisa Dibicarakan">Bisa Dibicarakan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-900 mb-2">
                Visi & Misi Pernikahan
                <span
                  className={`ml-2 text-xs ${
                    !visionMissionValidation.isValid
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  ({visionMissionValidation.wordCount}/20 kata)
                </span>
              </label>
              <textarea
                {...register("marriage_vision_mission")}
                rows={4}
                className={`${textareaClass} w-full ${
                  !visionMissionValidation.isValid
                    ? "border-red-300 focus:border-red-600"
                    : ""
                }`}
                placeholder="Visi: Membangun keluarga sakinah mawaddah warahmah...&#10;Misi: Saling mendukung dalam kebaikan..."
                onChange={handleVisionMissionChange}
              />
              {!visionMissionValidation.isValid && (
                <p className="mt-1 text-xs text-red-600">
                  {visionMissionValidation.message}
                </p>
              )}
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

export default memo(RencanaNikahSection);
