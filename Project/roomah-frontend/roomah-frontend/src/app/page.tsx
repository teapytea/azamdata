"use client";
import { useState, useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import FilterBar from "@/components/home/FilterBar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faBriefcase,
  faGraduationCap,
  faCoins,
  faPaperPlane,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";

// Definisikan tipe Kandidat dari Supabase dengan nama kolom yang benar
export type Candidate = {
  id: string;
  user_id: string;
  full_name: string;
  unique_code: string | null;
  date_birth: string;
  domicile_prov: string;
  job_title: string;
  education: string;
  avatar_url: string | null;
  status: string;
  taaruf_cost: number;
  criteria: string;
  gender: string;
};

// Fungsi helper umur
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

// Komponen Card Kandidat (desain Anda)
const CandidateCard = ({
  candidate,
  onAjukanTaaruf,
  onLihatCV,
}: {
  candidate: Candidate;
  onAjukanTaaruf: (targetUserId: string) => void;
  onLihatCV: (candidate: Candidate) => void;
}) => {
  const getAvatar = () => {
    if (candidate.avatar_url) return candidate.avatar_url;
    return candidate.gender === "Ikhwan"
      ? "/images/avatar-ikhwan-placeholder.jpg"
      : "/images/avatar-akhwat-placeholder.jpg";
  };
  const getStatusBadge = () => {
    const statusConfig = {
      approve: {
        text: "Siap Ta'aruf",
        color: "bg-green-50 text-green-700 border-green-200",
      },
      dalam_proses: {
        text: "Dalam Proses",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
      khitbah: {
        text: "Khitbah",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
    };
    const config =
      statusConfig[candidate.status as keyof typeof statusConfig] ||
      statusConfig.approve;
    return (
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`${config.color} px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border`}
        >
          {config.text}
        </div>
      </div>
    );
  };
  return (
    <div className="group bg-stone-50/80 border-0 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden min-h-[520px] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      {getStatusBadge()}
      <div className="relative z-10 flex-none p-6 pt-8 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-50 to-green-100 p-1 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <img
              src={getAvatar()}
              alt={candidate.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-green-200 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"></div>
        </div>
        <div className="space-y-1 mb-4">
          <h3 className="font-bold text-lg text-slate-800 uppercase tracking-wide group-hover:text-green-700 transition-colors duration-300">
            <span className="block truncate">
              {candidate.unique_code || "KANDIDAT"}
            </span>
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            <span className="block truncate">{candidate.job_title}</span>
          </p>
        </div>
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-8 h-8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faBriefcase}
                className="text-green-600 text-sm"
              />
            </div>
            <span className="text-xs font-normal text-slate-700">
              {calculateAge(candidate.date_birth)} tahun
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-8 h-8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-green-600 text-sm"
              />
            </div>
            <span className="text-xs font-normal text-slate-700 truncate px-1">
              {candidate.domicile_prov}
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-8 h-8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-green-600 text-sm"
              />
            </div>
            <span className="text-xs font-normal text-slate-700 truncate px-1">
              {candidate.education}
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex-1 px-6 mb-6 flex items-start">
        <div className="w-full bg-gradient-to-br from-stone-50 to-white p-5 rounded-2xl border border-stone-200 group-hover:border-green-200 group-hover:shadow-md transition-all duration-300 min-h-[100px] max-h-[120px] flex items-center">
          <p
            className="text-slate-600 text-sm italic leading-relaxed text-center w-full overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
            }}
          >
            "{candidate.criteria}"
          </p>
        </div>
      </div>
      <div className="relative z-10 flex-none px-6 pb-6">
        <div className="flex gap-2">
          <button
            onClick={() => onLihatCV(candidate)}
            className="flex-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 hover:border-stone-400 text-slate-700 hover:text-slate-800 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 group-hover:shadow-md"
          >
            <FontAwesomeIcon icon={faEye} className="text-slate-500 text-xs" />
            <span className="text-xs">Lihat CV</span>
          </button>
          <button
            onClick={() => onAjukanTaaruf(candidate.user_id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon
              icon={faCoins}
              className="text-green-100 text-xs"
            />
            <span className="font-medium text-xs">{candidate.taaruf_cost}</span>
            <span className="font-medium text-xs">Ajukan Ta'aruf</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen Modal Detail CV
const CandidateDetailModal = ({
  candidate,
  onClose,
}: {
  candidate: Candidate | null;
  onClose: () => void;
}) => {
  if (!candidate) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{candidate.unique_code}</h2>
        <p>
          <strong>Nama Lengkap:</strong> {candidate.full_name}
        </p>
        <p>
          <strong>Pekerjaan:</strong> {candidate.job_title}
        </p>
        <p>
          <strong>Pendidikan:</strong> {candidate.education}
        </p>
        <p>
          <strong>Domisili:</strong> {candidate.domicile_prov}
        </p>
        <p className="mt-4 whitespace-pre-wrap">
          <strong>Kriteria/Visi:</strong>
          <br />
          {candidate.criteria}
        </p>
        <button
          onClick={onClose}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-lg"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth(); // Ambil user dari context
  const [profiles, setProfiles] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedProfile, setSelectedProfile] = useState<Candidate | null>(
    null
  );

  useEffect(() => {
    const fetchFilteredProfiles = async () => {
      setIsLoading(true);
      let query = supabase.from("cvs").select("*").eq("status", "approve");

      // Filter untuk tidak menampilkan CV milik user yang sedang login
      if (user) {
        query = query.neq("user_id", user.id);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) query = query.eq(key, value);
      });
      const { data, error } = await query;
      // === TAMBAHKAN LOG INI ===
      console.log("--- Data Kandidat Diterima di Homepage ---");
      console.log(data);
      // ==========================
      setProfiles(data || []);
      setIsLoading(false);
    };
    fetchFilteredProfiles();
  }, [filters, supabase, user]); // Tambahkan user sebagai dependency

  const handleFilterChange = (filterType: string, value: string) =>
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  const handleResetFilters = () => setFilters({});

  const handleAjukanTaaruf = async (targetUserId: string) => {
    if (!isAuthenticated) {
      alert("Anda harus login terlebih dahulu untuk mengajukan ta'aruf.");
      router.push("/login");
      return;
    }

    // Tampilkan konfirmasi sebelum mengirim
    if (
      !window.confirm(
        "Anda akan menggunakan 5 koin untuk mengajukan ta'aruf. Lanjutkan?"
      )
    ) {
      return;
    }

    // Panggil RPC yang sudah kita buat
    const { data, error } = await supabase.rpc("initiate_taaruf", {
      target_user_id: targetUserId,
    });

    if (error) {
      alert(`Terjadi kesalahan teknis: ${error.message}`);
      return;
    }

    // Tangani setiap kemungkinan respons dari RPC
    switch (data) {
      case "SUCCESS":
        alert(
          "Selamat! Pengajuan taaruf Anda berhasil dikirim. Anda akan diarahkan ke halaman Riwayat Taaruf."
        );
        router.push("/dashboard/taaruf-saya?tab=dikirim");
        break;
      case "ERROR:CV_NOT_FOUND":
      case "ERROR:CV_NOT_APPROVED":
        if (
          window.confirm(
            "CV Anda belum lengkap atau belum disetujui admin. Pindah ke halaman CV untuk melengkapi?"
          )
        ) {
          router.push("/dashboard/cv-saya");
        }
        break;
      case "ERROR:INSUFFICIENT_COINS":
        if (
          window.confirm(
            "Koin Anda tidak cukup. Pindah ke halaman Koin untuk top up?"
          )
        ) {
          router.push("/dashboard/koin-saya");
        }
        break;
      case "ERROR:ALREADY_IN_PROCESS":
        alert(
          "Anda sudah memiliki proses ta'aruf yang aktif dengan kandidat ini."
        );
        break;
      case "ERROR:CANNOT_SELF_TAARUF":
        alert("Anda tidak dapat mengajukan ta'aruf kepada diri sendiri.");
        break;
      default:
        alert(`Terjadi kesalahan: ${data}`);
    }
  };

  return (
    <main>
      <HeroSection />
      <CandidateDetailModal
        candidate={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
      <div className="bg-surface-color -mt-16 rounded-t-3xl shadow-lg relative z-10">
        <section
          id="search-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">
              Temukan Pasangan Hidup Anda
            </h2>
            <p className="mt-4 text-text-secondary">
              Telusuri profil calon yang siap untuk melangkah ke jenjang
              pernikahan.
            </p>
          </div>
          <FilterBar
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
          <div className="mt-12">
            {isLoading ? (
              <p className="text-center">Memuat kandidat...</p>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <CandidateCard
                    key={profile.id}
                    candidate={profile}
                    onAjukanTaaruf={handleAjukanTaaruf}
                    onLihatCV={setSelectedProfile}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Tidak ada kandidat yang tersedia saat ini.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
