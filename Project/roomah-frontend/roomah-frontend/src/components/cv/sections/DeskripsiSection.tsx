"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { CvFormData } from "../FormProvider";
import { validateWordLimit } from "../utils/longTextLimiter";

const textareaClass =
  "rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 transition-all duration-200 resize-none";

function DeskripsiSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CvFormData>();

  // Using 200 words for the general description as per original requirement
  const criteriaValidation = validateWordLimit(watch("criteria") || "", 200);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-semibold text-slate-900">
              Deskripsi Umum
            </span>
          </div>
          <span
            className={`text-xs font-medium ${
              !criteriaValidation.isValid ? "text-red-600" : "text-slate-600"
            }`}
          >
            {criteriaValidation.wordCount}/200 kata
          </span>
        </div>
      </div>
      <div className="p-4">
        <textarea
          {...register("criteria")}
          rows={6}
          className={`${textareaClass} w-full ${
            !criteriaValidation.isValid
              ? "border-red-300 focus:border-red-600 focus:ring-red-600/20"
              : ""
          }`}
          placeholder="Ceritakan tentang diri Anda, latar belakang, hobi, dan hal-hal yang menggambarkan kepribadian Anda..."
        />
        {!criteriaValidation.isValid && (
          <p className="mt-2 text-xs text-red-600">
            {criteriaValidation.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(DeskripsiSection);
