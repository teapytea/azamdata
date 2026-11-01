"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import KpiCard from "@/components/admin/verifikasi/KpiCard";
import CvReviewCard from "@/components/admin/verifikasi/CvReviewCard";

// Type definition for CV data
type CvData = {
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
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  SortAsc,
  SortDesc,
} from "lucide-react";

type SortField = "created_at" | "full_name" | "job_title";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "review" | "approve" | "revisi";

export default function VerificationPage() {
  const supabase = createClient();
  const [allCvs, setAllCvs] = useState<CvData[]>([]);
  const [filteredCvs, setFilteredCvs] = useState<CvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("review");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateRange, setDateRange] = useState<string>("all");

  // Fetch CV data with enhanced error handling
  const fetchAllCvData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("cvs")
        .select("*")
        .in("status", ["review", "approve", "revisi"])
        .order(sortField, { ascending: sortOrder === "asc" });

      if (fetchError) throw fetchError;

      const cvData = (data as any[]) || [];
      setAllCvs(cvData);
      applyFiltersAndSearch(cvData, searchTerm, filterStatus, dateRange);
    } catch (e: any) {
      setError(e.message);
      console.error("Error fetching CV data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, sortField, sortOrder]);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback(
    (
      cvs: CvData[],
      search: string,
      status: FilterStatus,
      dateFilter: string
    ) => {
      let filtered = [...cvs];

      // Status filter
      if (status !== "all") {
        filtered = filtered.filter((cv) => cv.status === status);
      }

      // Search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (cv) =>
            cv.nama?.toLowerCase().includes(searchLower) ||
            cv.email?.toLowerCase().includes(searchLower) ||
            cv.posisi?.toLowerCase().includes(searchLower) ||
            cv.phone?.includes(search)
        );
      }

      // Date filter
      if (dateFilter !== "all") {
        const now = new Date();
        const filterDate = new Date();

        switch (dateFilter) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(
              (cv) => new Date(cv.created_at) >= filterDate
            );
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            filtered = filtered.filter(
              (cv) => new Date(cv.created_at) >= filterDate
            );
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            filtered = filtered.filter(
              (cv) => new Date(cv.created_at) >= filterDate
            );
            break;
        }
      }

      setFilteredCvs(filtered);
    },
    []
  );

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFiltersAndSearch(allCvs, value, filterStatus, dateRange);
  };

  // Handle filter change
  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    applyFiltersAndSearch(allCvs, searchTerm, status, dateRange);
  };

  // Handle date filter change
  const handleDateFilterChange = (range: string) => {
    setDateRange(range);
    applyFiltersAndSearch(allCvs, searchTerm, filterStatus, range);
  };

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Update sort field options
  type SortField = "created_at" | "full_name" | "job_title";

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllCvData();
    setIsRefreshing(false);
  };

  // Export data (placeholder)
  const handleExport = () => {
    // Implementation for exporting CV data to Excel/CSV
    console.log("Exporting CV data...");
    // You can implement actual export functionality here
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllCvData();
  }, [fetchAllCvData]);

  // Handle CV status update with better UX
  const handleUpdateStatus = async (
    cvId: string,
    status: "approve" | "revisi"
  ) => {
    try {
      if (status === "revisi") {
        const { error: updateError } = await supabase
          .from("cvs")
          .update({
            status: "revisi",
            updated_at: new Date().toISOString(),
          })
          .eq("id", cvId);

        if (updateError) throw updateError;

        // Show success message with better UX
        const updatedCv = allCvs.find((cv) => cv.id === cvId);
        alert(
          `CV ${updatedCv?.full_name || ""} berhasil ditandai untuk revisi!`
        );
      } else if (status === "approve") {
        const { data: newCode, error: rpcError } = await supabase.rpc(
          "approve_cv",
          { p_cv_id: cvId }
        );

        if (rpcError) throw rpcError;

        const updatedCv = allCvs.find((cv) => cv.id === cvId);
        alert(
          `CV ${
            updatedCv?.full_name || ""
          } berhasil disetujui! Kode Kandidat: ${newCode}`
        );
      }

      // Refresh data after update
      await fetchAllCvData();
    } catch (error: any) {
      console.error("Error updating CV status:", error);
      alert(`Gagal memperbarui status CV: ${error.message}`);
    }
  };

  // Calculate KPI data
  const kpiData = {
    pending: allCvs.filter((cv) => cv.status === "review").length,
    approved: allCvs.filter((cv) => cv.status === "approve").length,
    rejected: allCvs.filter((cv) => cv.status === "revisi").length,
    total: allCvs.length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllCvData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Verifikasi CV
              </h1>
              <p className="mt-2 text-gray-600">
                Kelola dan verifikasi CV kandidat dengan sistem yang
                terintegrasi
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Menunggu Review"
            value={kpiData.pending}
            icon={<Clock className="w-8 h-8" />}
            colorClass="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700"
            trend="+2 hari ini"
          />
          <KpiCard
            title="CV Disetujui"
            value={kpiData.approved}
            icon={<CheckCircle className="w-8 h-8" />}
            colorClass="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700"
            trend="+5 minggu ini"
          />
          <KpiCard
            title="Perlu Revisi"
            value={kpiData.rejected}
            icon={<XCircle className="w-8 h-8" />}
            colorClass="bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700"
            trend="+1 hari ini"
          />
          <KpiCard
            title="Total CV"
            value={kpiData.total}
            icon={<Users className="w-8 h-8" />}
            colorClass="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700"
            trend="+8 minggu ini"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama, email, posisi, atau telepon..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-500 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    handleFilterChange(e.target.value as FilterStatus)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="review">Menunggu Review</option>
                  <option value="approve">Disetujui</option>
                  <option value="revisi">Perlu Revisi</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-500 w-5 h-5" />
                <select
                  value={dateRange}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="week">7 Hari Terakhir</option>
                  <option value="month">30 Hari Terakhir</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSortChange("created_at")}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortField === "created_at"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Tanggal
                  {sortField === "created_at" &&
                    (sortOrder === "asc" ? (
                      <SortAsc className="ml-1 w-4 h-4" />
                    ) : (
                      <SortDesc className="ml-1 w-4 h-4" />
                    ))}
                </button>
                <button
                  onClick={() => handleSortChange("full_name")}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortField === "full_name"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Nama
                  {sortField === "full_name" &&
                    (sortOrder === "asc" ? (
                      <SortAsc className="ml-1 w-4 h-4" />
                    ) : (
                      <SortDesc className="ml-1 w-4 h-4" />
                    ))}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              Menampilkan{" "}
              <span className="font-medium text-gray-900">
                {filteredCvs.length}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-gray-900">{allCvs.length}</span>{" "}
              CV
            </p>
            {(searchTerm ||
              filterStatus !== "review" ||
              dateRange !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("review");
                  setDateRange("all");
                  applyFiltersAndSearch(allCvs, "", "review", "all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* CV Grid */}
        <div>
          {filteredCvs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCvs.map((cv) => (
                <CvReviewCard
                  key={cv.id}
                  cv={cv}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "review" || dateRange !== "all"
                  ? "Tidak ada CV yang cocok"
                  : "Tidak ada CV yang perlu direview"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || filterStatus !== "review" || dateRange !== "all"
                  ? "Coba ubah filter atau kata kunci pencarian untuk melihat hasil yang berbeda."
                  : "Semua CV telah diproses. Kerja bagus! 🎉"}
              </p>
              {(searchTerm ||
                filterStatus !== "review" ||
                dateRange !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setDateRange("all");
                    applyFiltersAndSearch(allCvs, "", "all", "all");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Lihat Semua CV
                </button>
              )}
            </div>
          )}
        </div>

        {/* Load More (if pagination is needed) */}
        {filteredCvs.length > 0 && filteredCvs.length < allCvs.length && (
          <div className="text-center mt-8">
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
