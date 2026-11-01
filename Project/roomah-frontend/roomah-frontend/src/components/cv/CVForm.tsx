"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LoadingSkeleton } from "./LoadingSkeleton";
import AvatarUpload from "./sections/AvatarUpload";
import { useFormContext as useCustomFormContext } from "./FormProvider"; // <-- Ganti nama import
import { useFormState } from "react-hook-form";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

// Dynamic imports for sections
const BiodataSection = dynamic(() => import("./sections/BiodataSection"), {
  ssr: false,
  loading: () => <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />,
});

const IbadahSection = dynamic(() => import("./sections/IbadahSection"), {
  ssr: false,
  loading: () => <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />,
});

const KriteriaSection = dynamic(() => import("./sections/KriteriaSection"), {
  ssr: false,
  loading: () => <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />,
});

const RencanaNikahSection = dynamic(
  () => import("./sections/RencanaNikahSection"),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
    ),
  }
);

const DeskripsiSection = dynamic(() => import("./sections/DeskripsiSection"), {
  ssr: false,
  loading: () => <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />,
});

export default function CVForm() {
  const { handleSubmit, submissionStatus } = useCustomFormContext(); // <-- Gunakan context kita
  const { isSubmitting } = useFormState(); // <-- Gunakan RHF untuk status loading
  return (
    <div className="h-full bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-20">
          {/* Avatar Upload */}
          <AvatarUpload />

          {/* Biodata Section */}
          <Suspense
            fallback={
              <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            }
          >
            <BiodataSection />
          </Suspense>

          {/* Ibadah Section */}
          <Suspense
            fallback={
              <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            }
          >
            <IbadahSection />
          </Suspense>

          {/* Partner Criteria Section */}
          <Suspense
            fallback={
              <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            }
          >
            <KriteriaSection />
          </Suspense>

          {/* Marriage Plans Section */}
          <Suspense
            fallback={
              <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            }
          >
            <RencanaNikahSection />
          </Suspense>

          {/* Description Section */}
          <Suspense
            fallback={
              <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            }
          >
            <DeskripsiSection />
          </Suspense>
          {/* === TOMBOL AKSI BARU DITARUH DI SINI === */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
            {submissionStatus === "success" && (
              <p className="text-sm text-green-600">CV berhasil disimpan!</p>
            )}
            {submissionStatus === "error" && (
              <p className="text-sm text-red-600">
                Gagal menyimpan. Coba lagi.
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
