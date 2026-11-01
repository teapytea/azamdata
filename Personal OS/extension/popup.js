/* global chrome, document, fetch, navigator, location, URL */

const FUNCTION_URL = 'https://xmflqzqesgvbzyuucoxg.supabase.co/functions/v1/extension-ingest'
const GMAIL_QUERY = 'newer_than:5y {subject:(receipt invoice billing payment paid charged purchase transaction refund renewal subscription faktur kwitansi tagihan pembayaran transaksi pembelian langganan) "payment successful" "payment received" "pembayaran berhasil" "transaksi berhasil"}'

const pairPanel = document.querySelector('#pairPanel')
const scanPanel = document.querySelector('#scanPanel')
const pairState = document.querySelector('#pairState')
const pairCode = document.querySelector('#pairCode')
const pairButton = document.querySelector('#pairButton')
const scanButton = document.querySelector('#scanButton')
const forgetButton = document.querySelector('#forgetButton')
const message = document.querySelector('#message')
const pageType = document.querySelector('#pageType')
const pageUrl = document.querySelector('#pageUrl')

initialize()

pairButton.addEventListener('click', pairExtension)
scanButton.addEventListener('click', scanCurrentPage)
forgetButton.addEventListener('click', forgetPairing)
document.querySelector('#openGoogle').addEventListener('click', () => chrome.tabs.create({ url: 'https://myaccount.google.com/connections' }))
document.querySelector('#openGmail').addEventListener('click', () => chrome.tabs.create({ url: `https://mail.google.com/mail/#search/${encodeURIComponent(GMAIL_QUERY)}` }))

async function initialize() {
  const { deviceToken } = await chrome.storage.local.get('deviceToken')
  setPaired(Boolean(deviceToken))
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url) return
  pageUrl.textContent = tab.url
  pageType.textContent = describePage(tab.url)
}

async function pairExtension() {
  const code = pairCode.value.replace(/[^a-z0-9]/gi, '').toUpperCase()
  if (code.length !== 10) return setMessage('Enter the complete 10-character pairing code.', 'error')
  setBusy(pairButton, true, 'Pairing…')
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'exchange', code, deviceName: `${navigator.platform || 'Edge'} browser` }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Pairing failed')
    await chrome.storage.local.set({ deviceToken: result.token, deviceId: result.deviceId })
    setPaired(true)
    setMessage('Extension paired. Open a source page and scan it.', 'success')
  } catch (error) {
    setMessage(error instanceof Error ? error.message : 'Pairing failed', 'error')
  } finally {
    setBusy(pairButton, false, 'Pair extension')
  }
}

async function scanCurrentPage() {
  setBusy(scanButton, true, 'Scanning…')
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id || !tab.url?.startsWith('http')) throw new Error('Open a Google, Gmail, or provider website first.')
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: collectPageEvidence })
    if (!result?.records?.length) throw new Error(result?.error || 'No supported records were visible. Scroll the list or open billing/account settings, then try again.')
    const { deviceToken } = await chrome.storage.local.get('deviceToken')
    if (!deviceToken) throw new Error('Pair the extension first.')
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-device-token': deviceToken },
      body: JSON.stringify({ action: 'ingest', source: result.source, records: result.records }),
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Scan could not be saved')
    setMessage(`${payload.accepted} records saved from ${describeSource(payload.source)}.`, 'success')
  } catch (error) {
    setMessage(error instanceof Error ? error.message : 'Scan failed', 'error')
  } finally {
    setBusy(scanButton, false, 'Scan current page')
  }
}

async function forgetPairing() {
  await chrome.storage.local.remove(['deviceToken', 'deviceId'])
  setPaired(false)
  setMessage('Local pairing removed. Revoke the device in Personal OS if it should no longer have access.', 'success')
}

