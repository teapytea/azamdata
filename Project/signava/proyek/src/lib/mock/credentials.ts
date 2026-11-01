import { mockBatches } from "./batches"
import { mockTemplates } from "./templates"
import type { Credential, EmailStatus } from "./types"

const firstNames = [
  "Dewi",
  "Rizky",
  "Andi",
  "Maya",
  "Bagus",
  "Siti",
  "Fajar",
  "Putri",
  "Yoga",
  "Intan",
  "Rendi",
  "Laras",
  "Dimas",
  "Nadia",
  "Arif",
  "Citra",
  "Galih",
  "Wulan",
  "Hendra",
  "Salsabila",
  "Taufik",
  "Mega",
  "Ilham",
  "Ratna",
]

const lastNames = [
  "Anggraini",
  "Pratama",
  "Saputra",
  "Lestari",
  "Wibowo",
  "Nurhaliza",
  "Ramadhan",
  "Maharani",
  "Prasetyo",
  "Permata",
  "Kurniawan",
  "Safitri",
  "Nugroho",
  "Utami",
  "Hidayat",
  "Puspita",
]

const publicIdChars = "abcdefghijklmnopqrstuvwxyz0123456789"

// Generator pseudo-acak deterministik agar data mock stabil antar render
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function makePublicId(rand: () => number) {
  let id = ""
  for (let i = 0; i < 16; i++) {
    id += publicIdChars[Math.floor(rand() * publicIdChars.length)]
  }
  return id
}

function makeEmailStatus(rand: () => number, sent: boolean): EmailStatus {
  if (!sent) return "belum_dikirim"
  const roll = rand()
  if (roll < 0.05) return "gagal"
  if (roll < 0.55) return "dibuka"
  return "terkirim"
}

function buildCredentials(): Credential[] {
  const credentials: Credential[] = []

  for (const batch of mockBatches) {
    if (batch.issuedCount === 0) continue

    const template = mockTemplates.find((t) => t.id === batch.templateId)
    const rand = seededRandom(
      batch.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 7)
    )
    // Batasi jumlah baris mock per batch agar ringan; angka agregat tetap dari batch
    const count = Math.min(batch.issuedCount, 48)

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(rand() * firstNames.length)]
      const lastName = lastNames[Math.floor(rand() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`
      const sent =
        batch.sentCount > 0 &&
        i < Math.ceil((batch.sentCount / batch.totalCount) * count)
      const revoked = batch.status === "completed" && rand() < 0.03

      const fields: Record<string, string> = {}
      for (const field of template?.fields ?? []) {
        fields[field.key] = field.key === "nama" ? name : field.example
      }

      credentials.push({
        id: `cred-${batch.id}-${i}`,
        publicId: makePublicId(rand),
        batchId: batch.id,
        orgId: batch.orgId,
        recipientName: name,
        recipientEmail: email,
        fields,
        status: revoked ? "revoked" : "valid",
        emailStatus: makeEmailStatus(rand, sent),
        scanCount: Math.floor(rand() * 6),
        issuedAt: batch.createdAt,
      })
    }
  }

  return credentials
}

export const mockCredentials: Credential[] = buildCredentials()
