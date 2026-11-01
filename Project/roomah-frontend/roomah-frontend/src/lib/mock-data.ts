// src/lib/mock-data.ts

export interface Profile {
  id: number;
  candidateCode: string;
  name: string;
  age: number;
  gender: "Ikhwan" | "Akhwat";
  job: string;
  location: string;
  education: "SMA/SMK" | "D3" | "S1" | "S2" | "S3";
  status: "ready" | "process" | "khitbah";
  quote: string;
  avatar: string;
}

export const mockProfiles: Profile[] = [
  {
    id: 1,
    candidateCode: "IKHWAN-001",
    name: "IKHWAN-001",
    age: 28,
    gender: "Ikhwan",
    job: "Software Engineer",
    location: "Jakarta",
    education: "S1",
    status: "ready",
    quote:
      "Mencari pasangan hidup yang taat beragama dan memahami pentingnya keluarga sakinah.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 2,
    candidateCode: "IKHWAN-002",
    name: "IKHWAN-10002",
    age: 30,
    gender: "Ikhwan",
    job: "Dokter",
    location: "Bandung",
    education: "S2",
    status: "process",
    quote:
      "Dokter yang ingin membangun keluarga islami dengan nilai-nilai yang kuat.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 3,
    candidateCode: "IKHWAN-003",
    name: "Yusuf Hasan",
    age: 26,
    gender: "Ikhwan",
    job: "Guru",
    location: "Surabaya",
    education: "S1",
    status: "khitbah",
    quote: "Guru yang mencintai anak-anak dan ingin menjadi ayah yang baik.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 4,
    candidateCode: "AKHWAT-001",
    name: "Siti Aisyah",
    age: 25,
    gender: "Akhwat",
    job: "Perawat",
    location: "Yogyakarta",
    education: "D3",
    status: "ready",
    quote:
      "Perawat yang peduli dan ingin membangun rumah tangga yang harmonis.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 5,
    candidateCode: "AKHWAT-002",
    name: "Fatimah Zahra",
    age: 27,
    gender: "Akhwat",
    job: "Graphic Designer",
    location: "Jakarta",
    education: "S1",
    status: "ready",
    quote:
      "Desainer kreatif yang mencari pasangan untuk berbagi mimpi dan cita-cita.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 6,
    candidateCode: "IKHWAN-004",
    name: "Ali Rahman",
    age: 32,
    gender: "Ikhwan",
    job: "Insinyur",
    location: "Surabaya",
    education: "S2",
    status: "process",
    quote:
      "Insinyur berpengalaman yang menginginkan keluarga yang taat dan bahagia.",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 7,
    candidateCode: "AKHWAT-003",
    name: "Khadijah Putri",
    age: 29,
    gender: "Akhwat",
    job: "Akuntan",
    location: "Bandung",
    education: "S1",
    status: "ready",
    quote:
      "Serius dalam ikhtiar, tawakkal dalam hasil. Mencari imam yang bisa membimbing.",
    avatar:
      "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: 8,
    candidateCode: "AKHWAT-004",
    name: "Zainab Alifah",
    age: 24,
    gender: "Akhwat",
    job: "Mahasiswi",
    location: "Yogyakarta",
    education: "S1",
    status: "ready",
    quote:
      "Menyempurnakan setengah dien adalah impian terbesar. Semoga Allah mudahkan.",
    avatar:
      "https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=200&h=200&fit=crop&crop=face",
  },
];

// --- DATA BARU UNTUK ADMIN DASHBOARD ---

// Data untuk KPI Cards di Dashboard Ringkasan
export const mockDashboardKpis = {
  totalUsers: { value: 2847, change: 12 },
  cvVerified: { value: 1923, change: 8 },
  activeTaaruf: { value: 342, change: 15 },
  totalTopUp: { value: 45200000, change: 23 },
};

