// src/app/admin/koin-transaksi/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faMoneyBillWave,
  faChartLine,
  faDownload,
  faPlus,
  faFilter,
  faSearch,
  faRefresh,
  faEye,
  faCalendarAlt,
  faCreditCard,
  faUsers,
  faArrowUp,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

// Definisikan tipe data yang akan dikembalikan oleh fungsi RPC
type Transaction = {
  transaction_id: string;
  created_at: string;
  user_id: string;
  full_name: string | null;
  amount_paid: number;
  coins_purchased: number;
  status: string;
  payment_gateway_id: string | null;
};

// Enhanced KPI Card Component
const EnhancedKpiCard = ({
  title,
  value,
  icon,
  colorClass,
  trend,
  trendValue,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: any;
  colorClass: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  subtitle?: string;
}) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  };

  const formatValue = (val: number | string) => {
    if (typeof val === "number" && val > 999999) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (typeof val === "number" && val > 999) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className={`p-3 rounded-lg ${colorClass} group-hover:scale-110 transition-transform duration-300`}
            >
              <FontAwesomeIcon icon={icon} className="text-lg" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === "number" &&
                (title.includes("Revenue") || title.includes("Total"))
                  ? `Rp ${value.toLocaleString("id-ID")}`
                  : formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && trendValue && (
            <div
              className={`flex items-center space-x-1 ${trendColors[trend]}`}
            >
              <FontAwesomeIcon
                icon={faArrowUp}
                className={`text-xs ${trend === "down" ? "rotate-180" : ""}`}
              />
              <span className="text-xs font-medium">{trendValue}</span>
              <span className="text-xs text-gray-400">vs bulan lalu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Transaction Table Row Component
const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return {
          icon: faCheckCircle,
          text: "Berhasil",
          bgClass: "bg-green-100 text-green-800",
          iconClass: "text-green-600",
        };
      case "pending":
        return {
          icon: faClock,
          text: "Pending",
          bgClass: "bg-yellow-100 text-yellow-800",
          iconClass: "text-yellow-600",
        };
      case "failed":
        return {
          icon: faTimesCircle,
          text: "Gagal",
          bgClass: "bg-red-100 text-red-800",
          iconClass: "text-red-600",
        };
      default:
        return {
          icon: faInfoCircle,
          text: status,
          bgClass: "bg-gray-100 text-gray-800",
          iconClass: "text-gray-600",
        };
    }
  };

  const statusConfig = getStatusConfig(transaction.status);

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FontAwesomeIcon
              icon={faCreditCard}
              className="text-blue-600 text-sm"
            />
          </div>
          <div>
            <p className="font-mono text-xs font-medium text-gray-900">
              {transaction.payment_gateway_id ||
                transaction.transaction_id.substring(0, 12)}
            </p>
            <p className="text-xs text-gray-500">
              ID: {transaction.transaction_id.substring(0, 8)}...
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {transaction.full_name
                ? transaction.full_name.charAt(0).toUpperCase()
                : "?"}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {transaction.full_name || "Pengguna Dihapus"}
            </p>
            <p className="text-xs text-gray-500">
              {transaction.user_id.substring(0, 8)}...
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-right">
          <p className="font-bold text-gray-900">
            Rp {transaction.amount_paid.toLocaleString("id-ID")}
          </p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faCoins} className="text-yellow-600 text-sm" />
          <span className="font-semibold text-gray-900">
            {transaction.coins_purchased.toLocaleString("id-ID")}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm">
          <p className="text-gray-900">
            {new Date(transaction.created_at).toLocaleDateString("id-ID")}
          </p>
          <p className="text-gray-500">
            {new Date(transaction.created_at).toLocaleTimeString("id-ID")}
          </p>
        </div>
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${statusConfig.bgClass}`}
        >
          <FontAwesomeIcon
            icon={statusConfig.icon}
            className={statusConfig.iconClass}
          />
          <span>{statusConfig.text}</span>
        </span>
      </td>
      <td className="p-4">
        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
          <FontAwesomeIcon icon={faEye} />
        </button>
      </td>
    </tr>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
      ))}
    </div>
    <div className="bg-gray-200 h-96 rounded-xl"></div>
  </div>
);

export default function KoinTransaksiPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCoins: 0,
    transactionsThisMonth: 0,
    growthPercent: 0,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: rpcError } = await supabase.rpc(
        "get_all_transactions"
      );

      if (rpcError) throw rpcError;
      setTransactions(data || []);
      setFilteredTransactions(data || []);

      // Calculate stats
      const total =
        data?.reduce((sum: number, t: Transaction) => sum + t.amount_paid, 0) ||
        0;
      const totalCoins =
        data?.reduce(
          (sum: number, t: Transaction) => sum + t.coins_purchased,
          0
        ) || 0;
      const thisMonth =
        data?.filter(
          (t: Transaction) =>
            new Date(t.created_at).getMonth() === new Date().getMonth()
        ).length || 0;

      setStats({
        totalRevenue: total,
        totalCoins,
        transactionsThisMonth: thisMonth,
        growthPercent: 23, // This would come from your backend
      });

      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.transaction_id.includes(searchTerm) ||
          t.payment_gateway_id?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter((t) => new Date(t.created_at) >= filterDate);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, dateFilter]);

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-red-500 mb-4">
          <FontAwesomeIcon icon={faTimesCircle} className="text-4xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faRefresh} className="mr-2" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Koin & Transaksi
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola transaksi koin dan pantau pendapatan platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
              </span>
              <button
                onClick={fetchTransactions}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
              >
                <FontAwesomeIcon
                  icon={faRefresh}
                  className={`${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2">
                <FontAwesomeIcon icon={faPlus} />
                <span>Top-up Manual</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedKpiCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={faMoneyBillWave}
            colorClass="bg-green-100 text-green-600"
            trend="up"
            trendValue="+18%"
            subtitle="Keseluruhan"
          />
          <EnhancedKpiCard
            title="Koin Terdistribusi"
            value={stats.totalCoins}
            icon={faCoins}
            colorClass="bg-yellow-100 text-yellow-600"
            trend="up"
            trendValue="+12%"
            subtitle="Total koin"
          />
          <EnhancedKpiCard
            title="Transaksi Bulan Ini"
            value={stats.transactionsThisMonth}
            icon={faChartLine}
            colorClass="bg-blue-100 text-blue-600"
            trend="up"
            trendValue="+8%"
            subtitle="Periode ini"
          />
          <EnhancedKpiCard
            title="Growth Rate"
            value={`${stats.growthPercent}%`}
            icon={faArrowUp}
            colorClass="bg-purple-100 text-purple-600"
            trend="up"
            trendValue="+5%"
            subtitle="Pertumbuhan"
          />
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari transaksi, nama, atau ID..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="success">Berhasil</option>
                <option value="pending">Pending</option>
                <option value="failed">Gagal</option>
              </select>

              {/* Date Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                <FontAwesomeIcon icon={faFilter} />
                <span>Filter Lanjut</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                <FontAwesomeIcon icon={faDownload} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Riwayat Transaksi
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTransactions.length} dari {transactions.length}{" "}
                  transaksi
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  Total pengguna:{" "}
                  {new Set(transactions.map((t) => t.user_id)).size}
                </span>
              </div>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID Transaksi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Koin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.transaction_id}
                      transaction={transaction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <FontAwesomeIcon icon={faCoins} className="text-4xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Transaksi
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Tidak ada transaksi yang sesuai dengan filter yang dipilih."
                  : "Belum ada transaksi yang tercatat."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