function collectPageEvidence() {
  const host = location.hostname.toLowerCase()
  if (host === 'myaccount.google.com') return scanGoogleConnections()
  if (host === 'mail.google.com') return scanGmailResults()
  return scanProviderDashboard()

  async function scanGoogleConnections() {
    const excluded = new Set([
      'apps connected', 'aplikasi tertaut', 'filter', 'search', 'telusuri', 'sort', 'urutkan',
      'all connections', 'semua koneksi', 'sign in with google', 'akses ke akun google',
      'linked account', 'akun tertaut', 'learn more', 'pelajari lebih lanjut',
      'kelola berbagi data', 'tinjau aplikasi tertaut anda', 'lihat menurut',
    ])
    const selectors = ['[role="listitem"]', 'li', 'a', 'button', '[role="link"]', '[tabindex="0"]', 'div']
    const names = new Map()

    function isExcluded(value) {
      const normalized = value.toLowerCase().replace(/\s+/g, ' ').trim()
      if (excluded.has(normalized)) return true
      return /^(login dengan google|sign in with google|akses ke|access to|aplikasi tertaut|linked apps|lihat menurut|view by|telusuri|search)(\s|\(|$)/i.test(normalized)
    }

    function collectVisibleNames() {
      const root = document.querySelector('main, [role="main"]') || document.body
      const elements = [...new Set(selectors.flatMap((selector) => [...root.querySelectorAll(selector)]))]

      for (const element of elements) {
        const rect = element.getBoundingClientRect()
        if (rect.width < 180 || rect.height < 36 || rect.height > 130) continue
        if (rect.bottom < 0 || rect.top > document.documentElement.clientHeight) continue

        const hasVisualMarker = Boolean(element.querySelector('img, svg'))
        const isInteractive = element.matches('a, button, [role="link"], [role="listitem"], [tabindex="0"]')
        if (!hasVisualMarker && !isInteractive) continue

        const lines = [...new Set((element.innerText || '')
          .split('\n')
          .map((line) => line.replace(/\s+/g, ' ').trim())
          .filter(Boolean))]
        const imageLabels = [...element.querySelectorAll('img[alt]')]
          .map((image) => image.getAttribute('alt')?.trim())
          .filter(Boolean)
        const name = [...lines, ...imageLabels].find((line) => (
          line.length >= 2
          && line.length <= 120
          && !isExcluded(line)
          && !/^\d+$/.test(line)
          && !/\d+\s+(connection|connections|koneksi)/i.test(line)
        ))
        if (!name) continue
        names.set(name.toLowerCase(), name)
      }
    }

    const scroller = document.scrollingElement || document.documentElement
    const originalScrollTop = scroller.scrollTop
    const scrollStep = Math.max(420, Math.floor(document.documentElement.clientHeight * 0.72))
    let stableEndPasses = 0

    try {
      scroller.scrollTop = 0
      await new Promise((resolve) => globalThis.setTimeout(resolve, 300))

      for (let pass = 0; pass < 80; pass += 1) {
        collectVisibleNames()
        const previousTop = scroller.scrollTop
        const previousHeight = scroller.scrollHeight
        scroller.scrollTop = Math.min(previousTop + scrollStep, previousHeight)
        await new Promise((resolve) => globalThis.setTimeout(resolve, 280))

        const reachedEnd = scroller.scrollTop === previousTop
          || scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4
        if (!reachedEnd) {
          stableEndPasses = 0
          continue
        }

        collectVisibleNames()
        await new Promise((resolve) => globalThis.setTimeout(resolve, 350))
        stableEndPasses = scroller.scrollHeight > previousHeight ? 0 : stableEndPasses + 1
        if (stableEndPasses >= 2) break
      }
    } finally {
      scroller.scrollTop = originalScrollTop
    }

    return {
      source: 'google_connected_apps',
      records: [...names.values()].map((name) => ({
        displayName: name,
        evidenceType: 'account_connection',
        statusHint: 'account_only',
        title: `Connected to Google: ${name}`,
        websiteUrl: location.href,
      })),
    }
  }

  async function scanGmailResults() {
    const records = new Map()

    function parseLocalizedNumber(rawValue) {
      const compact = rawValue.replace(/\s/g, '').replace(/[^0-9.,]/g, '')
      if (!compact) return null
      const lastDot = compact.lastIndexOf('.')
      const lastComma = compact.lastIndexOf(',')
      let normalized = compact

      if (lastDot >= 0 && lastComma >= 0) {
        const decimalSeparator = lastDot > lastComma ? '.' : ','
        const groupingSeparator = decimalSeparator === '.' ? ',' : '.'
        normalized = compact.split(groupingSeparator).join('').replace(decimalSeparator, '.')
      } else {
        const separator = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null
        if (separator) {
          const parts = compact.split(separator)
          const finalPart = parts.at(-1) || ''
          normalized = finalPart.length === 2
            ? `${parts.slice(0, -1).join('')}.${finalPart}`
            : parts.join('')
        }
      }

      const value = Number(normalized)
      return Number.isFinite(value) && value > 0 ? value : null
    }

    function extractMoney(text) {
      const patterns = [
        { currency: 'IDR', expression: /(?:\bIDR\b|Rp\.?)(?:\s|&nbsp;)*([0-9][0-9.,\s]*)/i },
        { currency: 'USD', expression: /(?:\bUSD\b|US\$|\$)(?:\s|&nbsp;)*([0-9][0-9.,\s]*)/i },
        { currency: 'EUR', expression: /(?:\bEUR\b|€)(?:\s|&nbsp;)*([0-9][0-9.,\s]*)/i },
        { currency: 'GBP', expression: /(?:\bGBP\b|£)(?:\s|&nbsp;)*([0-9][0-9.,\s]*)/i },
        { currency: 'SGD', expression: /(?:\bSGD\b|S\$)(?:\s|&nbsp;)*([0-9][0-9.,\s]*)/i },
        { currency: 'AUD', expression: /(?:\bAUD\b|A\$)(?:\s|&nbsp;)*([0-9][0-9.,\s]*)/i },
      ]

      for (const pattern of patterns) {
        const match = text.match(pattern.expression)
        const value = match ? parseLocalizedNumber(match[1]) : null
        if (value !== null) return { amountMinor: Math.round(value * 100), currency: pattern.currency }
      }
      return { amountMinor: null, currency: null }
    }

    function normalizeGmailDate(rawDate) {
      if (!rawDate) return null
      const translated = rawDate.replace(/\b(Mei|Agu|Okt|Des)\b/gi, (month) => ({
        mei: 'May', agu: 'Aug', okt: 'Oct', des: 'Dec',
      })[month.toLowerCase()] || month)
      const parsed = new Date(translated)
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
    }

    function extractPaymentHint(text) {
      const match = text.match(/\b(?:visa|mastercard|amex|paypal|bca|gopay|ovo|dana|kartu|card)[^\n,.]{0,36}(?:[•*x]{2,}\s*)?\d{4}\b/i)
      return match?.[0]?.replace(/\s+/g, ' ').trim().slice(0, 120) || null
    }

    function collectRows() {
      for (const row of document.querySelectorAll('tr.zA')) {
        if (records.size >= 250) break
        const senderElement = row.querySelector('.yW span[email], .yX span[email], .yW span')
        const sender = senderElement?.getAttribute('email') || senderElement?.textContent?.trim() || null
        const senderName = senderElement?.getAttribute('name') || senderElement?.textContent?.trim() || sender
        const subject = row.querySelector('.bog')?.textContent?.trim() || null
        const snippet = row.querySelector('.y2')?.textContent?.replace(/^\s*[-–—]\s*/, '').trim() || null
        const dateElement = row.querySelector('.xW span[title], .xW span[aria-label], .xW span')
        const rawDate = dateElement?.getAttribute('title')
          || dateElement?.getAttribute('aria-label')
          || dateElement?.textContent?.trim()
          || null
        if (!senderName || !subject) continue

        const combined = `${subject} ${snippet ?? ''}`
        const billingPattern = /invoice|receipt|billing|payment|paid|charged|purchase|transaction|refund|renew|subscription|faktur|kwitansi|tagihan|pembayaran|transaksi|pembelian|langganan/i
        if (!billingPattern.test(combined)) continue

        const domain = sender?.includes('@') ? sender.split('@').pop() : null
        const money = extractMoney(combined)
        const evidenceDate = normalizeGmailDate(rawDate)
        const rowId = row.getAttribute('data-legacy-thread-id')
          || row.getAttribute('data-thread-id')
          || [sender, subject, evidenceDate, snippet].join('|')
        records.set(rowId, {
          displayName: String(senderName).slice(0, 160),
          domain,
          title: subject,
          sender,
          excerpt: snippet,
          evidenceDate,
          evidenceType: 'billing',
          amountMinor: money.amountMinor,
          currency: money.currency,
          transactionDirection: /refund|refunded|cashback|pengembalian dana/i.test(combined) ? 'credit' : 'debit',
          paymentHint: extractPaymentHint(combined),
          websiteUrl: location.href,
        })
      }
    }

    function findScroller() {
      let element = document.querySelector('tr.zA')?.parentElement || null
      while (element && element !== document.body) {
        const style = globalThis.getComputedStyle(element)
        if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) return element
        element = element.parentElement
      }
      return document.scrollingElement || document.documentElement
    }

    const scroller = findScroller()
    const originalScrollTop = scroller.scrollTop
    const scrollStep = Math.max(420, Math.floor(scroller.clientHeight * 0.78))
    let stableEndPasses = 0

    try {
      scroller.scrollTop = 0
      await new Promise((resolve) => globalThis.setTimeout(resolve, 450))

      for (let pass = 0; pass < 160 && records.size < 250; pass += 1) {
        collectRows()
        const previousTop = scroller.scrollTop
        const previousHeight = scroller.scrollHeight
        scroller.scrollTop = Math.min(previousTop + scrollStep, previousHeight)
        await new Promise((resolve) => globalThis.setTimeout(resolve, 320))

        const reachedEnd = scroller.scrollTop === previousTop
          || scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4
        if (!reachedEnd) {
          stableEndPasses = 0
          continue
        }

        collectRows()
        await new Promise((resolve) => globalThis.setTimeout(resolve, 500))
        stableEndPasses = scroller.scrollHeight > previousHeight ? 0 : stableEndPasses + 1
        if (stableEndPasses >= 2) break
      }
    } finally {
      scroller.scrollTop = originalScrollTop
    }

    return { source: 'gmail', records: [...records.values()] }
  }

  function scanProviderDashboard() {
    const title = document.title.split(/\s[-|·]\s/)[0].trim() || location.hostname
    const lines = (document.body?.innerText || '')
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length >= 3 && line.length <= 240)
    const relevantPattern = /plan|subscription|billing|invoice|payment|renew|trial|credit|usage|quota|limit|expires|expired|cancel|free|pro\b|plus\b|max\b|team\b|monthly|annual|yearly|paket|tagihan|langganan|kredit|kuota|berakhir/i
    const relevant = [...new Set(lines.filter((line) => relevantPattern.test(line)))].slice(0, 20)
    const email = [...new Set((document.body?.innerText || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])][0] || null
    const statusText = relevant.join(' ').toLowerCase()
    const statusHint = /cancel(?:led|ed)|dibatalkan/.test(statusText) ? 'cancelled'
      : /expired|ended|kedaluwarsa|berakhir/.test(statusText) ? 'expired'
      : /trial|uji coba/.test(statusText) ? 'trial'
      : /free credit|promo credit|grant|benefit|redeem|gratis/.test(statusText) ? 'grant'
      : /invoice|receipt|renew|payment|charged|billing|paid|subscription|\bpro\b|\bplus\b|\bmax\b|\bteam\b/.test(statusText) ? 'paid'
      : /free plan|free account/.test(statusText) ? 'free' : 'unknown'
    return {
      source: 'provider_dashboard',
      records: relevant.length ? [{
        displayName: title,
        domain: location.hostname,
        accountEmail: email,
        title: document.title,
        excerpt: relevant.join(' · ').slice(0, 1200),
        evidenceType: 'plan_status',
        statusHint,
        websiteUrl: location.href,
      }] : [],
    }
  }
}

function setPaired(paired) {
  pairPanel.hidden = paired
  scanPanel.hidden = !paired
  pairState.textContent = paired ? 'Paired' : 'Not paired'
  pairState.classList.toggle('connected', paired)
}

function setBusy(button, busy, label) {
  button.disabled = busy
  button.textContent = label
}

function setMessage(text, tone = '') {
  message.textContent = text
  message.className = `message ${tone}`
}

function describePage(url) {
  try {
    const host = new URL(url).hostname
    if (host === 'myaccount.google.com') return 'Google connected apps'
    if (host === 'mail.google.com') return 'Gmail search results'
    return 'Provider dashboard'
  } catch { return 'Current page' }
}

function describeSource(source) {
  if (source === 'google_connected_apps') return 'Google connections'
  if (source === 'provider_dashboard') return 'provider dashboard'
  return 'Gmail'
}