// Data untuk Notifikasi Terbaru
export type Notification = {
  id: number;
  text: string;
  timestamp: string;
  category: "CV" | "Laporan" | "Sukses" | "Payment";
};

export const mockNotifications: Notification[] = [
  {
    id: 1,
    text: "CV baru dari Ahmad Fauzi menunggu verifikasi",
    timestamp: "5 menit lalu",
    category: "CV",
  },
  {
    id: 2,
    text: "Laporan pengguna terhadap profil Sarah_23",
    timestamp: "15 menit lalu",
    category: "Laporan",
  },
  {
    id: 3,
    text: "Proses taaruf berhasil mencapai tahap konseling",
    timestamp: "1 jam lalu",
    category: "Sukses",
  },
  {
    id: 4,
    text: "Top-up baru sebesar Rp 500,000",
    timestamp: "2 jam lalu",
    category: "Payment",
  },
];

// Data untuk Statistik Cepat
export const mockQuickStats = {
  pendaftarHariIni: 23,
  cvPending: 45,
  taarufSuksesBulanIni: 128,
  laporanAktif: 7,
  revenueHariIni: 2400000,
};

// Data untuk Manajemen Akun Peserta
export type UserAccount = {
  id: number;
  name: string;
  location: string;
  gender: "Laki-laki" | "Perempuan";
  status: "Terverifikasi" | "Pending" | "Ditolak";
  email: string;
  lastActive: string;
};

export const mockUserAccounts: UserAccount[] = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    location: "Jakarta",
    gender: "Laki-laki",
    status: "Terverifikasi",
    email: "ahmad.fauzi@email.com",
    lastActive: "2 jam lalu",
  },
  {
    id: 2,
    name: "Siti Aminah",
    location: "Bandung",
    gender: "Perempuan",
    status: "Pending",
    email: "siti.aminah@email.com",
    lastActive: "5 menit lalu",
  },
  {
    id: 3,
    name: "Muhammad Ridwan",
    location: "Surabaya",
    gender: "Laki-laki",
    status: "Terverifikasi",
    email: "m.ridwan@email.com",
    lastActive: "1 hari lalu",
  },
  {
    id: 4,
    name: "Fatimah Zahra",
    location: "Yogyakarta",
    gender: "Perempuan",
    status: "Ditolak",
    email: "fatimah.z@email.com",
    lastActive: "3 jam lalu",
  },
  {
    id: 5,
    name: "Ali Hassan",
    location: "Medan",
    gender: "Laki-laki",
    status: "Terverifikasi",
    email: "ali.hassan@email.com",
    lastActive: "30 menit lalu",
  },
];

// Data untuk Verifikasi CV
export type CvVerification = {
  id: number;
  name: string;
  age: number;
  location: string;
  submittedAt: string;
  profession: string;
  education: string;
  description: string;
  religiousBackground: string;
};

export const mockCvForVerification: CvVerification[] = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    age: 28,
    location: "Jakarta",
    submittedAt: "2 jam lalu",
    profession: "Software Engineer",
    education: "S1 Teknik Informatika",
    description:
      "Saya seorang software engineer di perusahaan teknologi. Saya mencari pasangan hidup yang sholehah dan memiliki visi yang sama dalam membangun keluarga islami.",
    religiousBackground:
      "Aktif di masjid lingkungan, rutin mengaji dan sholat berjamaah.",
  },
  {
    id: 2,
    name: "Siti Aminah",
    age: 25,
    location: "Bandung",
    submittedAt: "5 jam lalu",
    profession: "Guru",
    education: "S1 Pendidikan Bahasa Arab",
    description:
      "Saya bekerja sebagai guru bahasa Arab di sekolah Islam. Senang dengan aktivitas dakwah dan ingin menemukan suami yang bisa menjadi imam yang baik.",
    religiousBackground: "Hafidz 5 juz, aktif di kajian muslimah.",
  },
];

