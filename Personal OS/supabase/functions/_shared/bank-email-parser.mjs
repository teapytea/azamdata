const MONTHS = new Map([
  ['jan', 0], ['januari', 0], ['feb', 1], ['februari', 1], ['mar', 2], ['maret', 2],
  ['apr', 3], ['april', 3], ['mei', 4], ['may', 4], ['jun', 5], ['juni', 5],
  ['jul', 6], ['juli', 6], ['agu', 7], ['agt', 7], ['agustus', 7], ['aug', 7],
  ['sep', 8], ['sept', 8], ['september', 8], ['okt', 9], ['oktober', 9], ['oct', 9],
  ['nov', 10], ['november', 10], ['des', 11], ['desember', 11], ['dec', 11],
])

const SUCCESS_PATTERN = /\b(?:berhasil|sukses|successful|success|completed)\b/i
const NON_SUCCESS_PATTERN = /\b(?:gagal|failed|pending|diproses|processing|dibatalkan|cancelled|canceled)\b/i
const DEBIT_PATTERN = /\b(?:debit|transfer keluar|transfer ke|transfer qris|pembayaran|payment|pembelian|purchase|tarik tunai|penarikan|withdrawal)\b/i
const CREDIT_PATTERN = /\b(?:credit|kredit|transfer masuk|incoming transfer|refund|pengembalian|setoran|deposit)\b/i

export function parseBankEmail({ bank, subject = '', bodyText = '', internalDate = null }) {
  const text = normalizeText(`${subject}\n${bodyText}`)
  const statusValue = findField(text, ['status transaksi', 'status', 'transaction status'])

  if ((statusValue && NON_SUCCESS_PATTERN.test(statusValue)) || (!statusValue && NON_SUCCESS_PATTERN.test(subject))) {
    return { outcome: 'ignored', reason: `Transaction status is not successful${statusValue ? `: ${statusValue}` : ''}` }
  }

  const statusVerified = Boolean(statusValue && SUCCESS_PATTERN.test(statusValue))
    || SUCCESS_PATTERN.test(subject)
  const counterpartAccountName = detectCounterpartAccount(text)
  const amount = parseAmount(text, Boolean(counterpartAccountName))
  const fee = parseLabeledAmount(text, ['biaya admin', 'biaya transaksi', 'biaya'])
  const externalRef = findField(text, [
    'nomor referensi', 'no referensi', 'no. referensi', 'reference number', 'reference no', 'ref number', 'ref no',
  ])
  const typeValue = findField(text, ['jenis transaksi', 'jenis transfer', 'tipe transaksi', 'transaction type', 'jenis mutasi'])
  const direction = counterpartAccountName ? 'transfer' : parseDirection(typeValue ?? text)
  const dateValue = findField(text, [
    'tanggal & waktu', 'tanggal dan waktu', 'waktu transaksi', 'tanggal transaksi', 'transaction date', 'date & time',
  ])
  const occurredAt = parseIndonesianDate(dateValue)
  const merchant = findField(text, [
    'pembayaran ke', 'nama perusahaan/produk', 'nama penerima', 'nama merchant', 'nama',
    'tujuan transfer', 'beneficiary', 'description', 'keterangan',
  ])
  const missing = []

  if (!statusVerified) missing.push('successful status')
  if (!amount) missing.push('amount')
  if (!externalRef) missing.push('reference number')
  if (!direction) missing.push('transaction direction')
  if (!occurredAt) missing.push('transaction date')
  if (direction === 'transfer' && !counterpartAccountName) missing.push('counterpart account mapping')

  const description = cleanValue(merchant) ?? `${bank.toUpperCase()} email transaction`
  const evidenceDate = occurredAt ?? normalizeFallbackDate(internalDate)
  const confidence = Math.max(0.25, 1 - missing.length * 0.13)

  if (missing.length > 0) {
    return {
      outcome: 'needs_review',
      reason: `Missing or unverified: ${missing.join(', ')}`,
      bank: bank.toUpperCase(),
      amountMinor: amount?.amountMinor ?? null,
      currency: amount?.currency ?? null,
      direction,
      occurredAt: evidenceDate,
      externalRef: cleanValue(externalRef),
      description,
      counterpartAccountName,
      feeMinor: fee?.amountMinor ?? null,
      confidence,
    }
  }

  return {
    outcome: 'processed',
    bank: bank.toUpperCase(),
    amountMinor: amount.amountMinor,
    currency: amount.currency,
    direction,
    occurredAt,
    externalRef: cleanValue(externalRef),
    description,
    counterpartAccountName,
    feeMinor: fee?.amountMinor ?? null,
    confidence: 0.97,
  }
}

