"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faSpinner,
  faFileImport,
  faPaperPlane,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

type ActiveTab = "incoming" | "sent" | "active";

// Tipe data untuk setiap item taaruf
type TaarufItem = {
  id: string; // process_id
  created_at: string;
  current_stage: string;
  taaruf_code: string | null;
  partner_name: string | null;
};

// ================= KOMPONEN UNTUK TAMPILAN KARTU (TIDAK ADA PERUBAHAN) =================

const CvMasukCard = ({
  item,
  onRespond,
  isResponding,
}: {
  item: TaarufItem;
  onRespond: (processId: string, approved: boolean) => void;
  isResponding: string | null;
}) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between transition-all hover:shadow-lg">
    <div>
      <p className="font-bold text-gray-800">
        Pengajuan dari: {item.partner_name || "Kandidat"}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Diterima pada: {new Date(item.created_at).toLocaleDateString("id-ID")}
      </p>
    </div>
    {isResponding === item.id ? (
      <FontAwesomeIcon
        icon={faSpinner}
        className="animate-spin text-primary text-xl"
      />
    ) : (
      <div className="flex gap-2">
        <button
          onClick={() => onRespond(item.id, false)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} /> Tolak
        </button>
        <button
          onClick={() => onRespond(item.id, true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faCheck} /> Setujui
        </button>
      </div>
    )}
  </div>
);

const CvDikirimCard = ({ item }: { item: TaarufItem }) => (
  <div className="bg-white p-4 rounded-lg shadow-md transition-all hover:shadow-lg">
    <p className="font-bold text-gray-800">
      Diajukan kepada: {item.partner_name || "Kandidat"}
    </p>
    <p className="text-sm text-gray-500 mt-1">
      Status:{" "}
      <span className="font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
        Menunggu Persetujuan
      </span>
    </p>
  </div>
);

const TaarufAktifCard = ({ item }: { item: TaarufItem }) => (
  <div className="bg-white p-4 rounded-lg shadow-md transition-all hover:shadow-lg">
    <p className="text-xs text-gray-500 font-mono">
      {item.taaruf_code || "TAARUF-RXXX"}
    </p>
    <p className="font-bold text-gray-800 mt-1">
      Proses dengan: {item.partner_name || "Kandidat"}
    </p>
    <p className="text-sm text-gray-500 mt-1">
      Tahap Saat Ini:{" "}
      <span className="font-semibold text-primary capitalize bg-green-50 px-2 py-1 rounded-full">
        {item.current_stage.replace("_", " ")}
      </span>
    </p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="mt-8 p-8 bg-gray-50 rounded-xl text-center">
    <p className="text-gray-500">{message}</p>
  </div>
);

// ================= KOMPONEN UTAMA =================

