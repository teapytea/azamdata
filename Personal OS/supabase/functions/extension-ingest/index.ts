import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const allowedSources = new Set(["google_connected_apps", "gmail", "provider_dashboard"])
const allowedEvidenceTypes = new Set(["account_connection", "email", "plan_status", "billing", "quota"])
const allowedStatuses = new Set(["account_only", "free", "trial", "grant", "paid", "expired", "cancelled", "unknown"])
const sourceConfidence: Record<string, number> = {
  google_connected_apps: 0.35,
  gmail: 0.65,
  provider_dashboard: 0.95,
}

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-device-token",
  "access-control-allow-methods": "POST, OPTIONS",
  "cache-control": "no-store",
}

interface IncomingRecord {
  source?: string
  displayName?: string
  domain?: string | null
  accountEmail?: string | null
  category?: string | null
  title?: string | null
  sender?: string | null
  excerpt?: string | null
  evidenceDate?: string | null
  evidenceType?: string | null
  statusHint?: string | null
  websiteUrl?: string | null
  planName?: string | null
  billingCycle?: string | null
  amountMinor?: number | null
  currency?: string | null
  transactionDirection?: string | null
  paymentHint?: string | null
  quotaRemaining?: number | null
  quotaLimit?: number | null
  quotaUnit?: string | null
}

interface NormalizedRecord {
  source: string
  displayName: string
  normalizedName: string
  identityKey: string
  recordKey: string
  domain: string | null
  accountEmail: string | null
  category: string
  title: string | null
  sender: string | null
  excerpt: string | null
  evidenceDate: string | null
  evidenceType: string
  statusHint: string
  websiteUrl: string | null
  planName: string | null
  billingCycle: string | null
  amountMinor: number | null
  currency: string | null
  transactionDirection: "debit" | "credit"
  paymentHint: string | null
  quotaRemaining: number | null
  quotaLimit: number | null
  quotaUnit: string | null
  confidence: number
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const body = await request.json()
    if (body?.action === "exchange") return exchangePairing(body)
    if (body?.action === "ingest") return ingestRecords(request, body)
    return json({ error: "Unsupported action" }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected request failure"
    return json({ error: message }, 400)
  }
})

async function exchangePairing(body: { code?: unknown; deviceName?: unknown }) {
  const code = String(body.code ?? "").replace(/[^a-z0-9]/gi, "").toUpperCase()
  const deviceName = cleanText(body.deviceName, 120) ?? "Microsoft Edge"
  if (code.length !== 10) return json({ error: "Pairing code must contain 10 characters" }, 400)

  const token = randomHex(32)
  const [codeHash, tokenHash] = await Promise.all([sha256(code), sha256(token)])
  const { data, error } = await supabase.rpc("claim_extension_pairing", {
    pairing_code_hash: codeHash,
    device_name: deviceName,
    device_token_hash: tokenHash,
  })

  if (error || !data?.[0]) return json({ error: "Pairing code is invalid, expired, or already used" }, 401)
  return json({ deviceId: data[0].device_id, token })
}