export type CvPosting = {
  id: number;
  candidateCode: string;
  name: string;
  age: number;
  location: string;
  gender: "Perempuan" | "Laki-laki";
  requestDate: string;
  requestTime: string;
  status: "Siap untuk Posting";
};

export const mockCvPostingQueue: CvPosting[] = [
  {
    id: 1,
    candidateCode: "AKHWAT57",
    name: "Siti Aminah",
    age: 25,
    location: "Jakarta",
    gender: "Perempuan",
    requestDate: "20 Jan 2024",
    requestTime: "08:30",
    status: "Siap untuk Posting",
  },
  {
    id: 2,
    candidateCode: "IKHWAN88",
    name: "Budi Santoso",
    age: 29,
    location: "Surabaya",
    gender: "Laki-laki",
    requestDate: "19 Jan 2024",
    requestTime: "15:45",
    status: "Siap untuk Posting",
  },
];

// Data untuk Proses Taaruf & Kanban Board
export type TaarufParticipant = {
  name: string;
  age: number;
  location: string;
};

export type TaarufProcess = {
  id: string;
  ikhwan: TaarufParticipant;
  akhwat: TaarufParticipant;
};

export const mockTaarufKanbanData: { [key: string]: TaarufProcess[] } = {
  "CV Diterima": [
    {
      id: "T3",
      ikhwan: { name: "Rizky P.", age: 27, location: "Medan" },
      akhwat: { name: "Aisyah H.", age: 24, location: "Bandung" },
    },
  ],
  "Zoom 1": [
    {
      id: "T1",
      ikhwan: { name: "Ahmad F.", age: 28, location: "Jakarta" },
      akhwat: { name: "Siti A.", age: 25, location: "Bandung" },
    },
    {
      id: "T4",
      ikhwan: { name: "Faisal R.", age: 31, location: "Makassar" },
      akhwat: { name: "Nadia L.", age: 28, location: "Jakarta" },
    },
  ],
  "Pertemuan Keluarga": [
    {
      id: "T2",
      ikhwan: { name: "Yusuf H.", age: 30, location: "Yogyakarta" },
      akhwat: { name: "Khadijah M.", age: 27, location: "Yogyakarta" },
    },
  ],
  Konseling: [],
  Khitbah: [],
};

// Data untuk Koin & Transaksi
export type Transaction = {
  id: string;
  orderId: string;
  user: string;
  amount: number;
  coins: number;
  method: "Bank Transfer" | "E-Wallet" | "Credit Card";
  date: string;
  time: string;
  status: "Berhasil" | "Pending" | "Gagal";
};

export const mockTransactions: Transaction[] = [
  {
    id: "TRX001",
    orderId: "BT240125001",
    user: "Ahmad Fauzi",
    amount: 50000,
    coins: 500,
    method: "Bank Transfer",
    date: "2024-01-25",
    time: "14:30",
    status: "Berhasil",
  },
  {
    id: "TRX002",
    orderId: "EW240125002",
    user: "Siti Aminah",
    amount: 100000,
    coins: 1100,
    method: "E-Wallet",
    date: "2024-01-25",
    time: "10:15",
    status: "Berhasil",
  },
  {
    id: "TRX003",
    orderId: "CC240124003",
    user: "Muhammad Ridwan",
    amount: 200000,
    coins: 2300,
    method: "Credit Card",
    date: "2024-01-24",
    time: "16:45",
    status: "Pending",
  },
  {
    id: "TRX004",
    orderId: "BT240124004",
    user: "Fatimah Zahra",
    amount: 75000,
    coins: 800,
    method: "Bank Transfer",
    date: "2024-01-24",
    time: "09:20",
    status: "Gagal",
  },
  {
    id: "TRX005",
    orderId: "EW240123005",
    user: "Ali Hassan",
    amount: 150000,
    coins: 1650,
    method: "E-Wallet",
    date: "2024-01-23",
    time: "13:10",
    status: "Berhasil",
  },
];
