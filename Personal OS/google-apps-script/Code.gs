const PERSONAL_OS_DEFAULT_ENDPOINT = 'https://xmflqzqesgvbzyuucoxg.supabase.co/functions/v1/gmail-ingest'
const DEFAULT_BANK_LABEL = 'PersonalOS/Bank'
const DEFAULT_PROCESSED_LABEL = 'PersonalOS/Processed'
const DEFAULT_SYNC_START_DATE = '2026/01/01'
const DEFAULT_BCA_SENDER = 'bca@bca.co.id'
const DEFAULT_BSI_SENDER = 'mobile@bankbsi.co.id'
const DEFAULT_SHOPEE_SENDER = 'info@mail.shopee.co.id'
const DEFAULT_GOPAY_SENDER = 'no-reply@customers.go-pay.co.id'
const DEFAULT_GRAB_SENDER = 'no-reply@grab.com'
const MAX_MESSAGES_PER_RUN = 25
const MAX_BACKFILL_BATCHES = 10

function setup() {
  const config = getConfig_()
  GmailApp.getUserLabelByName(config.bankLabel) || GmailApp.createLabel(config.bankLabel)
  GmailApp.getUserLabelByName(config.processedLabel) || GmailApp.createLabel(config.processedLabel)

  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'syncBankEmails')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger))

  ScriptApp.newTrigger('syncBankEmails')
    .timeBased()
    .atHour(6)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone('Asia/Jakarta')
    .create()
  syncBankEmails()
}

function doGet(event) {
  try {
    const result = syncBankEmails()
    const total = Number(result.accepted || 0)
    if (event && event.parameter && event.parameter.format === 'json') {
      return jsonOutput_({ ok: true, ...result })
    }
    return HtmlService.createHtmlOutput(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Personal OS sync</title></head><body style="font-family:system-ui;background:#0c1019;color:#fff;padding:32px"><h1>Finance sync complete</h1><p>${total} new Gmail message${total === 1 ? '' : 's'} checked.</p><p>You can close this tab and return to Personal OS.</p><script>setTimeout(()=>window.close(),1500)</script></body></html>`)
  } catch (error) {
    if (event && event.parameter && event.parameter.format === 'json') {
      return jsonOutput_({ ok: false, error: String(error && error.message || error) })
    }
    return HtmlService.createHtmlOutput(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Personal OS sync</title></head><body style="font-family:system-ui;background:#0c1019;color:#fff;padding:32px"><h1>Finance sync failed</h1><p>${escapeHtml_(String(error && error.message || error))}</p></body></html>`)
  }
}

function syncBankEmails() {
  const lock = LockService.getScriptLock()
  if (!lock.tryLock(1000)) return { accepted: 0, processed: 0, needsReview: 0, skipped: true }
  try {
    const config = getConfig_()
    const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const cutoff = new Date(Math.max(parseStartDate_(config.syncStartDate).getTime(), recentCutoff.getTime()))
    return syncQuery_(`${gmailAfterDate_(config.syncStartDate)} newer_than:30d`, cutoff, false)
  } finally {
    lock.releaseLock()
  }
}

function backfillBankEmails() {
  const config = getConfig_()
  const totals = { accepted: 0, processed: 0, needsReview: 0, batches: 0 }
  for (let batch = 0; batch < MAX_BACKFILL_BATCHES; batch += 1) {
    const result = syncQuery_(gmailAfterDate_(config.syncStartDate), parseStartDate_(config.syncStartDate), true)
    totals.accepted += Number(result.accepted || 0)
    totals.processed += Number(result.processed || 0)
    totals.needsReview += Number(result.needsReview || 0)
    totals.batches += 1
    if (!result.accepted) break
  }
  console.log(JSON.stringify(totals))
  return totals
}