export function parseCommerceEmail({ provider, subject = '', bodyText = '', internalDate = null }) {
  const text = normalizeText(`${subject}\n${bodyText}`)
  const normalizedProvider = String(provider ?? '').toLowerCase()

  if (normalizedProvider === 'shopee') {
    const order = subject.match(/\bPesanan\s*#([A-Z0-9-]+)[\s\S]*\bTelah\s+Dikirim\b/i)
    if (!order) return { outcome: 'ignored', reason: 'Shopee email is not a shipped-order confirmation' }
    return commerceReviewResult({
      provider: 'Shopee',
      text,
      internalDate,
      externalRef: order[1],
      description: `Shopee order #${order[1]}`,
      reason: 'Reconcile this order with its bank or wallet payment before recording it, to prevent double counting',
      amountLabels: ['total pembayaran', 'total pesanan', 'total produk', 'total'],
      dateLabels: ['waktu pembayaran', 'waktu pemesanan', 'tanggal pesanan', 'tanggal pembelian'],
    })
  }

  if (normalizedProvider === 'gopay') {
    if (isClearlyPromotional(text)) return { outcome: 'ignored', reason: 'Promotional GoPay email ignored' }
    return commerceReviewResult({
      provider: 'GoPay',
      text,
      internalDate,
      externalRef: findField(text, ['id transaksi', 'nomor transaksi', 'no. transaksi', 'nomor referensi', 'reference id']),
      description: findField(text, ['nama merchant', 'merchant', 'transaksi di', 'pembayaran ke', 'keterangan']) ?? 'GoPay transaction',
      reason: 'GoPay template needs validation against genuine messages before automatic posting',
      amountLabels: ['total pembayaran', 'total transaksi', 'jumlah pembayaran', 'nominal', 'amount', 'total'],
      dateLabels: ['waktu transaksi', 'tanggal transaksi', 'transaction date', 'tanggal & waktu'],
    })
  }

  if (normalizedProvider === 'grab') {
    if (isClearlyPromotional(text)) return { outcome: 'ignored', reason: 'Promotional Grab email ignored' }
    return commerceReviewResult({
      provider: 'Grab',
      text,
      internalDate,
      externalRef: findField(text, ['booking id', 'kode booking', 'order id', 'nomor pesanan', 'id transaksi']),
      description: findField(text, ['layanan', 'merchant', 'restoran', 'tujuan']) ?? 'Grab transaction',
      reason: 'Reconcile this Grab receipt with its payment source before recording it, to prevent double counting',
      amountLabels: ['total pembayaran', 'total dibayar', 'total fare', 'total', 'amount paid'],
      dateLabels: ['tanggal perjalanan', 'waktu pemesanan', 'tanggal transaksi', 'booking date'],
    })
  }

  return { outcome: 'ignored', reason: 'Unsupported commerce email source' }
}

function commerceReviewResult({ provider, text, internalDate, externalRef, description, reason, amountLabels, dateLabels }) {
  const amount = parseLabeledAmount(text, amountLabels) ?? parseCurrencyAmount(text)
  const occurredAt = parseIndonesianDate(findField(text, dateLabels)) ?? normalizeFallbackDate(internalDate)
  const missing = []
  if (!amount) missing.push('amount')
  if (!externalRef) missing.push('reference number')
  return {
    outcome: 'needs_review',
    reason: missing.length > 0 ? `${reason}; missing ${missing.join(' and ')}` : reason,
    bank: provider,
    amountMinor: amount?.amountMinor ?? null,
    currency: amount?.currency ?? null,
    direction: 'debit',
    occurredAt,
    externalRef: cleanValue(externalRef),
    description,
    counterpartAccountName: null,
    feeMinor: null,
    confidence: missing.length > 0 ? 0.45 : 0.72,
  }
}

function isClearlyPromotional(text) {
  return /\b(?:promo|diskon|cashback|voucher|newsletter|penawaran|hemat)\b/i.test(text)
    && !/\b(?:transaksi|pembayaran|pesanan|receipt|tanda terima|berhasil)\b/i.test(text)
}

export function extractEmailAddress(value) {
  const match = String(value ?? '').match(/<([^<>\s]+@[^<>\s]+)>|\b([^<>\s]+@[^<>\s]+)\b/)
  return (match?.[1] ?? match?.[2] ?? '').toLowerCase().replace(/[>,;]+$/, '') || null
}

export function extractAuthenticationResults(rawContent) {
  const headerBlock = String(rawContent ?? '').split(/\r?\n\r?\n/, 1)[0] ?? ''
  const unfolded = headerBlock.replace(/\r?\n[\t ]+/g, ' ')
  return unfolded
    .split(/\r?\n/)
    .filter((line) => /^authentication-results:/i.test(line))
    .join(' ')
}

export function hasPassingEmailAuthentication(rawContent, sender = null) {
  const results = extractAuthenticationResults(rawContent)
  if (!/\bspf=pass\b/i.test(results) || !/\bdkim=pass\b/i.test(results)) return false
  if (!sender) return true
  const senderDomain = String(sender).split('@')[1]?.toLowerCase()
  if (!senderDomain || !/\bdmarc=pass\b/i.test(results)) return false
  const authenticatedDomain = results.match(/\bheader\.from=([^\s;]+)/i)?.[1]?.toLowerCase().replace(/[>,]+$/, '')
  if (!authenticatedDomain) return false
  return senderDomain === authenticatedDomain || senderDomain.endsWith(`.${authenticatedDomain}`)
}

function normalizeText(value) {
  return decodeEntities(String(value ?? ''))
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function findField(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*[:\\-]?\\s*([^\\n]{1,180})`, 'im')
    const match = text.match(pattern)
    const value = cleanValue(match?.[1])
    if (value) return value
  }
  return null
}

function cleanValue(value) {
  const cleaned = String(value ?? '').replace(/\s+/g, ' ').replace(/[|]+$/, '').trim()
  return cleaned || null
}

function parseAmount(text, preferPrincipal) {
  const total = parseLabeledAmount(text, ['total debit', 'total debet', 'total bayar', 'total tagihan', 'total transaksi', 'total'])
  const principal = parseLabeledAmount(text, ['nominal bayar', 'nominal tujuan', 'nominal transaksi', 'nominal', 'amount'])
  if (preferPrincipal && principal) return principal
  if (total) return total
  if (principal) return principal
  return parseCurrencyAmount(text)
}

function parseLabeledAmount(text, labels) {
  const value = findField(text, labels)
  return value ? parseCurrencyAmount(value) : null
}

function parseCurrencyAmount(text) {
  const idrMatch = text.match(/\bIDR\s*([0-9][0-9,.]*)/i)
  if (idrMatch) {
    const normalized = idrMatch[1].replace(/,/g, '')
    const value = Number.parseFloat(normalized)
    return Number.isFinite(value) && value > 0 ? { amountMinor: Math.round(value * 100), currency: 'IDR' } : null
  }

  const rupiahMatch = text.match(/\bRp\.?\s*([0-9][0-9,.]*)/i)
  if (!rupiahMatch) return null
  const raw = rupiahMatch[1]
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/\./g, '')
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) && value > 0 ? { amountMinor: Math.round(value * 100), currency: 'IDR' } : null
}

function parseDirection(value) {
  if (!value) return null
  if (DEBIT_PATTERN.test(value)) return 'debit'
  if (CREDIT_PATTERN.test(value)) return 'credit'
  return null
}

function detectCounterpartAccount(text) {
  if (/\b(?:GOPAY TOPUP|PT DOMPET ANAK BANGSA)\b/i.test(text)) return 'GoPay'
  if (/\b(?:SHOPEEPAY|PT AIRPAY INTERNATIONAL)\b/i.test(text)) return 'ShopeePay'
  if (/\b(?:DANA TOPUP|PT ESPAY DEBIT INDONESIA KOE)\b/i.test(text)) return 'DANA'
  return null
}

function parseIndonesianDate(value) {
  if (!value) return null
  const normalized = String(value).trim().replace(/\s+/g, ' ')
  const named = normalized.match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:[ ,]+(?:pukul\s*)?(\d{1,2})[:.]([0-5]\d)(?::([0-5]\d))?)?/i)
  if (named) {
    const month = MONTHS.get(named[2].toLowerCase())
    if (month === undefined) return null
    return jakartaIso(Number(named[3]), month, Number(named[1]), Number(named[4] ?? 0), Number(named[5] ?? 0), Number(named[6] ?? 0))
  }

  const numeric = normalized.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ ,]+(\d{1,2})[:.]([0-5]\d)(?::([0-5]\d))?)?/)
  if (!numeric) return null
  return jakartaIso(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]), Number(numeric[4] ?? 0), Number(numeric[5] ?? 0), Number(numeric[6] ?? 0))
}

function jakartaIso(year, month, day, hour, minute, second) {
  const utc = Date.UTC(year, month, day, hour - 7, minute, second)
  const date = new Date(utc)
  if (Number.isNaN(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  if (Number(values.year) !== year || Number(values.month) !== month + 1 || Number(values.day) !== day) return null
  return date.toISOString()
}

function normalizeFallbackDate(value) {
  const date = new Date(value ?? '')
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
