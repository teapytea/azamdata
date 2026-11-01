"use client";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import {
  UserCircleIcon,
  UserIcon,
  BookOpenIcon,
  HeartIcon,
  CalendarIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CvFormData } from "../FormProvider";

const calculateAge = (dateOfBirth: string) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const StatusBadge = ({ status }: { status?: string }) => {
  const getStatusConfig = (s?: string) => {
    switch (s?.toLowerCase()) {
      case "approve":
        return {
          color:
            "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25",
          icon: CheckCircleIcon,
          text: "Disetujui",
        };
      case "review":
        return {
          color:
            "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25",
          icon: ClockIcon,
          text: "Review",
        };
      case "reject":
        return {
          color:
            "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25",
          icon: ExclamationCircleIcon,
          text: "Ditolak",
        };
      default:
        return {
          color:
            "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25",
          icon: ClockIcon,
          text: "Draft",
        };
    }
  };
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium ${config.color}`}
    >
      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      {config.text}
    </span>
  );
};

function CVPreview() {
  const { watch } = useFormContext<CvFormData>();
  const formData = watch();

  if (!formData.full_name) {
    return (
      <div className="text-center p-6 sm:p-12 bg-white rounded-xl sm:rounded-2xl shadow-md mx-2 sm:mx-0">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-800">
          CV Anda Masih Kosong
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600 px-4">
          Lengkapi biodata Anda untuk dapat mengajukan ta'aruf kepada kandidat
          lain.
        </p>
        <button
          onClick={() => {
            const tabButtons = document.querySelectorAll('[role="tab"]');
            if (tabButtons[1]) (tabButtons[1] as HTMLElement).click();
          }}
          className="mt-6 bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-secondary transition-colors text-sm sm:text-base"
        >
          Isi CV Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
      {/* Profile Header */}
      <div className="p-4 sm:p-6 text-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="h-20 w-20 sm:h-28 sm:w-28 mx-auto rounded-2xl ring-4 ring-white shadow-lg overflow-hidden mb-4 bg-white">
          {formData.avatar_url ? (
            <img
              src={formData.avatar_url}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <UserCircleIcon className="h-10 w-10 sm:h-14 sm:w-14 text-slate-400" />
            </div>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          {formData.full_name}
        </h2>

        {formData.unique_code && (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold mb-4">
            <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            {formData.unique_code}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
          <StatusBadge status={formData.status} />
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-4 space-y-4">
        {/* Biodata Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-slate-600" />
            Biodata Lengkap
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Status</p>
              <p className="font-semibold text-slate-900">
                {formData.marital_status || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Daerah Asal</p>
              <p className="font-semibold text-slate-900">
                {formData.origin_area || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Penghasilan</p>
              <p className="font-semibold text-slate-900">
                {formData.income_level || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Tinggi/Berat</p>
              <p className="font-semibold text-slate-900">
                {formData.height && formData.weight
                  ? `${formData.height}/${formData.weight}`
                  : "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Anak ke/Saudara</p>
              <p className="font-semibold text-slate-900">
                {formData.child_position && formData.total_siblings
                  ? `${formData.child_position}/${formData.total_siblings}`
                  : "-"}
              </p>
            </div>
          </div>
          {formData.physical_traits && (
            <div className="bg-slate-50 rounded-xl p-3 mt-3">
              <p className="text-slate-500 mb-1 text-xs">Ciri Fisik</p>
              <p className="font-semibold text-slate-900 text-xs">
                {formData.physical_traits}
              </p>
            </div>
          )}
          {formData.medical_history && (
            <div className="bg-slate-50 rounded-xl p-3 mt-3">
              <p className="text-slate-500 mb-1 text-xs">Riwayat Penyakit</p>
              <p className="font-semibold text-slate-900 text-xs">
                {formData.medical_history}
              </p>
            </div>
          )}
        </div>

        {/* Ibadah Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 text-slate-600" />
            Kondisi Ibadah
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Shalat Fardu</p>
              <p className="font-semibold text-slate-900">
                {formData.fard_prayer || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Shalat Sunnah</p>
              <p className="font-semibold text-slate-900">
                {formData.sunnah_prayer || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Bacaan Al-Qur'an</p>
              <p className="font-semibold text-slate-900">
                {formData.quran_reading || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Hafalan Al-Qur'an</p>
              <p className="font-semibold text-slate-900">
                {formData.quran_memorization || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Puasa</p>
              <p className="font-semibold text-slate-900">
                {formData.fasting || "-"}
              </p>
            </div>
          </div>
          {formData.religious_study && (
            <div className="bg-slate-50 rounded-xl p-3 mt-3">
              <p className="text-slate-500 mb-1 text-xs">Kajian</p>
              <p className="font-semibold text-slate-900 text-xs">
                {formData.religious_study}
              </p>
            </div>
          )}
        </div>

        {/* Partner Criteria Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <HeartIcon className="h-4 w-4 text-rose-500" />
            Kriteria Pasangan
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Usia</p>
              <p className="font-semibold text-slate-900">
                {formData.partner_min_age && formData.partner_max_age
                  ? `${formData.partner_min_age}-${formData.partner_max_age}`
                  : formData.partner_min_age
                  ? `${formData.partner_min_age}+`
                  : "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Pendidikan</p>
              <p className="font-semibold text-slate-900">
                {formData.partner_education || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Penghasilan</p>
              <p className="font-semibold text-slate-900">
                {formData.partner_income || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Tinggi Min.</p>
              <p className="font-semibold text-slate-900">
                {formData.partner_min_height
                  ? `${formData.partner_min_height}+`
                  : "-"}
              </p>
            </div>
          </div>
          {formData.partner_physical_traits && (
            <div className="bg-slate-50 rounded-xl p-3 mt-3">
              <p className="text-slate-500 mb-1 text-xs">Ciri Fisik</p>
              <p className="font-semibold text-slate-900 text-xs">
                {formData.partner_physical_traits}
              </p>
            </div>
          )}
          {formData.partner_special_criteria && (
            <div className="bg-slate-50 rounded-xl p-3 mt-3">
              <p className="text-slate-500 mb-1 text-xs">Kriteria Khusus</p>
              <p className="font-semibold text-slate-900 text-xs">
                {formData.partner_special_criteria}
              </p>
            </div>
          )}
        </div>

        {/* Marriage Plans Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-600" />
            Rencana Pernikahan
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Tahun Nikah</p>
              <p className="font-semibold text-slate-900">
                {formData.marriage_year || "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500 mb-1">Tempat Tinggal</p>
              <p className="font-semibold text-slate-900">
                {formData.residence_plan || "-"}
              </p>
            </div>
          </div>
          {formData.marriage_vision_mission && (
            <div className="bg-slate-50 rounded-xl p-3 mt-3">
              <p className="text-slate-500 mb-1 text-xs">
                Visi & Misi Pernikahan
              </p>
              <p className="font-semibold text-slate-900 text-xs whitespace-pre-wrap">
                {formData.marriage_vision_mission}
              </p>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <DocumentTextIcon className="h-4 w-4 text-slate-600" />
            Deskripsi Umum
          </h3>
          <div className="bg-slate-50 rounded-xl p-3">
            {formData.criteria ? (
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {formData.criteria}
              </p>
            ) : (
              <p className="text-slate-400 italic text-xs text-center py-4">
                Belum ada deskripsi
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CVPreview);