function syncQuery_(dateQuery, cutoff, excludeProcessed) {
  const config = getConfig_()
  const senderQuery = `{${config.bankSenders.map((sender) => `from:${sender}`).join(' ')}}`
  const query = [
    senderQuery,
    excludeProcessed ? `-label:"${config.processedLabel}"` : null,
    dateQuery,
  ].filter(Boolean).join(' ')
  const threads = GmailApp.search(query, 0, 25)
  const selectedThreads = []
  const messages = []

  for (const thread of threads) {
    const threadMessages = thread.getMessages()
      .filter((message) => message.getDate().getTime() >= cutoff.getTime())
      .filter((message) => shouldSyncMessage_(message, config))
      .sort((a, b) => b.getDate().getTime() - a.getDate().getTime())
      .slice(0, Math.max(0, MAX_MESSAGES_PER_RUN - messages.length))
    if (threadMessages.length === 0) continue
    selectedThreads.push({ thread, messageIds: threadMessages.map((message) => message.getId()) })
    for (const message of threadMessages) {
      messages.push({
        messageId: message.getId(),
        threadId: thread.getId(),
        from: message.getFrom(),
        to: message.getTo(),
        subject: message.getSubject(),
        bodyText: message.getPlainBody(),
        rawContent: message.getRawContent(),
        internalDate: message.getDate().toISOString(),
        labels: thread.getLabels().map((label) => label.getName()),
      })
    }
    if (messages.length >= MAX_MESSAGES_PER_RUN) break
  }

  if (messages.length === 0) return { accepted: 0, processed: 0, needsReview: 0 }

  const response = UrlFetchApp.fetch(config.endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-ingest-secret': config.secret },
    payload: JSON.stringify({ version: 1, messages }),
    muteHttpExceptions: true,
  })

  const status = response.getResponseCode()
  const payload = JSON.parse(response.getContentText() || '{}')
  if (status < 200 || status >= 300) {
    throw new Error(`Personal OS ingest failed (${status}): ${payload.error || 'Unknown error'}`)
  }

  const acceptedIds = new Set(
    (payload.results || [])
      .filter((result) => result.accepted)
      .map((result) => result.messageId),
  )
  const processedLabel = GmailApp.getUserLabelByName(config.processedLabel)
  for (const entry of selectedThreads) {
    if (entry.messageIds.every((messageId) => acceptedIds.has(messageId))) {
      entry.thread.addLabel(GmailApp.getUserLabelByName(config.bankLabel))
      entry.thread.addLabel(processedLabel)
    }
  }

  console.log(JSON.stringify(payload))
  return payload
}

function getConfig_() {
  const properties = PropertiesService.getScriptProperties()
  const endpoint = properties.getProperty('PERSONAL_OS_ENDPOINT') || PERSONAL_OS_DEFAULT_ENDPOINT
  const secret = properties.getProperty('PERSONAL_OS_SECRET')
  const bankLabel = properties.getProperty('BANK_LABEL') || DEFAULT_BANK_LABEL
  const processedLabel = properties.getProperty('PROCESSED_LABEL') || DEFAULT_PROCESSED_LABEL
  const bcaSender = normalizeSender_(properties.getProperty('BCA_SENDER') || DEFAULT_BCA_SENDER)
  const bsiSender = normalizeSender_(properties.getProperty('BSI_SENDER') || DEFAULT_BSI_SENDER)
  const shopeeSender = normalizeSender_(properties.getProperty('SHOPEE_SENDER') || DEFAULT_SHOPEE_SENDER)
  const gopaySender = normalizeSender_(properties.getProperty('GOPAY_SENDER') || DEFAULT_GOPAY_SENDER)
  const grabSender = normalizeSender_(properties.getProperty('GRAB_SENDER') || DEFAULT_GRAB_SENDER)
  const bankSenders = [bcaSender, bsiSender, shopeeSender, gopaySender, grabSender].filter(Boolean)
  const syncStartDate = DEFAULT_SYNC_START_DATE

  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error('Set PERSONAL_OS_SECRET in Project Settings > Script properties before running setup().')
  }

  return { endpoint, secret, bankLabel, processedLabel, syncStartDate, bankSenders: [...new Set(bankSenders)], shopeeSender }
}

function shouldSyncMessage_(message, config) {
  const sender = extractEmailAddress_(message.getFrom())
  if (!sender || !config.bankSenders.includes(sender)) return false
  if (sender === config.shopeeSender) {
    return /\bPesanan\s*#[A-Z0-9-]+[\s\S]*\bTelah\s+Dikirim\b/i.test(message.getSubject())
  }
  return true
}

function normalizeSender_(value) {
  return String(value || '').trim().toLowerCase()
}

function extractEmailAddress_(value) {
  const match = String(value || '').match(/<([^<>\s]+@[^<>\s]+)>|\b([^<>\s]+@[^<>\s]+)\b/)
  return String((match && (match[1] || match[2])) || '').toLowerCase().replace(/[>,;]+$/, '')
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)
}

function gmailAfterDate_(startDate) {
  const date = parseStartDate_(startDate)
  date.setUTCDate(date.getUTCDate() - 1)
  return `after:${Utilities.formatDate(date, 'UTC', 'yyyy/MM/dd')}`
}

function parseStartDate_(startDate) {
  const match = String(startDate).match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  if (!match) throw new Error('SYNC_START_DATE must use YYYY/MM/DD format.')
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  if (Number.isNaN(date.getTime())) throw new Error('SYNC_START_DATE is invalid.')
  return date
}