export default function MyTaarufPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("incoming");
  const [lists, setLists] = useState<{
    incoming: TaarufItem[];
    sent: TaarufItem[];
    active: TaarufItem[];
  }>({ incoming: [], sent: [], active: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  const getTabClassName = (tabName: ActiveTab) => {
    return `flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all ${
      activeTab === tabName
        ? "bg-primary text-white shadow-md"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    }`;
  };

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false); // Pastikan loading berhenti jika tidak ada user
      return;
    }
    // Jangan set isLoading di sini agar UI tidak berkedip saat refresh

    const { data, error } = await supabase
      .from("taaruf_processes")
      .select(
        `
        id, created_at, current_stage, taaruf_code,
        ikhwan_user_id, akhwat_user_id,
        ikhwan_profile:ikhwan_user_id ( cvs(full_name) ),
        akhwat_profile:akhwat_user_id ( cvs(full_name) )
      `
      )
      .or(`ikhwan_user_id.eq.${user.id},akhwat_user_id.eq.${user.id}`)
      .neq("current_stage", "dibatalkan");

    if (error) {
      console.error("Gagal mengambil data taaruf:", error);
      setIsLoading(false);
      return;
    }

    const incoming: TaarufItem[] = [];
    const sent: TaarufItem[] = [];
    const active: TaarufItem[] = [];

    data.forEach((p: any) => {
      const currentUserIsIkhwan = p.ikhwan_user_id === user.id;
      const partnerProfile = currentUserIsIkhwan
        ? p.akhwat_profile
        : p.ikhwan_profile;
      const partnerName = partnerProfile?.cvs[0]?.full_name;
      const item: TaarufItem = {
        id: p.id,
        created_at: p.created_at,
        current_stage: p.current_stage,
        taaruf_code: p.taaruf_code,
        partner_name: partnerName || "Kandidat",
      };
      if (p.current_stage === "menunggu_persetujuan") {
        if (currentUserIsIkhwan) {
          sent.push(item);
        } else {
          incoming.push(item);
        }
      } else {
        active.push(item);
      }
    });

    setLists({ incoming, sent, active });
    setIsLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "dikirim") {
      setActiveTab("sent");
    } else {
      setActiveTab("incoming");
    }
    fetchData();
  }, [fetchData]);

  // ==================== FUNGSI YANG DIPERBARUI ====================
  const handleResponse = async (processId: string, isApproved: boolean) => {
    setIsResponding(processId);

    // 1. Optimistic UI Update: Langsung hapus dari 'incoming'
    setLists((prev) => ({
      ...prev,
      incoming: prev.incoming.filter((item) => item.id !== processId),
    }));

    const { data, error } = await supabase.rpc("handle_taaruf_response", {
      process_id: processId,
      is_approved: isApproved,
    });

    if (error || !data?.startsWith("SUCCESS")) {
      alert("Terjadi kesalahan. Mengembalikan perubahan.");
      // 2. Rollback: Panggil fetchData lagi untuk mengembalikan item yang gagal
      fetchData();
    } else {
      alert(
        isApproved
          ? "Anda telah menyetujui pengajuan ini! Proses akan dilanjutkan ke tahap aktif."
          : "Anda telah menolak pengajuan ini."
      );
      // 3. Sinkronisasi: Panggil fetchData lagi untuk memastikan semua tab (terutama 'active') diperbarui
      fetchData();
    }
    setIsResponding(null);
  };
  // =================================================================

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary">
          Riwayat Ta'aruf Saya
        </h1>
        <p className="mt-2 text-text-secondary">
          Pantau semua proses ta'aruf Anda di sini.
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 bg-background-color p-2 rounded-full">
        <div
          onClick={() => setActiveTab("incoming")}
          className={getTabClassName("incoming")}
        >
          CV Masuk ({lists.incoming.length})
        </div>
        <div
          onClick={() => setActiveTab("sent")}
          className={getTabClassName("sent")}
        >
          CV Dikirim ({lists.sent.length})
        </div>
        <div
          onClick={() => setActiveTab("active")}
          className={getTabClassName("active")}
        >
          Ta'aruf Aktif ({lists.active.length})
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-primary text-2xl"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "incoming" &&
              (lists.incoming.length > 0 ? (
                lists.incoming.map((item) => (
                  <CvMasukCard
                    key={item.id}
                    item={item}
                    onRespond={handleResponse}
                    isResponding={isResponding}
                  />
                ))
              ) : (
                <EmptyState message="Saat ini belum ada pengajuan ta'aruf yang masuk ke profil Anda." />
              ))}
            {activeTab === "sent" &&
              (lists.sent.length > 0 ? (
                lists.sent.map((item) => (
                  <CvDikirimCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState message="Anda belum mengajukan ta'aruf kepada siapa pun." />
              ))}
            {activeTab === "active" &&
              (lists.active.length > 0 ? (
                lists.active.map((item) => (
                  <TaarufAktifCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState message="Tidak ada proses ta'aruf yang sedang berjalan saat ini." />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
