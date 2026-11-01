import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const receiptBucket = "finance-receipts"
const maxImageBytes = 6 * 1024 * 1024
const trackingStart = Date.parse("2025-12-31T17:00:00.000Z")
const geminiModel = "gemini-3.6-flash"

interface ReceiptRequest {
  action?: unknown
  draftId?: unknown
  imageBase64?: unknown
  mimeType?: unknown
  contentHash?: unknown
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const authHeader = request.headers.get("Authorization") ?? ""
  const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: { user }, error: userError } = await authClient.auth.getUser()
  if (userError || !user) return json({ error: "Authentication required" }, 401)

  let rawIngestId: string | null = null
  let attachmentId: string | null = null
  try {
    const body = await request.json() as ReceiptRequest
    if (body.action === "delete") {
      const draftId = typeof body.draftId === "string" ? body.draftId : ""
      if (!draftId) throw new Error("Receipt draft ID is required")
      await deleteReceiptDraft(service, user.id, draftId)
      return json({ deleted: true })
    }
    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : ""
    const mimeType = typeof body.mimeType === "string" ? body.mimeType.toLowerCase() : ""
    const contentHash = typeof body.contentHash === "string" ? body.contentHash.toLowerCase() : ""
    if (!imageBase64 || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) throw new Error("Choose a JPEG, PNG, or WebP receipt image")
    if (!/^[a-f0-9]{64}$/.test(contentHash)) throw new Error("Invalid receipt image hash")

    const imageBytes = decodeBase64(imageBase64)
    if (imageBytes.byteLength === 0 || imageBytes.byteLength > maxImageBytes) throw new Error("Receipt image must be smaller than 6 MB")
    const verifiedHash = await sha256(imageBytes)
    if (verifiedHash !== contentHash) throw new Error("Receipt image integrity check failed")

    const existing = await findExistingDraft(service, user.id, contentHash)
    if (existing) return json({ draft: toClientDraft(existing), duplicate: true })

    const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg"
    const storagePath = `${user.id}/${contentHash}.${extension}`
    const { error: uploadError } = await service.storage.from(receiptBucket).upload(storagePath, imageBytes, {
      contentType: mimeType,
      upsert: false,
    })
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) throw uploadError

    const { data: rawIngest, error: rawError } = await service.from("raw_ingests").insert({
      user_id: user.id,
      source: "receipt_ocr",
      channel: "camera",
      external_id: contentHash,
      raw_payload: { storage_path: storagePath, mime_type: mimeType, content_hash: contentHash },
      process_status: "pending",
    }).select("id").single()
    if (rawError) throw rawError
    rawIngestId = rawIngest.id

    const { data: attachment, error: attachmentError } = await service.from("attachments").insert({
      user_id: user.id,
      transaction_id: null,
      storage_path: storagePath,
      content_hash: contentHash,
      mime_type: mimeType,
      size_bytes: imageBytes.byteLength,
    }).select("id").single()
    if (attachmentError) throw attachmentError
    attachmentId = attachment.id

    const geminiKey = Deno.env.get("GEMINI_API_KEY")?.trim()
    if (!geminiKey) throw new Error("Receipt OCR is not configured yet. Add GEMINI_API_KEY to the receipt-ocr function secrets.")

    const geminiResponse = await callGemini(geminiKey, imageBase64, mimeType)
    const extracted = parseGeminiResponse(geminiResponse)
    const occurredAt = normalizeDate(extracted.occurred_at)
    const confidence = normalizeConfidence(extracted.confidence)
    const totalMinor = positiveInteger(extracted.total_minor)
    const merchantName = cleanText(extracted.merchant_name, 180)
    const dateBeforeTracking = occurredAt !== null && Date.parse(occurredAt) < trackingStart
    const needsReview = !merchantName || !totalMinor || !occurredAt || dateBeforeTracking || confidence.total < 0.7 || confidence.date < 0.7
    const draftStatus = needsReview ? "needs_review" : "pending"
    const reviewMessage = dateBeforeTracking
      ? "Receipt date is before the tracking period. Choose a date on or after 1 January 2026 to save it."
      : needsReview ? "Confirm fields marked as uncertain before saving" : null

    const { data: draft, error: draftError } = await service.from("finance_receipt_drafts").insert({
      user_id: user.id,
      raw_ingest_id: rawIngestId,
      attachment_id: attachmentId,
      merchant_name: merchantName,
      total_minor: totalMinor,
      currency: totalMinor ? "IDR" : null,
      occurred_at: occurredAt,
      account_hint: normalizeHint(extracted.account_hint, ["BCA", "BSI", "GoPay", "ShopeePay", "DANA"]),
      category_hint: normalizeHint(extracted.category_hint, ["Belanja", "Makanan & Minuman", "Transportasi", "Tagihan", "Lainnya"]),
      field_confidence: confidence,
      raw_model_response: { model: geminiModel, response: geminiResponse },
      status: draftStatus,
      error_message: reviewMessage,
    }).select("id,merchant_name,total_minor,currency,occurred_at,account_hint,category_hint,field_confidence,status,error_message,created_at").single()
    if (draftError) throw draftError

    await service.from("raw_ingests").update({
      process_status: needsReview ? "needs_review" : "processed",
      processed_at: new Date().toISOString(),
      error_message: needsReview ? "Receipt fields require confirmation" : null,
    }).eq("id", rawIngestId)

    return json({ draft: toClientDraft(draft), duplicate: false })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Receipt OCR failed"
    if (rawIngestId) {
      await service.from("raw_ingests").update({ process_status: "failed", processed_at: new Date().toISOString(), error_message: message }).eq("id", rawIngestId)
    }
    if (rawIngestId && attachmentId) {
      await service.from("finance_receipt_drafts").insert({
        user_id: user.id,
        raw_ingest_id: rawIngestId,
        attachment_id: attachmentId,
        status: "failed",
        error_message: message,
      })
    }
    return json({ error: message }, message.includes("not configured") ? 503 : 422)
  }
})

