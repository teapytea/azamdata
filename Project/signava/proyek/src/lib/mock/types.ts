export type PlanId = "free" | "pro" | "bisnis"

export type Role = "owner" | "admin" | "member"

export interface Organization {
  id: string
  name: string
  handle: string
  initials: string
  category: string
  plan: PlanId
  creditBalance: number
}

export interface TeamMember {
  id: string
  orgId: string
  name: string
  email: string
  role: Role
  status: "aktif" | "diundang"
  joinedAt: string
}

export interface TemplateField {
  key: string
  label: string
  example: string
}

export interface EarningCriterion {
  id: string
  category: string
  detail: string
}

// Data kredensial yang melekat pada tiap batch — tampil di halaman verifikasi
// agar sertifikat yang terbit punya konteks resmi (jenis, tingkat, kriteria, dll).
export interface CredentialMeta {
  type: string
  level: string
  format: string
  durationHours: number
  price: string
  description: string
  skills: string[]
  earningCriteria: EarningCriterion[]
}

export type TemplateStyle = "formal" | "modern" | "minimal"

export interface CertTemplate {
  id: string
  orgId: string
  name: string
  description: string
  style: TemplateStyle
  accentColor: string
  title: string
  subtitle: string
  showLogo: boolean
  showBadge: boolean
  badgeColor: string
  fields: TemplateField[]
  updatedAt: string
}

export type BatchStatus = "draft" | "processing" | "completed" | "failed"

export interface Batch {
  id: string
  orgId: string
  name: string
  eventName: string
  eventDate: string
  templateId: string
  status: BatchStatus
  totalCount: number
  issuedCount: number
  sentCount: number
  openedCount: number
  scannedCount: number
  emailEnabled: boolean
  createdAt: string
  meta: CredentialMeta
}

export type CredentialStatus = "valid" | "revoked"

export type EmailStatus = "belum_dikirim" | "terkirim" | "dibuka" | "gagal"

export interface Credential {
  id: string
  publicId: string
  batchId: string
  orgId: string
  recipientName: string
  recipientEmail: string
  fields: Record<string, string>
  status: CredentialStatus
  emailStatus: EmailStatus
  scanCount: number
  issuedAt: string
  expiresAt?: string
}

export interface Recipient {
  id: string
  name: string
  email: string
  credentialCount: number
  lastIssuedAt: string
}

export interface OverviewMetrics {
  totalCredentials: number
  activeBatches: number
  verificationScans: number
  emailsSent: number
}

export interface AnalyticsPoint {
  month: string
  issued: number
  sent: number
  opened: number
  scanned: number
}

// Sumber kunjungan halaman verifikasi, terdeteksi dari parameter tautan
// bagikan (?src=), header Referer, dan bot pratinjau platform (unfurl).
export interface ChannelInsight {
  channel: string
  shares: number // terdeteksi dibagikan (unfurl bot / klik tombol bagikan)
  visits: number // kunjungan halaman verifikasi dari kanal ini
}

// Corong perjalanan kredensial: terbit → sampai → dibuka → dibagikan →
// diverifikasi pihak ketiga (perekrut/HR membuka halaman verifikasi).
export interface CredentialFunnel {
  issued: number
  sent: number
  opened: number
  shared: number
  verified: number
}

export interface BrandReach {
  estimatedImpressions: number
  totalShares: number
  topChannel: string
  thirdPartyVerifications: number
}

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number
  creditsPerMonth: number
  description: string
  features: string[]
  highlighted?: boolean
}

export interface VolumePack {
  id: string
  name: string
  credits: number
  price: number
  note: string
}

export type OrderStatus = "paid" | "pending" | "failed"

export interface Order {
  id: string
  orderId: string
  date: string
  description: string
  amount: number
  method: "QRIS" | "Virtual account"
  status: OrderStatus
}

export interface WalletCredential {
  id: string
  publicId: string
  title: string
  organizationName: string
  issuedAt: string
  year: number
  accentColor: string
}

export interface PublicProfile {
  handle: string
  name: string
  bio: string
  credentials: WalletCredential[]
}
