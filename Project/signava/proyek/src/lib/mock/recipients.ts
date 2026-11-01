import { mockCredentials } from "./credentials"
import type { Recipient } from "./types"

function buildRecipients(): Recipient[] {
  const byEmail = new Map<string, Recipient>()

  for (const credential of mockCredentials) {
    const existing = byEmail.get(credential.recipientEmail)
    if (existing) {
      existing.credentialCount += 1
      if (credential.issuedAt > existing.lastIssuedAt) {
        existing.lastIssuedAt = credential.issuedAt
      }
    } else {
      byEmail.set(credential.recipientEmail, {
        id: `recipient-${byEmail.size + 1}`,
        name: credential.recipientName,
        email: credential.recipientEmail,
        credentialCount: 1,
        lastIssuedAt: credential.issuedAt,
      })
    }
  }

  return [...byEmail.values()]
    .sort((a, b) => b.lastIssuedAt.localeCompare(a.lastIssuedAt))
    .slice(0, 40)
}

export const mockRecipients: Recipient[] = buildRecipients()