async function findExistingDraft(service: ReturnType<typeof createClient>, userId: string, contentHash: string) {
  const { data: attachment } = await service.from("attachments").select("id").eq("user_id", userId).eq("content_hash", contentHash).is("deleted_at", null).maybeSingle()
  if (!attachment) return null
  const { data } = await service.from("finance_receipt_drafts")
    .select("id,merchant_name,total_minor,currency,occurred_at,account_hint,category_hint,field_confidence,status,error_message,created_at")
    .eq("user_id", userId).eq("attachment_id", attachment.id).is("deleted_at", null).maybeSingle()
  return data
}

async function deleteReceiptDraft(service: ReturnType<typeof createClient>, userId: string, draftId: string) {
  const { data: draft, error } = await service
    .from("finance_receipt_drafts")
    .select("id,raw_ingest_id,attachment_id,transaction_id")
    .eq("id", draftId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle()
  if (error) throw error
  if (!draft) throw new Error("Receipt draft was not found")
  if (draft.transaction_id) throw new Error("A confirmed receipt cannot be deleted from drafts")

  const { data: attachment, error: attachmentError } = await service.from("attachments")
    .select("storage_path")
    .eq("id", draft.attachment_id)
    .eq("user_id", userId)
    .maybeSingle()
  if (attachmentError) throw attachmentError
  if (attachment?.storage_path) {
    const { error: storageError } = await service.storage.from(receiptBucket).remove([attachment.storage_path])
    if (storageError) throw storageError
  }

  const deletedAt = new Date().toISOString()
  const { error: draftError } = await service.from("finance_receipt_drafts")
    .update({ status: "rejected", deleted_at: deletedAt })
    .eq("id", draft.id)
    .eq("user_id", userId)
  if (draftError) throw draftError
  await service.from("attachments").update({ deleted_at: deletedAt }).eq("id", draft.attachment_id).eq("user_id", userId)
  await service.from("raw_ingests").update({ deleted_at: deletedAt }).eq("id", draft.raw_ingest_id).eq("user_id", userId)
}

async function callGemini(apiKey: string, imageBase64: string, mimeType: string) {
  const responseSchema = {
    type: "object",
    properties: {
      merchant_name: { type: "string", nullable: true },
      total_minor: { type: "integer", nullable: true, description: "Total in the smallest currency unit. For IDR, rupiah multiplied by 100." },
      occurred_at: { type: "string", nullable: true, description: "ISO 8601 date-time with +07:00 offset" },
      account_hint: { type: "string", nullable: true, enum: ["BCA", "BSI", "GoPay", "ShopeePay", "DANA"] },
      category_hint: { type: "string", nullable: true, enum: ["Belanja", "Makanan & Minuman", "Transportasi", "Tagihan", "Lainnya"] },
      confidence: {
        type: "object",
        properties: {
          merchant: { type: "number", minimum: 0, maximum: 1 },
          total: { type: "number", minimum: 0, maximum: 1 },
          date: { type: "number", minimum: 0, maximum: 1 },
          account: { type: "number", minimum: 0, maximum: 1 },
          category: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["merchant", "total", "date", "account", "category"],
      },
    },
    required: ["merchant_name", "total_minor", "occurred_at", "account_hint", "category_hint", "confidence"],
  }
  const payload = {
    contents: [{ parts: [
      { inline_data: { mime_type: mimeType, data: imageBase64 } },
      { text: "Extract this Indonesian receipt or e-wallet transaction screenshot. Use the final Total, never Sub Total. Indonesian dots normally separate thousands. Return null when a field is uncertain; never guess. The tracking period starts 1 January 2026. Identify transfers/top-ups only as an account hint; the user will confirm before saving." },
    ] }],
    generationConfig: {
      thinkingConfig: { thinkingLevel: "minimal" },
      responseMimeType: "application/json",
      responseSchema,
    },
  }

  for (const delayMs of [0, 1000, 2000, 4000]) {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
    })
    if (response.ok) return await response.json()
    const detail = await response.text()
    if (response.status !== 429 && response.status < 500) throw new Error(`Gemini OCR rejected the receipt (${response.status}): ${detail.slice(0, 300)}`)
    if (delayMs === 4000) throw new Error(`Gemini OCR is temporarily unavailable (${response.status})`)
  }
  throw new Error("Gemini OCR is temporarily unavailable")
}

