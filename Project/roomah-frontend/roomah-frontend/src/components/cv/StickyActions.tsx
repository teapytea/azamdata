"use client";

import { useFormState } from "react-hook-form";
import { useFormContext } from "./FormProvider";
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { CvFormData } from "./FormProvider";

export function StickyActions() {
  const { isDirty, isSubmitting } = useFormState<CvFormData>();
  const { handleSubmit } = useFormContext();

  if (!isDirty) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
            Perubahan belum disimpan
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Simpan Draft
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
