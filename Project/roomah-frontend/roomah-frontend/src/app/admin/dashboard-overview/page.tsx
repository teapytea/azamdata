"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import KpiCard from "@/components/admin/verifikasi/KpiCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faMoneyBillWave,
  faCheckCircle,
  faExclamationTriangle,
  faUsers,
  faHeart,
  faChartLine,
  faCalendarDay,
  faRefresh,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

// Definisikan tipe data yang lebih detail sesuai hasil RPC
type OverviewStats = {
  kpi: {
    totalUsers: number;
    cvVerified: number;
    activeTaaruf: number;
    totalTopUpThisMonth: number;
  };
  quickStats: {
    signupsToday: number;
    pendingCvs: number;
    successfulTaarufThisMonth: number;
    revenueToday: number;
  };
  recentActivities: {
    type: "CV" | "Payment" | "Sukses" | "Laporan";
    id: string;
    description: string;
    timestamp: string;
  }[];
};

// Enhanced KPI Card Component
const EnhancedKpiCard = ({
  title,
  value,
  icon,
  colorClass,
  trend,
  trendValue,
}: {
  title: string;
  value: number | string;
  icon: any;
  colorClass: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
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
                {typeof value === "number" && title.includes("Top-up")
                  ? `Rp ${value.toLocaleString("id-ID")}`
                  : formatValue(value)}
              </p>
            </div>
          </div>
          {trend && trendValue && (
            <div
              className={`flex items-center space-x-1 ${trendColors[trend]}`}
            >
              <FontAwesomeIcon
                icon={
                  trend === "up"
                    ? faChartLine
                    : trend === "down"
                    ? faChartLine
                    : faChartLine
                }
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

// Enhanced Activity Item Component
const EnhancedActivityItem = ({
  activity,
}: {
  activity: OverviewStats["recentActivities"][0];
}) => {
  const typeConfig = {
    CV: {
      icon: faFileAlt,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      badge: "CV",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    Payment: {
      icon: faMoneyBillWave,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      badge: "Payment",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    Sukses: {
      icon: faCheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badge: "Sukses",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    Laporan: {
      icon: faExclamationTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      badge: "Laporan",
      badgeColor: "bg-red-100 text-red-700",
    },
  };
  const config = typeConfig[activity.type] || typeConfig.Sukses;

  return (
    <div className="flex items-start space-x-4 py-4 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
      <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor}`}>
        <FontAwesomeIcon
          icon={config.icon}
          className={`text-sm ${config.color}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {activity.description ||
            `Aktivitas ${activity.type} dengan ID ${activity.id.substring(
              0,
              6
            )}...`}
        </p>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
          {new Date(activity.timestamp).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badgeColor} flex-shrink-0`}
      >
        {config.badge}
      </span>
    </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gray-200 h-96 rounded-xl"></div>
      <div className="bg-gray-200 h-96 rounded-xl"></div>
    </div>
  </div>
);

export default function DashboardOverviewPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: rpcError } = await supabase.rpc(
        "get_dashboard_overview_stats"
      );
      if (rpcError) throw rpcError;
      setStats(data);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-red-500 mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faRefresh} className="mr-2" />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-gray-400 mb-4">
          <FontAwesomeIcon icon={faChartLine} className="text-4xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak Ada Data
        </h3>
        <p className="text-gray-600">
          Tidak dapat memuat data statistik saat ini.
        </p>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Ringkasan
              </h1>
              <p className="text-gray-600 mt-2">
                Pantau performa platform Ta'aruf Anda secara real-time
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
              </span>
              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <FontAwesomeIcon
                  icon={faRefresh}
                  className={`${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
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
            title="Total Users"
            value={stats.kpi.totalUsers}
            icon={faUsers}
            colorClass="bg-blue-100 text-blue-600"
            trend="up"
            trendValue="+12%"
          />
          <EnhancedKpiCard
            title="CV Verified"
            value={stats.kpi.cvVerified}
            icon={faCheckCircle}
            colorClass="bg-emerald-100 text-emerald-600"
            trend="up"
            trendValue="+8%"
          />
          <EnhancedKpiCard
            title="Active Ta'aruf"
            value={stats.kpi.activeTaaruf}
            icon={faHeart}
            colorClass="bg-pink-100 text-pink-600"
            trend="up"
            trendValue="+15%"
          />
          <EnhancedKpiCard
            title="Total Top-up Bulan Ini"
            value={stats.kpi.totalTopUpThisMonth}
            icon={faMoneyBillWave}
            colorClass="bg-purple-100 text-purple-600"
            trend="up"
            trendValue="+23%"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Aktivitas Terbaru
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                    <FontAwesomeIcon icon={faFilter} className="text-xs" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {stats.recentActivities.length > 0 ? (
                  <div className="px-6 py-2">
                    {stats.recentActivities.map((activity, index) => (
                      <EnhancedActivityItem
                        key={`${activity.id}-${index}`}
                        activity={activity}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-400 mb-3">
                      <FontAwesomeIcon icon={faFileAlt} className="text-3xl" />
                    </div>
                    <p className="text-gray-500">Tidak ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900">
                Statistik Cepat
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Data hari ini dan bulan ini
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-blue-600 text-sm"
                      />
                    </div>
                    <span className="font-medium text-gray-700">
                      Pendaftar Hari Ini
                    </span>
                  </div>
                  <span className="font-bold text-xl text-blue-600">
                    {stats.quickStats.signupsToday}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="text-amber-600 text-sm"
                      />
                    </div>
                    <span className="font-medium text-gray-700">
                      CV Pending
                    </span>
                  </div>
                  <span className="font-bold text-xl text-amber-600">
                    {stats.quickStats.pendingCvs}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-emerald-600 text-sm"
                      />
                    </div>
                    <span className="font-medium text-gray-700">
                      Ta'aruf Sukses
                    </span>
                  </div>
                  <span className="font-bold text-xl text-emerald-600">
                    {stats.quickStats.successfulTaarufThisMonth}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className="text-green-600 text-sm"
                      />
                    </div>
                    <span className="font-semibold text-gray-800">
                      Revenue Hari Ini
                    </span>
                  </div>
                  <span className="font-bold text-2xl text-green-600">
                    Rp {stats.quickStats.revenueToday.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
