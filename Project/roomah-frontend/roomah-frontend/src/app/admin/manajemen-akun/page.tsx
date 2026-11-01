"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPen,
  faTrash,
  faSearch,
  faFilter,
  faUsers,
  faUserCheck,
  faUserClock,
  faUserTimes,
  faDownload,
  faPlus,
  faSortAmountDown,
  faSortAmountUp,
  faRefresh,
  faMars,
  faVenus,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Enhanced type definitions
type Participant = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  gender: string | null;
  cv_status: string;
  last_sign_in_at: string | null;
};

// Filter and Sort types
type FilterOptions = {
  gender: string;
  cv_status: string;
  search: string;
};

type SortOptions = {
  field: keyof Participant;
  direction: "asc" | "desc";
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    approve: {
      label: "Terverifikasi",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: faUserCheck,
    },
    review: {
      label: "Pending Review",
      className: "bg-amber-100 text-amber-800 border-amber-200",
      icon: faUserClock,
    },
    revisi: {
      label: "Perlu Revisi",
      className: "bg-red-100 text-red-800 border-red-200",
      icon: faUserTimes,
    },
    default: {
      label: "Belum Isi CV",
      className: "bg-gray-100 text-gray-800 border-gray-200",
      icon: faUsers,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <FontAwesomeIcon icon={config.icon} className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon,
  color,
  description,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  description: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <FontAwesomeIcon icon={icon} className="text-xl text-white" />
      </div>
    </div>
  </div>
);

// Enhanced Filter Dropdown Component
const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; icon?: any; color?: string }[];
  onChange: (value: string) => void;
  icon?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative filter-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-w-[160px] px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center">
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className="mr-2 w-4 h-4 text-gray-500"
            />
          )}
          <div className="text-left">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {label}
            </div>
            <div className="flex items-center mt-0.5">
              {selectedOption?.icon && (
                <FontAwesomeIcon
                  icon={selectedOption.icon}
                  className={`mr-1.5 w-3 h-3 ${
                    selectedOption.color || "text-gray-400"
                  }`}
                />
              )}
              <span className="text-gray-900 font-medium">
                {selectedOption?.label || "Semua"}
              </span>
            </div>
          </div>
        </div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`ml-2 w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="py-2">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm text-left transition-colors duration-150 ${
                    value === option.value
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.icon && (
                    <FontAwesomeIcon
                      icon={option.icon}
                      className={`mr-3 w-4 h-4 ${
                        value === option.value
                          ? "text-blue-500"
                          : option.color || "text-gray-400"
                      }`}
                    />
                  )}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.value === "" && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Tampilkan semua data
                      </div>
                    )}
                  </div>
                  {value === option.value && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="ml-auto w-4 h-4 text-blue-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(totalPages, currentPage + 3)
  );

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-700">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default function ManageAccountsPage() {
  const supabase = createClient();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination states
  const [filters, setFilters] = useState<FilterOptions>({
    gender: "",
    cv_status: "",
    search: "",
  });
  const [sort, setSort] = useState<SortOptions>({
    field: "full_name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch participants data
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        const { data, error: rpcError } = await supabase.rpc(
          "get_all_participants"
        );
        if (rpcError) throw rpcError;
        setParticipants(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParticipants();
  }, [supabase]);

  // Filter and sort participants
  useEffect(() => {
    let filtered = [...participants];

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.gender) {
      filtered = filtered.filter((p) => p.gender === filters.gender);
    }
    if (filters.cv_status) {
      filtered = filtered.filter((p) => p.cv_status === filters.cv_status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sort.field] || "";
      const bVal = b[sort.field] || "";
      const direction = sort.direction === "asc" ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });

    setFilteredParticipants(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [participants, filters, sort]);

  // Calculate statistics
  const stats = {
    total: participants.length,
    verified: participants.filter((p) => p.cv_status === "approve").length,
    pending: participants.filter((p) => p.cv_status === "review").length,
    revision: participants.filter((p) => p.cv_status === "revisi").length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error: {error}</div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manajemen Akun Peserta</h1>
            <p className="text-blue-100 text-lg">
              Kelola dan pantau semua akun peserta dalam platform
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              title="Refresh Data"
            >
              <FontAwesomeIcon icon={faRefresh} className="text-xl" />
            </button>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Tambah Peserta
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Peserta"
          value={stats.total}
          icon={faUsers}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          description="Semua peserta terdaftar"
        />
        <StatsCard
          title="Terverifikasi"
          value={stats.verified}
          icon={faUserCheck}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          description="CV telah disetujui"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={faUserClock}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          description="Menunggu verifikasi"
        />
        <StatsCard
          title="Perlu Revisi"
          value={stats.revision}
          icon={faUserTimes}
          color="bg-gradient-to-br from-red-500 to-red-600"
          description="CV perlu diperbaiki"
        />
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faSearch}
                className="h-5 w-5 text-gray-400"
              />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email peserta..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="block w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white hover:border-gray-300"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Gender Filter */}
              <FilterDropdown
                label="Gender"
                value={filters.gender}
                icon={faUsers}
                options={[
                  {
                    value: "",
                    label: "Semua Gender",
                    icon: faUsers,
                    color: "text-gray-500",
                  },
                  {
                    value: "ikhwan",
                    label: "Ikhwan",
                    icon: faMars,
                    color: "text-blue-500",
                  },
                  {
                    value: "akhwat",
                    label: "Akhwat",
                    icon: faVenus,
                    color: "text-pink-500",
                  },
                ]}
                onChange={(value) => setFilters({ ...filters, gender: value })}
              />

              {/* Status CV Filter */}
              <FilterDropdown
                label="Status CV"
                value={filters.cv_status}
                icon={faFileLines}
                options={[
                  {
                    value: "",
                    label: "Semua Status",
                    icon: faFileLines,
                    color: "text-gray-500",
                  },
                  {
                    value: "approve",
                    label: "Terverifikasi",
                    icon: faUserCheck,
                    color: "text-emerald-500",
                  },
                  {
                    value: "review",
                    label: "Pending Review",
                    icon: faUserClock,
                    color: "text-amber-500",
                  },
                  {
                    value: "revisi",
                    label: "Perlu Revisi",
                    icon: faUserTimes,
                    color: "text-red-500",
                  },
                ]}
                onChange={(value) =>
                  setFilters({ ...filters, cv_status: value })
                }
              />

              {/* Clear Filters */}
              {(filters.search || filters.gender || filters.cv_status) && (
                <button
                  onClick={() =>
                    setFilters({ search: "", gender: "", cv_status: "" })
                  }
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2 w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Sort Button */}
              <button
                onClick={() =>
                  setSort({
                    ...sort,
                    direction: sort.direction === "asc" ? "desc" : "asc",
                  })
                }
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                title={`Sort ${
                  sort.direction === "asc" ? "Descending" : "Ascending"
                }`}
              >
                <FontAwesomeIcon
                  icon={
                    sort.direction === "asc" ? faSortAmountUp : faSortAmountDown
                  }
                  className="mr-2 w-4 h-4"
                />
                Sort {sort.direction === "asc" ? "A-Z" : "Z-A"}
              </button>

              {/* Export Button */}
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow-md">
                <FontAwesomeIcon icon={faDownload} className="mr-2 w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.gender || filters.cv_status) && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600 font-medium">
                Active filters:
              </span>
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <FontAwesomeIcon icon={faSearch} className="mr-1 w-3 h-3" />
                  Search: "{filters.search}"
                </span>
              )}
              {filters.gender && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <FontAwesomeIcon
                    icon={filters.gender === "ikhwan" ? faMars : faVenus}
                    className="mr-1 w-3 h-3"
                  />
                  Gender: {filters.gender === "ikhwan" ? "Ikhwan" : "Akhwat"}
                </span>
              )}
              {filters.cv_status && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <FontAwesomeIcon
                    icon={
                      filters.cv_status === "approve"
                        ? faUserCheck
                        : filters.cv_status === "review"
                        ? faUserClock
                        : filters.cv_status === "revisi"
                        ? faUserTimes
                        : faFileLines
                    }
                    className="mr-1 w-3 h-3"
                  />
                  Status:{" "}
                  {filters.cv_status === "approve"
                    ? "Terverifikasi"
                    : filters.cv_status === "review"
                    ? "Pending Review"
                    : filters.cv_status === "revisi"
                    ? "Perlu Revisi"
                    : filters.cv_status}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Peserta
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status CV
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Terakhir Aktif
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedParticipants.map((participant) => (
                <tr
                  key={participant.user_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                          {participant.full_name?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {participant.full_name || "Nama Tidak Tersedia"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {participant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {participant.gender ? (
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={
                            participant.gender === "ikhwan" ? faMars : faVenus
                          }
                          className={`mr-2 ${
                            participant.gender === "ikhwan"
                              ? "text-blue-500"
                              : "text-pink-500"
                          }`}
                        />
                        <span className="text-sm text-gray-900 capitalize">
                          {participant.gender}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={participant.cv_status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {participant.last_sign_in_at
                      ? new Date(
                          participant.last_sign_in_at
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Belum pernah"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Link
                        href={`/admin/manajemen-akun/${participant.user_id}`}
                      >
                        <button
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </Link>
                      <button
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Peserta"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Peserta"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredParticipants.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon
            icon={faUsers}
            className="text-6xl text-gray-300 mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tidak Ada Data
          </h3>
          <p className="text-gray-600">
            {filters.search || filters.gender || filters.cv_status
              ? "Tidak ada peserta yang sesuai dengan filter yang dipilih."
              : "Belum ada peserta yang terdaftar."}
          </p>
        </div>
      )}
    </div>
  );
}
