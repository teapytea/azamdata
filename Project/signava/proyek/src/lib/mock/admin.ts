import type { PlanId } from "./types"

// ——— Data tingkat platform untuk panel superadmin (mock) ———

export interface PlatformOrg {
  id: string
  name: string
  initials: string
  category: string
  plan: PlanId
  users: number
  credentialsIssued: number
  mrr: number // pendapatan bulanan berulang dari org ini (Rp)
  status: "aktif" | "uji_coba" | "nonaktif"
  joinedAt: string
  lastActiveAt: string
}

export interface PlatformMetrics {
  totalOrgs: number
  totalUsers: number
  credentialsIssued: number
  mrr: number
  activeTrials: number
  churnRate: number // persen
}

export interface RevenuePoint {
  month: string
  mrr: number
  newOrgs: number
}

export interface PlanDistribution {
  plan: PlanId
  label: string
  orgs: number
  mrr: number
}

export interface PlatformTransaction {
  id: string
  orgName: string
  description: string
  amount: number
  method: "QRIS" | "Virtual account"
  status: "paid" | "pending" | "failed"
  date: string
}

// Kategori template galeri sistem
export type TemplateCategory =
  | "Wisuda"
  | "Pelatihan"
  | "Webinar"
  | "Penghargaan"
  | "Kompetisi"
  | "Keanggotaan"

export interface SystemTemplate {
  id: string
  name: string
  category: TemplateCategory
  accentColor: string
  status: "published" | "draft"
  usageCount: number // berapa kali dipakai lintas org
  updatedAt: string
}

export const systemTemplateCategories: TemplateCategory[] = [
  "Wisuda",
  "Pelatihan",
  "Webinar",
  "Penghargaan",
  "Kompetisi",
  "Keanggotaan",
]

export const platformMetrics: PlatformMetrics = {
  totalOrgs: 128,
  totalUsers: 412,
  credentialsIssued: 86420,
  mrr: 47850000,
  activeTrials: 23,
  churnRate: 3.4,
}

export const platformOrgs: PlatformOrg[] = [
  {
    id: "org-1",
    name: "Universitas Nusantara Jaya",
    initials: "UN",
    category: "Perguruan tinggi",
    plan: "pro",
    users: 4,
    credentialsIssued: 2849,
    mrr: 299000,
    status: "aktif",
    joinedAt: "2025-09-12",
    lastActiveAt: "2026-07-08",
  },
  {
    id: "org-2",
    name: "LPK Karya Digital",
    initials: "KD",
    category: "Lembaga pelatihan kerja",
    plan: "free",
    users: 2,
    credentialsIssued: 340,
    mrr: 0,
    status: "uji_coba",
    joinedAt: "2026-05-02",
    lastActiveAt: "2026-07-07",
  },
  {
    id: "org-3",
    name: "Komunitas Data Indonesia",
    initials: "KI",
    category: "Komunitas",
    plan: "bisnis",
    users: 9,
    credentialsIssued: 12470,
    mrr: 999000,
    status: "aktif",
    joinedAt: "2025-06-20",
    lastActiveAt: "2026-07-08",
  },
  {
    id: "org-4",
    name: "Politeknik Bahari Samudra",
    initials: "PB",
    category: "Perguruan tinggi",
    plan: "bisnis",
    users: 7,
    credentialsIssued: 9820,
    mrr: 999000,
    status: "aktif",
    joinedAt: "2025-08-14",
    lastActiveAt: "2026-07-06",
  },
  {
    id: "org-5",
    name: "EO Kreatif Nusantara",
    initials: "EK",
    category: "Event organizer",
    plan: "pro",
    users: 3,
    credentialsIssued: 4210,
    mrr: 299000,
    status: "aktif",
    joinedAt: "2026-01-08",
    lastActiveAt: "2026-07-05",
  },
  {
    id: "org-6",
    name: "Sekolah Vokasi Mandiri",
    initials: "SV",
    category: "Sekolah",
    plan: "pro",
    users: 5,
    credentialsIssued: 1560,
    mrr: 299000,
    status: "aktif",
    joinedAt: "2026-02-19",
    lastActiveAt: "2026-07-02",
  },
  {
    id: "org-7",
    name: "Bootcamp Koding Merah Putih",
    initials: "BK",
    category: "Lembaga pelatihan kerja",
    plan: "pro",
    users: 4,
    credentialsIssued: 3080,
    mrr: 299000,
    status: "aktif",
    joinedAt: "2025-11-30",
    lastActiveAt: "2026-07-08",
  },
  {
    id: "org-8",
    name: "Yayasan Literasi Digital",
    initials: "YL",
    category: "Yayasan",
    plan: "free",
    users: 2,
    credentialsIssued: 95,
    mrr: 0,
    status: "uji_coba",
    joinedAt: "2026-06-25",
    lastActiveAt: "2026-06-30",
  },
  {
    id: "org-9",
    name: "Asosiasi Perawat Sejahtera",
    initials: "AP",
    category: "Asosiasi profesi",
    plan: "bisnis",
    users: 6,
    credentialsIssued: 7340,
    mrr: 999000,
    status: "aktif",
    joinedAt: "2025-07-11",
    lastActiveAt: "2026-07-04",
  },
  {
    id: "org-10",
    name: "Komunitas Fotografi Senja",
    initials: "KF",
    category: "Komunitas",
    plan: "free",
    users: 1,
    credentialsIssued: 40,
    mrr: 0,
    status: "nonaktif",
    joinedAt: "2025-12-03",
    lastActiveAt: "2026-04-18",
  },
  {
    id: "org-11",
    name: "Lembaga Kursus Bahasa Global",
    initials: "LB",
    category: "Lembaga pelatihan kerja",
    plan: "pro",
    users: 3,
    credentialsIssued: 2210,
    mrr: 299000,
    status: "aktif",
    joinedAt: "2026-03-27",
    lastActiveAt: "2026-07-07",
  },
  {
    id: "org-12",
    name: "Universitas Teknologi Harapan",
    initials: "UT",
    category: "Perguruan tinggi",
    plan: "bisnis",
    users: 11,
    credentialsIssued: 18640,
    mrr: 999000,
    status: "aktif",
    joinedAt: "2025-05-16",
    lastActiveAt: "2026-07-08",
  },
]

