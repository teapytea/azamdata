"use client";

import { useEffect, useState, useCallback } from "react";
import KanbanBoard from "@/components/admin/taaruf/KanbanBoard";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHeart,
  faVideo,
  faComments,
  faTurnUp,
  faCalendarAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// Tipe data untuk statistik KPI
type TaarufStats = {
  active: number;
  khitbah: number;
  zoom: number;
  konseling: number;
  total: number;
  thisMonth: number;
  successRate: number;
};

// KPI Card Component
const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  colorClass,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  colorClass: string;
  isLoading?: boolean;
}) => (
  <div
    className={`bg-gradient-to-r ${colorClass} rounded-lg p-4 text-white shadow-sm`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium opacity-90 mb-1">{title}</p>
        <div className="flex items-baseline space-x-2">
          {isLoading ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-lg"
            />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
      </div>
      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </div>
    </div>
  </div>
);

export default function TaarufProcessPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<TaarufStats>({
    active: 0,
    khitbah: 0,
    zoom: 0,
    konseling: 0,
    total: 0,
    thisMonth: 0,
    successRate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fungsi untuk mengambil data statistik untuk KPI Cards
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      // Query untuk active processes
      const { count: activeCount } = await supabase
        .from("taaruf_processes")
        .select("*", { count: "exact", head: true })
        .in("current_stage", [
          "cv_diterima",
          "zoom_1",
          "keluarga",
          "konseling",
        ]);

      // Query untuk khitbah
      const { count: khitbahCount } = await supabase
        .from("taaruf_processes")
        .select("*", { count: "exact", head: true })
        .eq("current_stage", "khitbah");

      // Query untuk zoom stage
      const { count: zoomCount } = await supabase
        .from("taaruf_processes")
        .select("*", { count: "exact", head: true })
        .eq("current_stage", "zoom_1");

      // Query untuk konseling stage
      const { count: konselingCount } = await supabase
        .from("taaruf_processes")
        .select("*", { count: "exact", head: true })
        .eq("current_stage", "konseling");

      // Query untuk total processes
      const { count: totalCount } = await supabase
        .from("taaruf_processes")
        .select("*", { count: "exact", head: true });

      // Query untuk processes bulan ini
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonthCount } = await supabase
        .from("taaruf_processes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      // Hitung success rate (khitbah / total * 100)
      const successRate =
        totalCount && totalCount > 0
          ? Math.round(((khitbahCount || 0) / totalCount) * 100)
          : 0;

      setStats({
        active: activeCount ?? 0,
        khitbah: khitbahCount ?? 0,
        zoom: zoomCount ?? 0,
        konseling: konselingCount ?? 0,
        total: totalCount ?? 0,
        thisMonth: thisMonthCount ?? 0,
        successRate,
      });
    } catch (error) {
      console.error("Gagal memuat statistik ta'aruf:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="h-full flex flex-col">
      {/* KPI Cards Header */}
      <div className="flex-none p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KpiCard
            title="Proses Aktif"
            value={stats.active}
            subtitle="Sedang berjalan"
            icon={faUsers}
            colorClass="from-blue-500 to-blue-600"
            isLoading={isLoadingStats}
          />
          <KpiCard
            title="Alhamdulillah"
            value={stats.khitbah}
            subtitle="Berhasil khitbah"
            icon={faHeart}
            colorClass="from-green-500 to-green-600"
            isLoading={isLoadingStats}
          />
          <KpiCard
            title="Zoom Meeting"
            value={stats.zoom}
            subtitle="Sedang zoom"
            icon={faVideo}
            colorClass="from-indigo-500 to-indigo-600"
            isLoading={isLoadingStats}
          />
          <KpiCard
            title="Konseling"
            value={stats.konseling}
            subtitle="Sesi konseling"
            icon={faComments}
            colorClass="from-purple-500 to-purple-600"
            isLoading={isLoadingStats}
          />
          <KpiCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            subtitle="Tingkat keberhasilan"
            icon={faTurnUp}
            colorClass="from-emerald-500 to-emerald-600"
            isLoading={isLoadingStats}
          />
          <KpiCard
            title="Bulan Ini"
            value={stats.thisMonth}
            subtitle="Proses baru"
            icon={faCalendarAlt}
            colorClass="from-pink-500 to-pink-600"
            isLoading={isLoadingStats}
          />
        </div>
      </div>

      {/* Main Kanban Board - Full Height with Custom Scroll */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard onDataChange={fetchStats} />
      </div>
    </div>
  );
}
