import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import {
  extractEmailAddress,
  hasPassingEmailAuthentication,
  parseBankEmail,
  parseCommerceEmail,
} from "../_shared/bank-email-parser.mjs"

const DEFAULT_BCA_SENDER = "bca@bca.co.id"
const DEFAULT_BSI_SENDER = "mobile@bankbsi.co.id"
type CommerceProvider = "shopee" | "gopay" | "grab"

const TRUSTED_COMMERCE_SENDERS = new Map<string, CommerceProvider>([
  ["info@mail.shopee.co.id", "shopee"],
  ["no-reply@customers.go-pay.co.id", "gopay"],
  ["no-reply@grab.com", "grab"],
] as const)

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const corsHeaders = {
  "access-control-allow-origin": "https://script.google.com",
  "access-control-allow-headers": "content-type, x-ingest-secret",
  "access-control-allow-methods": "POST, OPTIONS",
  "cache-control": "no-store",
}

interface GmailMessageInput {
  messageId?: unknown
  threadId?: unknown
  from?: unknown
  to?: unknown
  subject?: unknown
  bodyText?: unknown
  rawContent?: unknown
  internalDate?: unknown
  labels?: unknown
}

interface Credential {
  id: string
  user_id: string
  bca_sender: string | null
  bsi_sender: string | null
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const credential = await authenticate(request)
    const body = await request.json()
    if (body?.version !== 1 || !Array.isArray(body.messages)) {
      return json({ error: "Expected a version 1 Gmail message batch" }, 400)
    }
    if (body.messages.length === 0 || body.messages.length > 25) {
      return json({ error: "A batch must contain between 1 and 25 messages" }, 400)
    }

    const receivedAt = new Date().toISOString()
    const results = []
    for (const input of body.messages as GmailMessageInput[]) {
      results.push(await receiveAndProcessMessage(credential, input))
    }

    const accepted = results.filter((result) => result.accepted).length
    const processed = results.filter((result) => result.status === "processed").length
    const needsReview = results.filter((result) => result.status === "needs_review").length
    const firstError = results.find((result) => result.error)?.error ?? null
    await supabase.from("gmail_ingest_credentials").update({
      last_received_at: receivedAt,
      last_success_at: accepted > 0 ? receivedAt : undefined,
      last_error: firstError,
    }).eq("id", credential.id)

    return json({ accepted, processed, needsReview, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected Gmail ingest failure"
    return json({ error: message }, message === "Invalid Gmail ingest secret" ? 401 : 400)
  }
})

async function authenticate(request: Request): Promise<Credential> {
  const secret = request.headers.get("x-ingest-secret")?.trim() ?? ""
  if (secret.length !== 64) throw new Error("Invalid Gmail ingest secret")
  const secretHash = await sha256(secret)
  const { data, error } = await supabase
    .from("gmail_ingest_credentials")
    .select("id,user_id,bca_sender,bsi_sender")
    .eq("secret_hash", secretHash)
    .is("revoked_at", null)
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) throw new Error("Invalid Gmail ingest secret")
  return data as Credential
}