export const platformRevenueSeries: RevenuePoint[] = [
  { month: "Des 2025", mrr: 21400000, newOrgs: 6 },
  { month: "Jan 2026", mrr: 26900000, newOrgs: 9 },
  { month: "Feb 2026", mrr: 31200000, newOrgs: 8 },
  { month: "Mar 2026", mrr: 35600000, newOrgs: 11 },
  { month: "Apr 2026", mrr: 39100000, newOrgs: 7 },
  { month: "Mei 2026", mrr: 43200000, newOrgs: 10 },
  { month: "Jun 2026", mrr: 46000000, newOrgs: 9 },
  { month: "Jul 2026", mrr: 47850000, newOrgs: 5 },
]

export const platformPlanDistribution: PlanDistribution[] = [
  { plan: "free", label: "Gratis", orgs: 71, mrr: 0 },
  { plan: "pro", label: "Pro", orgs: 42, mrr: 12558000 },
  { plan: "bisnis", label: "Bisnis", orgs: 15, mrr: 14985000 },
]

export const platformTransactions: PlatformTransaction[] = [
  {
    id: "tx-1",
    orgName: "Universitas Teknologi Harapan",
    description: "Langganan Bisnis — Juli 2026",
    amount: 999000,
    method: "Virtual account",
    status: "paid",
    date: "2026-07-08",
  },
  {
    id: "tx-2",
    orgName: "Bootcamp Koding Merah Putih",
    description: "Volume pack 2.000 kredensial",
    amount: 349000,
    method: "QRIS",
    status: "paid",
    date: "2026-07-07",
  },
  {
    id: "tx-3",
    orgName: "Sekolah Vokasi Mandiri",
    description: "Langganan Pro — Juli 2026",
    amount: 299000,
    method: "QRIS",
    status: "pending",
    date: "2026-07-07",
  },
  {
    id: "tx-4",
    orgName: "Komunitas Data Indonesia",
    description: "Langganan Bisnis — Juli 2026",
    amount: 999000,
    method: "Virtual account",
    status: "paid",
    date: "2026-07-05",
  },
  {
    id: "tx-5",
    orgName: "EO Kreatif Nusantara",
    description: "Langganan Pro — Juli 2026",
    amount: 299000,
    method: "QRIS",
    status: "failed",
    date: "2026-07-04",
  },
  {
    id: "tx-6",
    orgName: "Asosiasi Perawat Sejahtera",
    description: "Volume pack 5.000 kredensial",
    amount: 749000,
    method: "Virtual account",
    status: "paid",
    date: "2026-07-03",
  },
]

export const systemTemplates: SystemTemplate[] = [
  {
    id: "sys-1",
    name: "Wisuda klasik emas",
    category: "Wisuda",
    accentColor: "#B7791F",
    status: "published",
    usageCount: 1840,
    updatedAt: "2026-06-14",
  },
  {
    id: "sys-2",
    name: "Wisuda modern navy",
    category: "Wisuda",
    accentColor: "#16204A",
    status: "published",
    usageCount: 1220,
    updatedAt: "2026-06-02",
  },
  {
    id: "sys-3",
    name: "Pelatihan bersih biru",
    category: "Pelatihan",
    accentColor: "#2A5BEA",
    status: "published",
    usageCount: 3120,
    updatedAt: "2026-05-28",
  },
  {
    id: "sys-4",
    name: "Webinar minimal teal",
    category: "Webinar",
    accentColor: "#16C0AE",
    status: "published",
    usageCount: 2470,
    updatedAt: "2026-06-20",
  },
  {
    id: "sys-5",
    name: "Piagam penghargaan emas",
    category: "Penghargaan",
    accentColor: "#B7791F",
    status: "published",
    usageCount: 640,
    updatedAt: "2026-04-09",
  },
  {
    id: "sys-6",
    name: "Kompetisi juara merah",
    category: "Kompetisi",
    accentColor: "#8B2635",
    status: "draft",
    usageCount: 0,
    updatedAt: "2026-07-06",
  },
  {
    id: "sys-7",
    name: "Keanggotaan hijau resmi",
    category: "Keanggotaan",
    accentColor: "#1F6B3B",
    status: "draft",
    usageCount: 0,
    updatedAt: "2026-07-07",
  },
]
