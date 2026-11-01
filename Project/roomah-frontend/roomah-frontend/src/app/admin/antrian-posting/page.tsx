"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import KpiCard from "@/components/admin/verifikasi/KpiCard";

// Tipe data untuk CV di antrian
type QueuedCv = {
  id: string;
  unique_code: string | null;
  full_name: string;
  gender: "Ikhwan" | "Akhwat";
  // Tambahkan field lain jika perlu, misal: tanggal diajukan
};

export default function AntrianPostingPage() {
  const supabase = createClient();
  const [queue, setQueue] = useState<QueuedCv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("cvs")
        .select("id, unique_code, full_name, gender")
        .eq("social_media_status", "siap_posting")
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setQueue(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleMarkAsPosted = async (cvId: string) => {
    const { error } = await supabase
      .from("cvs")
      .update({ social_media_status: "sudah_diposting" })
      .eq("id", cvId);

    if (error) {
      alert("Gagal memperbarui status: " + error.message);
    } else {
      alert("CV berhasil ditandai sudah diposting!");
      fetchQueue(); // Ambil ulang data untuk me-refresh daftar
    }
  };

  // Hitung KPI di sisi klien
  const totalQueue = queue.length;
  const totalAkhwat = queue.filter((cv) => cv.gender === "Akhwat").length;
  const totalIkhwan = queue.filter((cv) => cv.gender === "Ikhwan").length;

  if (isLoading)
    return <p className="text-center p-8">Memuat antrian posting...</p>;
  if (error)
    return <p className="text-center p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Antrian Posting CV</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="CV Siap Posting"
          value={totalQueue}
          icon="📬"
          colorClass="bg-blue-100 text-blue-600"
        />
        <KpiCard
          title="Akhwat"
          value={totalAkhwat}
          icon="👩"
          colorClass="bg-pink-100 text-pink-600"
        />
        <KpiCard
          title="Ikhwan"
          value={totalIkhwan}
          icon="👨"
          colorClass="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Filter & Sorting (Placeholder) */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">
          Filter & Sorting akan diimplementasikan di sini.
        </p>
      </div>

      {/* Daftar Antrian */}
      <div className="space-y-4">
        {queue.length > 0 ? (
          queue.map((cv) => (
            <div
              key={cv.id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg">
                  {cv.unique_code || cv.full_name}
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    cv.gender === "Akhwat"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {cv.gender}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm bg-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-300">
                  Download PNG
                </button>
                <button className="text-sm bg-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-300">
                  Download PDF
                </button>
                <button
                  onClick={() => handleMarkAsPosted(cv.id)}
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
                >
                  Tandai Sudah Diposting
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">
              Tidak ada CV dalam antrian posting saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