async function receiveAndProcessMessage(credential: Credential, input: GmailMessageInput) {
  const messageId = cleanText(input.messageId, 300)
  if (!messageId) return { messageId: null, accepted: false, status: "failed", error: "Gmail message ID is required" }

  const rawContent = typeof input.rawContent === "string" ? input.rawContent : ""
  const fromHeader = cleanText(input.from, 500)
  const sender = extractEmailAddress(fromHeader)
  const subject = cleanText(input.subject, 500) ?? "Untitled finance email"
  const bodyText = cleanText(input.bodyText, 100_000) ?? ""
  const internalDate = normalizeDate(input.internalDate)
  const source = identifySource(sender, credential)
  const rawPayload = {
    gmail_message_id: messageId,
    gmail_thread_id: cleanText(input.threadId, 300),
    from: fromHeader,
    sender,
    to: cleanText(input.to, 500),
    subject,
    body_text: bodyText,
    raw_content: rawContent,
    internal_date: internalDate,
    labels: Array.isArray(input.labels) ? input.labels.slice(0, 30).map((label) => cleanText(label, 100)).filter(Boolean) : [],
  }

  const { data: inserted, error: insertError } = await supabase
    .from("raw_ingests")
    .insert({
      user_id: credential.user_id,
      source: "gmail_bank_email",
      channel: "google_apps_script",
      external_id: messageId,
      raw_payload: rawPayload,
      process_status: "pending",
    })
    .select("id,process_status")
    .maybeSingle()

  if (insertError?.code === "23505") {
    return { messageId, accepted: true, status: "duplicate" }
  }
  if (insertError || !inserted) {
    return { messageId, accepted: false, status: "failed", error: insertError?.message ?? "Raw email could not be stored" }
  }

  if (!source) {
    return markNeedsReview(inserted.id, messageId, credential.user_id, {
      bank: null, subject, sender, bodyText, internalDate,
      reason: "Sender does not exactly match a configured finance email source",
    })
  }
  if (!hasPassingEmailAuthentication(rawContent, sender)) {
    return markNeedsReview(inserted.id, messageId, credential.user_id, {
      bank: source.name, subject, sender, bodyText, internalDate,
      reason: "SPF, DKIM, and aligned DMARC did not all pass",
    })
  }

  const parsed = source.kind === "bank"
    ? parseBankEmail({ bank: source.parserId, subject, bodyText, internalDate })
    : parseCommerceEmail({ provider: source.parserId, subject, bodyText, internalDate })
  if (parsed.outcome === "ignored") {
    await updateRawIngest(inserted.id, "processed", parsed.reason)
    return { messageId, accepted: true, status: "ignored", reason: parsed.reason }
  }
  if (parsed.outcome === "needs_review") {
    return markNeedsReview(inserted.id, messageId, credential.user_id, {
      ...parsed, subject, sender, bodyText, internalDate,
    })
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id,currency")
    .eq("user_id", credential.user_id)
    .eq("name", parsed.bank)
    .is("deleted_at", null)
    .maybeSingle()
  if (accountError || !account) {
    return markNeedsReview(inserted.id, messageId, credential.user_id, {
      ...parsed, subject, sender, bodyText, internalDate,
      reason: `${parsed.bank} account mapping is missing`,
    })
  }

  let counterpartAccount: { id: string; currency: string } | null = null
  if (parsed.direction === "transfer") {
    const { data, error } = await supabase
      .from("accounts")
      .select("id,currency")
      .eq("user_id", credential.user_id)
      .eq("name", parsed.counterpartAccountName)
      .is("deleted_at", null)
      .maybeSingle()
    counterpartAccount = data
    if (error || !counterpartAccount || counterpartAccount.currency !== account.currency) {
      return markNeedsReview(inserted.id, messageId, credential.user_id, {
        ...parsed, subject, sender, bodyText, internalDate,
        reason: `${parsed.counterpartAccountName ?? "Counterpart"} account mapping is missing or uses a different currency`,
      })
    }
  }

  const { data: transactionId, error: transactionError } = await supabase.rpc("record_parsed_email_transaction", {
    owner_id: credential.user_id,
    source_account_id: account.id,
    counterpart_account_id: counterpartAccount?.id ?? null,
    transaction_direction: parsed.direction,
    transaction_description: parsed.description,
    transaction_amount_minor: parsed.amountMinor,
    transaction_currency: parsed.currency,
    transaction_occurred_at: parsed.occurredAt,
    transaction_source_bank: parsed.bank,
    transaction_external_ref: parsed.externalRef,
    transaction_confidence: parsed.confidence,
    source_raw_ingest_id: inserted.id,
    fee_amount_minor: parsed.direction === "transfer" ? parsed.feeMinor : null,
  })

  if (transactionError?.code === "23505") {
    await updateRawIngest(inserted.id, "processed", "Duplicate bank reference ignored")
    return { messageId, accepted: true, status: "duplicate" }
  }
  if (transactionError || !transactionId) {
    return markNeedsReview(inserted.id, messageId, credential.user_id, {
      ...parsed, subject, sender, bodyText, internalDate,
      reason: transactionError?.message ?? "Parsed transaction could not be stored",
    })
  }

  await updateRawIngest(inserted.id, "processed", null)
  return { messageId, accepted: true, status: "processed", transactionId }
}

function identifySource(sender: string | null, credential: Credential) {
  if (!sender) return null
  const bcaSender = credential.bca_sender ?? DEFAULT_BCA_SENDER
  const bsiSender = credential.bsi_sender ?? DEFAULT_BSI_SENDER
  if (sender === bcaSender) return { kind: "bank" as const, parserId: "bca", name: "BCA" }
  if (sender === bsiSender) return { kind: "bank" as const, parserId: "bsi", name: "BSI" }
  const commerce = TRUSTED_COMMERCE_SENDERS.get(sender)
  return commerce ? { kind: "commerce" as const, parserId: commerce, name: commerce === "gopay" ? "GoPay" : commerce[0].toUpperCase() + commerce.slice(1) } : null
}

async function markNeedsReview(rawIngestId: string, messageId: string, userId: string, evidence: Record<string, unknown>) {
  const direction = evidence.direction === "debit" || evidence.direction === "credit" || evidence.direction === "transfer" ? evidence.direction : null
  const amountMinor = typeof evidence.amountMinor === "number" ? evidence.amountMinor : null
  const currency = amountMinor === null ? null : String(evidence.currency ?? "IDR")
  const sourceRefHash = await sha256(`gmail-finance-email|${messageId}`)
  const { error: candidateError } = await supabase.from("finance_email_candidates").upsert({
    user_id: userId,
    raw_ingest_id: rawIngestId,
    discovery_evidence_id: null,
    source_ref_hash: sourceRefHash,
    merchant_name: cleanText(evidence.description, 160) ?? cleanText(evidence.bank, 20) ?? "Finance email",
    sender: cleanText(evidence.sender, 300),
    subject: cleanText(evidence.subject, 500) ?? "Finance email needs review",
    excerpt: cleanText(evidence.bodyText, 1200),
    occurred_at: normalizeDate(evidence.occurredAt ?? evidence.internalDate),
    direction,
    amount_minor: amountMinor,
    currency,
    confidence: typeof evidence.confidence === "number" ? evidence.confidence : 0.25,
    status: "pending",
    metadata: {
      reason: cleanText(evidence.reason, 500),
      bank: evidence.bank ?? null,
      counterpart_account_name: cleanText(evidence.counterpartAccountName, 100),
      fee_minor: typeof evidence.feeMinor === "number" ? evidence.feeMinor : null,
    },
    deleted_at: null,
  }, { onConflict: "user_id,source_ref_hash" })

  const reason = cleanText(evidence.reason, 500) ?? "Email needs manual review"
  await updateRawIngest(rawIngestId, candidateError ? "failed" : "needs_review", candidateError?.message ?? reason)
  return {
    messageId,
    accepted: !candidateError,
    status: candidateError ? "failed" : "needs_review",
    error: candidateError?.message,
    reason,
  }
}

async function updateRawIngest(id: string, status: "processed" | "needs_review" | "failed", message: string | null) {
  await supabase.from("raw_ingests").update({
    process_status: status,
    error_message: message,
    processed_at: new Date().toISOString(),
  }).eq("id", id)
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null
  const cleaned = value.split("\u0000").join("").trim()
  return cleaned ? cleaned.slice(0, maxLength) : null
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  })
}
