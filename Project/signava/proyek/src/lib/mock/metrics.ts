import { mockCredentials } from "./credentials"
import type {
  AnalyticsPoint,
  BrandReach,
  ChannelInsight,
  CredentialFunnel,
  Order,
  OverviewMetrics,
  Plan,
  PublicProfile,
  VolumePack,
  WalletCredential,
} from "./types"

// Ambil publicId asli dari kredensial mock agar tautan verifikasi di dompet
// penerima selalu mengarah ke halaman verifikasi yang valid.
function publicIdFromBatch(batchId: string, index: number, fallback: string) {
  const inBatch = mockCredentials.filter((c) => c.batchId === batchId)
  return inBatch[index]?.publicId ?? fallback
}

export const mockOverviewMetrics: OverviewMetrics = {
  totalCredentials: 2849,
  activeBatches: 2,
  verificationScans: 573,
  emailsSent: 2329,
}

// Corong kredensial lintas batch (angka agregat, konsisten dengan overview)
export const mockCredentialFunnel: CredentialFunnel = {
  issued: 2849,
  sent: 2329,
  opened: 1739,
  shared: 486,
  verified: 573,
}

// Sumber kunjungan halaman verifikasi (30 hari terakhir)
export const mockChannelInsights: ChannelInsight[] = [
  { channel: "LinkedIn", shares: 214, visits: 1082 },
  { channel: "WhatsApp", shares: 156, visits: 640 },
  { channel: "Email", shares: 0, visits: 512 },
  { channel: "Scan QR", shares: 0, visits: 388 },
  { channel: "Instagram", shares: 58, visits: 217 },
  { channel: "Situs & lainnya", shares: 58, visits: 164 },
]

export const mockBrandReach: BrandReach = {
  estimatedImpressions: 24800,
  totalShares: 486,
  topChannel: "LinkedIn",
  thirdPartyVerifications: 573,
}

export const mockAnalyticsSeries: AnalyticsPoint[] = [
  { month: "Des 2025", issued: 120, sent: 110, opened: 64, scanned: 18 },
  { month: "Jan 2026", issued: 310, sent: 296, opened: 178, scanned: 52 },
  { month: "Feb 2026", issued: 430, sent: 430, opened: 287, scanned: 74 },
  { month: "Mar 2026", issued: 87, sent: 0, opened: 0, scanned: 6 },
  { month: "Apr 2026", issued: 95, sent: 95, opened: 71, scanned: 33 },
  { month: "Mei 2026", issued: 64, sent: 64, opened: 58, scanned: 21 },
  { month: "Jun 2026", issued: 1430, sent: 1430, opened: 1063, scanned: 433 },
  { month: "Jul 2026", issued: 384, sent: 310, opened: 96, scanned: 12 },
]

export const mockPlans: Plan[] = [
  {
    id: "free",
    name: "Gratis",
    priceMonthly: 0,
    creditsPerMonth: 50,
    description: "Untuk mencoba dan acara kecil.",
    features: [
      "50 kredensial per bulan",
      "Template preset",
      "Halaman verifikasi ber-QR",
      "Pengiriman email dasar",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 299000,
    creditsPerMonth: 2000,
    description: "Untuk penyelenggara rutin dengan volume menengah.",
    features: [
      "2.000 kredensial per bulan",
      "Semua template + editor",
      "Branding organisasi di email",
      "Analitik distribusi & verifikasi",
      "Unduh massal ZIP",
    ],
    highlighted: true,
  },
  {
    id: "bisnis",
    name: "Bisnis",
    priceMonthly: 999000,
    creditsPerMonth: 10000,
    description: "Untuk kampus dan lembaga bervolume besar.",
    features: [
      "10.000 kredensial per bulan",
      "Semua fitur Pro",
      "Multi-organisasi & tim",
      "Prioritas antrean penerbitan",
      "Dukungan prioritas",
    ],
  },
]

export const mockVolumePacks: VolumePack[] = [
  {
    id: "pack-500",
    name: "Paket 500",
    credits: 500,
    price: 99000,
    note: "Cocok untuk satu acara sedang",
  },
  {
    id: "pack-2000",
    name: "Paket 2.000",
    credits: 2000,
    price: 349000,
    note: "Hemat 12% dibanding paket 500",
  },
  {
    id: "pack-5000",
    name: "Paket 5.000",
    credits: 5000,
    price: 749000,
    note: "Untuk wisuda dan acara besar",
  },
]

export const mockOrders: Order[] = [
  {
    id: "order-1",
    orderId: "SGV-20260605-8241",
    date: "2026-06-05",
    description: "Langganan Pro — Juni 2026",
    amount: 299000,
    method: "QRIS",
    status: "paid",
  },
  {
    id: "order-2",
    orderId: "SGV-20260608-1177",
    date: "2026-06-08",
    description: "Volume pack 2.000 kredensial",
    amount: 349000,
    method: "Virtual account",
    status: "paid",
  },
  {
    id: "order-3",
    orderId: "SGV-20260705-3390",
    date: "2026-07-05",
    description: "Langganan Pro — Juli 2026",
    amount: 299000,
    method: "QRIS",
    status: "pending",
  },
  {
    id: "order-4",
    orderId: "SGV-20260501-5512",
    date: "2026-05-01",
    description: "Langganan Pro — Mei 2026",
    amount: 299000,
    method: "QRIS",
    status: "failed",
  },
]

export const mockWalletCredentials: WalletCredential[] = [
  {
    id: "wallet-1",
    publicId: publicIdFromBatch("batch-1", 0, "k3n9v2x8q1w5e7r0"),
    title: "Sertifikat kelulusan — Teknik Informatika",
    organizationName: "Universitas Nusantara Jaya",
    issuedAt: "2026-06-12",
    year: 2026,
    accentColor: "#16204A",
  },
  {
    id: "wallet-2",
    publicId: publicIdFromBatch("batch-2", 0, "a8s6d4f2g0h9j7k5"),
    title: "Sertifikat pelatihan — Dasar Analisis Data",
    organizationName: "LPK Karya Digital",
    issuedAt: "2026-06-28",
    year: 2026,
    accentColor: "#2A5BEA",
  },
  {
    id: "wallet-3",
    publicId: publicIdFromBatch("batch-3", 0, "z1x3c5v7b9n0m2l4"),
    title: "Sertifikat partisipasi — Webinar AI untuk UMKM",
    organizationName: "Komunitas Data Indonesia",
    issuedAt: "2026-07-04",
    year: 2026,
    accentColor: "#16C0AE",
  },
  {
    id: "wallet-4",
    publicId: publicIdFromBatch("batch-5", 0, "q9w7e5r3t1y0u2i4"),
    title: "Sertifikat pelatihan — Persiapan TOEFL",
    organizationName: "Universitas Nusantara Jaya",
    issuedAt: "2025-11-20",
    year: 2025,
    accentColor: "#2A5BEA",
  },
  {
    id: "wallet-5",
    publicId: publicIdFromBatch("batch-4", 0, "p0o8i6u4y2t1r3e5"),
    title: "Piagam penghargaan — Relawan Festival Literasi",
    organizationName: "Komunitas Data Indonesia",
    issuedAt: "2025-08-17",
    year: 2025,
    accentColor: "#B7791F",
  },
]

export const mockPublicProfile: PublicProfile = {
  handle: "kirana-larasati",
  name: "Kirana Larasati",
  bio: "Analis data junior. Senang belajar hal baru seputar data dan teknologi.",
  credentials: mockWalletCredentials,
}
