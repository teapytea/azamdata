"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUser,
  faFileLines,
  faCreditCard,
  faHeart,
  faCalendarAlt,
  faMapMarkerAlt,
  faBriefcase,
  faGraduationCap,
  faShieldAlt,
  faCoins,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faUserCircle,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faVenus,
  faMars,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

// Enhanced type definitions
type UserDetails = {
  auth_info: { email: string; full_name: string } | null;
  profile: {
    id: string;
    role: string;
    coin_balance: number;
    is_suspended: boolean;
  } | null;
  cv: { [key: string]: any } | null;
  transactions:
    | { id: string; amount_paid: number; status: string; created_at: string }[]
    | null;
  taaruf_processes:
    | {
        id: string;
        ikhwan_name: string;
        akhwat_name: string;
        current_stage: string;
      }[]
    | null;
};

// Status Badge Component
const StatusBadge = ({
  status,
  type = "default",
}: {
  status: string;
  type?: "success" | "warning" | "danger" | "info" | "default";
}) => {
  const colors = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[type]}`}
    >
      {status}
    </span>
  );
};

// Enhanced Card Component
const InfoCard = ({
  title,
  icon,
  children,
  className = "",
  headerAction,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    <div className="p-6 border-b border-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white mr-3">
            <FontAwesomeIcon icon={icon} className="text-sm" />
          </div>
          <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
        </div>
        {headerAction}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// Enhanced Detail Row
const DetailRow = ({
  label,
  value,
  icon,
  type = "text",
}: {
  label: string;
  value: any;
  icon?: any;
  type?: "text" | "currency" | "date" | "badge" | "email";
}) => {
  const formatValue = () => {
    if (value === null || value === undefined || value === "") return "-";

    switch (type) {
      case "currency":
        return `Rp ${Number(value).toLocaleString("id-ID")}`;
      case "date":
        return new Date(value).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {value}
          </a>
        );
      default:
        return String(value);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center">
        {icon && (
          <FontAwesomeIcon icon={icon} className="text-gray-400 w-4 h-4 mr-3" />
        )}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-semibold text-right max-w-xs">
        {formatValue()}
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats = ({ details }: { details: UserDetails }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm font-medium">Status Akun</p>
          <p className="text-2xl font-bold">
            {details?.profile?.is_suspended ? "Suspended" : "Aktif"}
          </p>
        </div>
        <FontAwesomeIcon
          icon={faShieldAlt}
          className="text-3xl text-blue-200"
        />
      </div>
    </div>

    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm font-medium">Saldo Koin</p>
          <p className="text-2xl font-bold">
            {details?.profile?.coin_balance || 0}
          </p>
        </div>
        <FontAwesomeIcon icon={faCoins} className="text-3xl text-emerald-200" />
      </div>
    </div>

    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-100 text-sm font-medium">Total Transaksi</p>
          <p className="text-2xl font-bold">
            {details?.transactions?.length || 0}
          </p>
        </div>
        <FontAwesomeIcon
          icon={faCreditCard}
          className="text-3xl text-purple-200"
        />
      </div>
    </div>

    <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 rounded-2xl text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-pink-100 text-sm font-medium">Proses Ta'aruf</p>
          <p className="text-2xl font-bold">
            {details?.taaruf_processes?.length || 0}
          </p>
        </div>
        <FontAwesomeIcon icon={faHeart} className="text-3xl text-pink-200" />
      </div>
    </div>
  </div>
);

export default function UserDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const userId = params.user_id as string;
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase.rpc("get_user_details_for_admin", {
        p_user_id: userId,
      });
      setDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const displayName =
    details?.cv?.full_name ||
    details?.auth_info?.full_name ||
    "Nama Tidak Tersedia";

  const getTransactionStatusType = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const getTaarufStageType = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail pengguna...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-4xl text-gray-400 mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Data Tidak Ditemukan
        </h3>
        <p className="text-gray-600 mb-6">
          Data pengguna dengan ID tersebut tidak ditemukan.
        </p>
        <Link
          href="/admin/manajemen-akun"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Kembali ke Manajemen Akun
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/admin/manajemen-akun"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Kembali ke Manajemen Akun
          </Link>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit Pengguna
          </button>
        </div>

        <div className="flex items-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mr-4">
            <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
            <div className="flex items-center mt-1 space-x-4">
              <p className="text-gray-500 text-sm">ID: {userId}</p>
              <StatusBadge
                status={details.profile?.is_suspended ? "Suspended" : "Aktif"}
                type={details.profile?.is_suspended ? "danger" : "success"}
              />
              <StatusBadge
                status={details.profile?.role || "User"}
                type="info"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats details={details} />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Account Profile */}
          <InfoCard title="Informasi Akun" icon={faUser}>
            <div className="space-y-2">
              <DetailRow
                label="Nama Lengkap"
                value={details.auth_info?.full_name}
                icon={faUser}
              />
              <DetailRow
                label="Email"
                value={details.auth_info?.email}
                icon={faEnvelope}
                type="email"
              />
              <DetailRow
                label="Role"
                value={details.profile?.role}
                icon={faShieldAlt}
              />
              <DetailRow
                label="Saldo Koin"
                value={details.profile?.coin_balance}
                icon={faCoins}
                type="currency"
              />
            </div>
          </InfoCard>

          {/* CV Data */}
          <InfoCard title="Data Profil" icon={faFileLines}>
            {details.cv ? (
              <div className="space-y-2">
                {/* Personal Information */}
                {details.cv.full_name && (
                  <DetailRow
                    label="Nama Lengkap"
                    value={details.cv.full_name}
                    icon={faUser}
                  />
                )}
                {details.cv.date_birth && (
                  <DetailRow
                    label="Tanggal Lahir"
                    value={details.cv.date_birth}
                    icon={faBirthdayCake}
                    type="date"
                  />
                )}
                {details.cv.age && (
                  <DetailRow
                    label="Usia"
                    value={`${details.cv.age} tahun`}
                    icon={faClock}
                  />
                )}
                {details.cv.gender && (
                  <DetailRow
                    label="Jenis Kelamin"
                    value={
                      details.cv.gender === "ikhwan" ? "Laki-laki" : "Perempuan"
                    }
                    icon={details.cv.gender === "ikhwan" ? faMars : faVenus}
                  />
                )}
                {details.cv.domicile_prov && (
                  <DetailRow
                    label="Domisili"
                    value={details.cv.domicile_prov}
                    icon={faMapMarkerAlt}
                  />
                )}

                {/* Professional Information */}
                {details.cv.job_title && (
                  <DetailRow
                    label="Pekerjaan"
                    value={details.cv.job_title}
                    icon={faBriefcase}
                  />
                )}
                {details.cv.education && (
                  <DetailRow
                    label="Pendidikan"
                    value={details.cv.education}
                    icon={faGraduationCap}
                  />
                )}

                {/* Ta'aruf Information */}
                {details.cv.criteria && (
                  <DetailRow
                    label="Kriteria Pasangan"
                    value={details.cv.criteria}
                    icon={faHeart}
                  />
                )}
                {details.cv.taaruf_cost && (
                  <DetailRow
                    label="Biaya Ta'aruf"
                    value={details.cv.taaruf_cost}
                    icon={faCoins}
                    type="currency"
                  />
                )}
                {details.cv.status && (
                  <DetailRow
                    label="Status CV"
                    value={details.cv.status}
                    icon={faCheckCircle}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faFileLines}
                  className="text-4xl text-gray-300 mb-3"
                />
                <p className="text-gray-500">
                  Pengguna ini belum mengisi profil lengkap.
                </p>
              </div>
            )}
          </InfoCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Transaction History */}
          <InfoCard title="Riwayat Transaksi" icon={faCreditCard}>
            {details.transactions && details.transactions.length > 0 ? (
              <div className="space-y-4">
                {details.transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-semibold text-gray-900">
                        Rp {transaction.amount_paid.toLocaleString("id-ID")}
                      </div>
                      <StatusBadge
                        status={transaction.status}
                        type={getTransactionStatusType(transaction.status)}
                      />
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                      {new Date(transaction.created_at).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
                {details.transactions.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Lihat Semua ({details.transactions.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faCreditCard}
                  className="text-4xl text-gray-300 mb-3"
                />
                <p className="text-gray-500 text-sm">
                  Tidak ada riwayat transaksi.
                </p>
              </div>
            )}
          </InfoCard>

          {/* Ta'aruf Processes */}
          <InfoCard title="Proses Ta'aruf" icon={faHeart}>
            {details.taaruf_processes && details.taaruf_processes.length > 0 ? (
              <div className="space-y-4">
                {details.taaruf_processes.map((process) => (
                  <div key={process.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-pink-500 mr-2"
                      />
                      <span className="font-medium text-gray-900">
                        {displayName === process.ikhwan_name
                          ? process.akhwat_name
                          : process.ikhwan_name}
                      </span>
                    </div>
                    <StatusBadge
                      status={process.current_stage.replace("_", " ")}
                      type={getTaarufStageType(process.current_stage)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-4xl text-gray-300 mb-3"
                />
                <p className="text-gray-500 text-sm">
                  Tidak terlibat dalam proses ta'aruf.
                </p>
              </div>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