function parseGeminiResponse(response: Record<string, unknown>) {
  const candidates = Array.isArray(response.candidates) ? response.candidates : []
  const candidate = candidates[0] as { content?: { parts?: Array<{ text?: string }> } } | undefined
  const text = candidate?.content?.parts?.find((part) => typeof part.text === "string")?.text
  if (!text) throw new Error("Gemini did not return receipt fields")
  return JSON.parse(text) as Record<string, unknown>
}

function normalizeConfidence(value: unknown) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {}
  const score = (key: string) => Math.max(0, Math.min(1, Number(source[key]) || 0))
  const result = { merchant: score("merchant"), total: score("total"), date: score("date"), account: score("account"), category: score("category"), overall: 0 }
  result.overall = (result.merchant + result.total + result.date + result.account + result.category) / 5
  return result
}

function toClientDraft(draft: Record<string, unknown>) {
  return {
    id: draft.id,
    merchantName: draft.merchant_name,
    totalMinor: draft.total_minor === null ? null : Number(draft.total_minor),
    currency: draft.currency,
    occurredAt: draft.occurred_at,
    accountHint: draft.account_hint,
    categoryHint: draft.category_hint,
    confidence: draft.field_confidence ?? {},
    status: draft.status,
    errorMessage: draft.error_message,
    createdAt: draft.created_at,
  }
}

function normalizeHint(value: unknown, allowed: string[]) {
  return typeof value === "string" && allowed.includes(value) ? value : null
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function positiveInteger(value: unknown) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : null
}

function decodeBase64(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

async function sha256(bytes: Uint8Array) {
  const hash = await crypto.subtle.digest("SHA-256", bytes)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } })
}