async function ingestRecords(request: Request, body: { source?: unknown; records?: unknown }) {
  const rawToken = request.headers.get("x-device-token")?.trim() ?? ""
  if (rawToken.length !== 64) return json({ error: "Extension is not paired" }, 401)

  const tokenHash = await sha256(rawToken)
  const { data: device, error: deviceError } = await supabase
    .from("extension_devices")
    .select("id,user_id")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .is("deleted_at", null)
    .maybeSingle()
  if (deviceError || !device) return json({ error: "Extension pairing is invalid or revoked" }, 401)

  const source = String(body.source ?? "")
  if (!allowedSources.has(source)) return json({ error: "Unsupported scan source" }, 400)
  if (!Array.isArray(body.records) || body.records.length === 0) return json({ error: "No records were found on this page" }, 400)
  if (body.records.length > 250) return json({ error: "A scan can contain at most 250 records" }, 400)

  const records = deduplicateRecords(body.records.flatMap((record) => {
    const normalized = normalizeRecord(record as IncomingRecord, source)
    return normalized ? [normalized] : []
  }))
  if (records.length === 0) return json({ error: "The page did not contain valid discovery records" }, 400)

  const startedAt = new Date().toISOString()
  const { data: existingTools, error: existingError } = await supabase
    .from("connected_tools")
    .select("id,identity_key,display_name,domain,account_email,status,confidence,plan_name,billing_cycle,amount_minor,currency,quota_remaining,quota_limit,quota_unit,category,website_url,last_verified_at,metadata")
    .eq("user_id", device.user_id)
    .is("deleted_at", null)
  if (existingError) throw existingError

  const existingByKey = new Map((existingTools ?? []).map((tool) => [tool.identity_key, tool]))
  const toolPayload = deduplicateTools(records).map((record) => {
    const existing = existingByKey.get(record.identityKey)
    const shouldReplace = !existing || record.confidence >= Number(existing.confidence)
    return {
      user_id: device.user_id,
      display_name: shouldReplace ? record.displayName : existing?.display_name ?? record.displayName,
      normalized_name: record.normalizedName,
      domain: record.domain ?? existing?.domain ?? null,
      account_email: record.accountEmail ?? existing?.account_email ?? null,
      category: shouldReplace ? record.category : existing.category,
      status: shouldReplace ? record.statusHint : existing.status,
      plan_name: record.planName ?? existing?.plan_name ?? null,
      billing_cycle: record.billingCycle ?? existing?.billing_cycle ?? null,
      amount_minor: record.amountMinor ?? existing?.amount_minor ?? null,
      currency: record.currency ?? existing?.currency ?? null,
      quota_remaining: record.quotaRemaining ?? existing?.quota_remaining ?? null,
      quota_limit: record.quotaLimit ?? existing?.quota_limit ?? null,
      quota_unit: record.quotaUnit ?? existing?.quota_unit ?? null,
      website_url: record.websiteUrl ?? existing?.website_url ?? null,
      confidence: Math.max(record.confidence, Number(existing?.confidence ?? 0)),
      last_discovered_at: startedAt,
      last_verified_at: record.source === "provider_dashboard"
        ? startedAt
        : existing?.last_verified_at ?? null,
      metadata: {
        ...(existing?.metadata && typeof existing.metadata === "object" ? existing.metadata : {}),
        last_source: record.source,
      },
    }
  })

  const { data: tools, error: toolsError } = await supabase
    .from("connected_tools")
    .upsert(toolPayload, { onConflict: "user_id,identity_key" })
    .select("id,identity_key")
  if (toolsError) throw toolsError

  const toolIds = new Map((tools ?? []).map((tool) => [tool.identity_key, tool.id]))
  const recordsWithRefs = await Promise.all(records.map(async (record) => ({
    record,
    sourceRefHash: await sha256([
      record.source, record.identityKey, record.title, record.sender,
      record.evidenceDate, record.excerpt,
    ].join("|")),
  })))
  const evidencePayload = recordsWithRefs.map(({ record, sourceRefHash }) => ({
    user_id: device.user_id,
    connected_tool_id: toolIds.get(record.identityKey) ?? null,
    source: record.source,
    evidence_type: record.evidenceType,
    source_ref_hash: sourceRefHash,
    title: record.title,
    sender: record.sender,
    excerpt: record.excerpt,
    evidence_date: record.evidenceDate,
    status_hint: record.statusHint,
    metadata: {
      scanned_domain: record.domain,
      amount_minor: record.amountMinor,
      currency: record.amountMinor === null ? null : record.currency,
      transaction_direction: record.transactionDirection,
      payment_hint: record.paymentHint,
    },
    deleted_at: null,
  }))

  const { error: evidenceError } = await supabase
    .from("discovery_evidence")
    .upsert(evidencePayload, { onConflict: "user_id,source,source_ref_hash" })
  if (evidenceError) throw evidenceError

  await Promise.all([
    supabase.from("extension_devices").update({ last_seen_at: startedAt }).eq("id", device.id),
    supabase.from("scan_jobs").insert({
      user_id: device.user_id,
      source,
      status: "completed",
      records_found: records.length,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    }),
  ])

  return json({ accepted: records.length, source })
}

