import { mockBatches } from "./batches"
import { mockCredentials } from "./credentials"
import { mockTemplates } from "./templates"
import type {
  Batch,
  BatchStatus,
  CertTemplate,
  Credential,
  CredentialMeta,
  EmailStatus,
} from "./types"

export * from "./admin"
export * from "./batches"
export * from "./credentials"
export * from "./metrics"
export * from "./organizations"
export * from "./recipients"
export * from "./templates"
export * from "./types"

export function getBatchById(id: string): Batch | undefined {
  return mockBatches.find((batch) => batch.id === id)
}

export function getTemplateById(id: string): CertTemplate | undefined {
  return mockTemplates.find((template) => template.id === id)
}

export function getCredentialsByBatch(batchId: string): Credential[] {
  return mockCredentials.filter((credential) => credential.batchId === batchId)
}

export function getCredentialByPublicId(
  publicId: string
): Credential | undefined {
  return mockCredentials.find((credential) => credential.publicId === publicId)
}

export const batchStatusLabels: Record<BatchStatus, string> = {
  draft: "Draf",
  processing: "Diproses",
  completed: "Selesai",
  failed: "Gagal",
}

export const emailStatusLabels: Record<EmailStatus, string> = {
  belum_dikirim: "Belum dikirim",
  terkirim: "Terkirim",
  dibuka: "Dibuka",
  gagal: "Gagal",
}

// Opsi data kredensial (dipakai wizard buat sertifikat)
export const credentialTypeOptions = [
  "Sertifikasi",
  "Partisipasi",
  "Penyelesaian",
  "Kehadiran",
  "Kelulusan",
  "Kompetensi",
  "Penghargaan",
  "Apresiasi",
  "Pelatihan",
  "Workshop",
  "Webinar",
  "Magang",
  "Keanggotaan",
  "Relawan",
]

export const credentialLevelOptions = ["Pemula", "Menengah", "Lanjutan", "—"]

export const credentialFormatOptions = ["Daring", "Luring", "Hibrida"]

export const earningCategoryOptions = [
  "Partisipasi",
  "Kehadiran",
  "Ujian",
  "Proyek",
  "Kelulusan",
  "Kontribusi",
]

export function makeDefaultCredentialMeta(): CredentialMeta {
  return {
    type: "Sertifikasi",
    level: "Pemula",
    format: "Daring",
    durationHours: 2,
    price: "Gratis",
    description: "",
    skills: [],
    earningCriteria: [],
  }
}
