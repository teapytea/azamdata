"use client";

import { useState } from "react";
import {
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Phone,
  Mail,
  Heart,
  X,
  Eye,
} from "lucide-react";

// Definisikan tipe data untuk CV agar konsisten
export type CvData = {
  id: string;
  full_name: string;
  gender: "Ikhwan" | "Akhwat";
  date_of_birth: string;
  domicile_province: string;
  job_title: string;
  education: string;
  criteria: string;
  phone?: string;
  email?: string;
  status: "review" | "approve" | "revisi";
  created_at: string;
  updated_at?: string;
};

type CvReviewCardProps = {
  cv: CvData;
  onUpdateStatus: (cvId: string, status: "approve" | "revisi") => void;
};

// Modal Component
const CvDetailModal = ({
  cv,
  isOpen,
  onClose,
  onUpdateStatus,
  isProcessing,
}: {
  cv: CvData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: "approve" | "revisi") => void;
  isProcessing: string | null;
}) => {
  if (!isOpen) return null;

  const age = calculateAge(cv.date_of_birth);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${
                cv.gender === "Ikhwan" ? "bg-blue-500" : "bg-pink-500"
              } text-white flex items-center justify-center font-bold text-lg`}
            >
              {cv.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {cv.full_name}
              </h2>
              <p className="text-gray-500 text-sm">{cv.job_title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informasi Personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Gender
                </label>
                <p className="text-gray-900 font-medium">{cv.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Usia
                </label>
                <p className="text-gray-900 font-medium">{age} tahun</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">
                  Domisili
                </label>
                <p className="text-gray-900 font-medium">
                  {cv.domicile_province}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Informasi Profesional
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Profesi
                </label>
                <p className="text-gray-900 font-medium">{cv.job_title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Pendidikan
                </label>
                <p className="text-gray-900 font-medium">{cv.education}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {(cv.email || cv.phone) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                Informasi Kontak
              </h3>
              <div className="space-y-2">
                {cv.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{cv.email}</span>
                  </div>
                )}
                {cv.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{cv.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-600" />
              Deskripsi & Visi
            </h3>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cv.criteria || "Tidak ada deskripsi tersedia."}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="text-sm text-gray-500 flex items-center gap-2 pt-2 border-t">
            <Clock className="w-4 h-4" />
            <span>Dikirim pada: {formatDate(cv.created_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={() => onUpdateStatus("revisi")}
            disabled={isProcessing !== null}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-orange-700 bg-orange-100 rounded-xl hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {isProcessing === "revisi" ? (
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileEdit className="w-4 h-4" />
            )}
            Minta Revisi
          </button>

          <button
            onClick={() => onUpdateStatus("revisi")}
            disabled={isProcessing !== null}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-red-700 bg-red-100 rounded-xl hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {isProcessing === "revisi" ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Tolak
          </button>

          <button
            onClick={() => onUpdateStatus("approve")}
            disabled={isProcessing !== null}
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
          >
            {isProcessing === "approve" ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Setujui
          </button>
        </div>
      </div>
    </div>
  );
};

// Fungsi helper untuk menghitung umur
const calculateAge = (dob: string) => {
  if (!dob) return "-";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Fungsi helper untuk mendapatkan initial
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Fungsi helper untuk status
const getStatusConfig = (status: string) => {
  const configs = {
    review: {
      color: "border-yellow-300 bg-yellow-50",
      dot: "bg-yellow-400",
      text: "Menunggu Review",
      icon: <Clock className="w-4 h-4 text-yellow-600" />,
    },
    approve: {
      color: "border-green-300 bg-green-50",
      dot: "bg-green-400",
      text: "Disetujui",
      icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    },
    revisi: {
      color: "border-red-300 bg-red-50",
      dot: "bg-red-400",
      text: "Perlu Revisi",
      icon: <XCircle className="w-4 h-4 text-red-600" />,
    },
  };

  return configs[status as keyof typeof configs] || configs.review;
};

export default function CvReviewCard({
  cv,
  onUpdateStatus,
}: CvReviewCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleStatusUpdate = async (status: "approve" | "revisi") => {
    setIsProcessing(status);
    try {
      await onUpdateStatus(cv.id, status);
      setIsModalOpen(false);
    } finally {
      setIsProcessing(null);
    }
  };

  const age = calculateAge(cv.date_of_birth);
  const initials = getInitials(cv.full_name);
  const statusConfig = getStatusConfig(cv.status);

  return (
    <>
      {/* Card Grid Item */}
      <div
        className={`relative bg-white rounded-xl border-2 ${statusConfig.color} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${statusConfig.dot} animate-pulse`}
          ></div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full ${
              cv.gender === "Ikhwan"
                ? "bg-gradient-to-br from-blue-400 to-blue-600"
                : "bg-gradient-to-br from-pink-400 to-pink-600"
            } text-white flex items-center justify-center text-xl font-bold shadow-lg`}
          >
            {initials}
          </div>
        </div>

        {/* Basic Info */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
            {cv.full_name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{cv.job_title}</p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {cv.gender}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {age}th
            </span>
          </div>
        </div>

        {/* Education & Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">{cv.education}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="truncate">{cv.domicile_province}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          {statusConfig.icon}
          <span className="text-gray-700">{statusConfig.text}</span>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 flex items-center justify-center">
          <Eye className="w-8 h-8 text-blue-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        </div>

        {/* Quick Action Buttons - Show on Hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate("revisi");
              }}
              disabled={isProcessing !== null}
              className="flex-1 py-2 text-xs font-semibold text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Revisi
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate("approve");
              }}
              disabled={isProcessing !== null}
              className="flex-1 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Setujui
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <CvDetailModal
        cv={cv}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleStatusUpdate}
        isProcessing={isProcessing}
      />
    </>
  );
}