function normalizeRecord(input: IncomingRecord, source: string): NormalizedRecord | null {
  const displayName = cleanText(input.displayName, 160)
  if (!displayName) return null
  const domain = normalizeDomain(input.domain)
  const accountEmail = normalizeEmail(input.accountEmail)
  const normalizedName = displayName
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 160)
  if (!normalizedName) return null

  const title = cleanText(input.title, 300)
  const sender = cleanText(input.sender, 300)
  const excerpt = cleanText(input.excerpt, 1200)
  const combined = `${displayName} ${title ?? ""} ${excerpt ?? ""}`.toLowerCase()
  const statusHint = allowedStatuses.has(String(input.statusHint))
    ? String(input.statusHint)
    : classifyStatus(combined, source)
  const evidenceType = allowedEvidenceTypes.has(String(input.evidenceType))
    ? String(input.evidenceType)
    : source === "gmail" ? "email" : source === "provider_dashboard" ? "plan_status" : "account_connection"
  const identityKey = `${normalizedName}|${domain ?? ""}|${accountEmail ?? ""}`
  const evidenceDate = normalizeDate(input.evidenceDate)
  const amountMinor = normalizeNonNegativeInteger(input.amountMinor)
  const currency = normalizeCurrency(input.currency)
  const transactionDirection = String(input.transactionDirection) === "credit"
    || /refund|refunded|cashback|pengembalian dana/.test(combined)
    ? "credit"
    : "debit"
  const recordKey = source === "gmail"
    ? [identityKey, title, sender, evidenceDate, excerpt, amountMinor, currency].join("|")
    : identityKey

  return {
    source,
    displayName,
    normalizedName,
    identityKey,
    recordKey,
    domain,
    accountEmail,
    category: normalizeCategory(input.category),
    title,
    sender,
    excerpt,
    evidenceDate,
    evidenceType,
    statusHint,
    websiteUrl: normalizeUrl(input.websiteUrl),
    planName: cleanText(input.planName, 160),
    billingCycle: normalizeBillingCycle(input.billingCycle),
    amountMinor,
    currency,
    transactionDirection,
    paymentHint: cleanText(input.paymentHint, 120),
    quotaRemaining: normalizeNonNegativeNumber(input.quotaRemaining),
    quotaLimit: normalizeNonNegativeNumber(input.quotaLimit),
    quotaUnit: cleanText(input.quotaUnit, 80),
    confidence: sourceConfidence[source] ?? 0.25,
  }
}

function deduplicateRecords(records: NormalizedRecord[]) {
  const byKey = new Map<string, NormalizedRecord>()
  for (const record of records) {
    const current = byKey.get(record.recordKey)
    if (!current || record.confidence >= current.confidence) byKey.set(record.recordKey, record)
  }
  return [...byKey.values()]
}

function deduplicateTools(records: NormalizedRecord[]) {
  const byIdentity = new Map<string, NormalizedRecord>()
  for (const record of records) {
    const current = byIdentity.get(record.identityKey)
    if (!current || record.confidence >= current.confidence) byIdentity.set(record.identityKey, record)
  }
  return [...byIdentity.values()]
}

function classifyStatus(text: string, source: string) {
  if (/cancel(?:led|ed|ation)|dibatalkan/.test(text)) return "cancelled"
  if (/expired|ended|kedaluwarsa|berakhir/.test(text)) return "expired"
  if (/trial|uji coba/.test(text)) return "trial"
  if (/free credit|promo(?:tional)? credit|grant|benefit|redeem|gratis/.test(text)) return "grant"
  if (/invoice|receipt|renew|payment|charged|billing|paid|subscription|\bpro\b|\bplus\b|\bmax\b|\bteam\b/.test(text)) return "paid"
  if (/free plan|free account/.test(text)) return "free"
  return source === "google_connected_apps" ? "account_only" : "unknown"
}

function normalizeCategory(value: unknown) {
  const category = String(value ?? "unknown").toLowerCase()
  return ["ai", "development", "design", "productivity", "finance", "other"].includes(category) ? category : "unknown"
}

function normalizeBillingCycle(value: unknown) {
  const cycle = String(value ?? "").toLowerCase()
  return ["monthly", "yearly", "usage", "none", "unknown"].includes(cycle) ? cycle : null
}

function normalizeNonNegativeInteger(value: unknown) {
  const number = Number(value)
  return Number.isSafeInteger(number) && number >= 0 ? number : null
}

function normalizeNonNegativeNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function normalizeCurrency(value: unknown) {
  const currency = String(value ?? "").toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : null
}

function normalizeEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 320) : null
}

function normalizeDomain(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase()
  if (!raw) return null
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.replace(/^www\./, "").slice(0, 255)
  } catch {
    return null
  }
}

function normalizeUrl(value: unknown) {
  const raw = String(value ?? "").trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    return ["http:", "https:"].includes(url.protocol) ? url.toString().slice(0, 1000) : null
  } catch {
    return null
  }
}

function normalizeDate(value: unknown) {
  const raw = String(value ?? "").trim()
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function cleanText(value: unknown, maxLength: number) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim()
  return text ? text.slice(0, maxLength) : null
}

function randomHex(byteLength: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  })
}
