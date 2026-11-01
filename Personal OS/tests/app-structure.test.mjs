import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('build emits the Personal OS single-page shell', async () => {
  const html = await read('dist/index.html')
  assert.match(html, /<title>Personal OS<\/title>/)
  assert.match(html, /assets\/personal-os\.png/)
  assert.match(html, /src="\/assets\//)
})

test('Sites worker serves the app shell and TanStack client routes', async () => {
  const workerUrl = new URL('../dist/server/index.js', import.meta.url)
  workerUrl.searchParams.set('test', `${process.pid}-${Date.now()}`)
  const { default: worker } = await import(workerUrl.href)

  for (const path of ['/', '/connections']) {
    const response = await worker.fetch(new Request(`https://personal-os.test${path}`, {
      headers: { accept: 'text/html' },
    }))
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type') ?? '', /^text\/html/)
    assert.match(await response.text(), /<title>Personal OS<\/title>/)
  }
})

test('all Personal OS TanStack routes are represented in the generated route tree', async () => {
  const routeTree = await read('src/routeTree.gen.ts')
  for (const route of ['/', '/finance', '/subscriptions', '/ideas', '/quota', '/connections']) {
    assert.match(routeTree, new RegExp(`['"]${route.replace('/', '\\/')}['"]`))
  }
})

test('Ideas UI is a read-only vault preview', async () => {
  const ideasScreen = await read('src/features/ideas/IdeasScreen.tsx')
  assert.match(ideasScreen, /Read-only preview/)
  assert.match(ideasScreen, /Open in Obsidian/)
  assert.doesNotMatch(ideasScreen, /contentEditable/)
})

test('Supabase migration protects every product table with ownership RLS', async () => {
  const migration = await read('supabase/migrations/20260802035124_initial_personal_os.sql')
  for (const table of ['accounts', 'transactions', 'subscriptions', 'quota_providers', 'quota_snapshots', 'notes']) {
    assert.match(migration, new RegExp(`create table public\\.${table}`))
    assert.match(migration, new RegExp(`'${table}'`))
  }
  assert.match(migration, /enable row level security/)
  assert.match(migration, /auth\.uid\(\)\) = user_id/)
  assert.match(migration, /amount_minor bigint/)
  assert.match(migration, /deleted_at timestamptz/)
  assert.match(migration, /transactions_external_ref_idx/)
  assert.match(migration, /enforce_owned_reference/)
  assert.match(migration, /quota_snapshots_provider_owner/)
  assert.match(migration, /subscriptions_payment_method_owner/)
})

test('frontend only accepts a publishable Supabase key', async () => {
  const exampleEnvironment = await read('.env.example')
  const client = await read('src/lib/supabase.ts')
  assert.match(exampleEnvironment, /VITE_SUPABASE_PUBLISHABLE_KEY/)
  assert.doesNotMatch(exampleEnvironment, /SERVICE_ROLE/i)
  assert.doesNotMatch(client, /service[_-]?role/i)
})

test('domain screens do not contain the original mock records', async () => {
  const screens = await Promise.all([
    read('src/features/dashboard/DashboardScreen.tsx'),
    read('src/features/finance/FinanceScreen.tsx'),
    read('src/features/subscriptions/SubscriptionsScreen.tsx'),
    read('src/features/quota/QuotaScreen.tsx'),
    read('src/features/ideas/IdeasScreen.tsx'),
  ])
  const source = screens.join('\n')
  for (const mockValue of ['42,850.24', 'Starbucks', 'Monthly Paycheck', 'Refactor Authentication Flow', '412 / 500']) {
    assert.doesNotMatch(source, new RegExp(mockValue.replace('.', '\\.')))
  }
})

test('Edge scanner uses explicit page access and never requests broad host permissions', async () => {
  const manifest = JSON.parse(await read('extension/manifest.json'))
  const scanner = await read('extension/popup.js')
  assert.deepEqual(manifest.permissions.sort(), ['activeTab', 'scripting', 'storage', 'tabs'])
  assert.equal(manifest.host_permissions, undefined)
  assert.doesNotMatch(scanner, /document\.cookie|password|<all_urls>/i)
  assert.match(scanner, /google_connected_apps/)
  assert.match(scanner, /provider_dashboard/)
  assert.match(scanner, /originalScrollTop/)
  assert.match(scanner, /stableEndPasses/)
  assert.match(scanner, /extractMoney/)
  assert.match(scanner, /scanGmailResults/)
  assert.match(scanner, /amountMinor/)
})

test('discovery migration stores only hashed extension credentials', async () => {
  const migration = await read('supabase/migrations/20260802045034_tool_discovery.sql')
  assert.match(migration, /token_hash text not null unique/)
  assert.match(migration, /code_hash text not null unique/)
  assert.doesNotMatch(migration, /refresh_token|access_token|password/i)
  assert.match(migration, /enable row level security/)
})

test('Gmail finance runs through scheduled Apps Script and stores raw email before parsing', async () => {
  const migration = await read('supabase/migrations/20260803090000_gmail_auto_ingest.sql')
  const edgeFunction = await read('supabase/functions/gmail-ingest/index.ts')
  const financeApi = await read('src/features/finance/finance.api.ts')
  const appsScript = await read('google-apps-script/Code.gs')
  const extensionIngest = await read('supabase/functions/extension-ingest/index.ts')
  assert.match(migration, /create table public\.gmail_ingest_credentials/)
  assert.match(migration, /configure_gmail_auto_sync/)
  assert.match(migration, /ensure_finance_defaults/)
  assert.match(migration, /enable row level security/)
  assert.match(edgeFunction, /from\("raw_ingests"\)\s*\.insert/)
  assert.match(edgeFunction, /hasPassingEmailAuthentication/)
  assert.match(edgeFunction, /sender === credential\.bca_sender/)
  assert.match(edgeFunction, /source_bank: parsed\.bank/)
  assert.match(appsScript, /everyDays\(1\)/)
  assert.match(appsScript, /function doGet\(\)/)
  assert.match(appsScript, /DEFAULT_SYNC_START_DATE = '2026\/01\/01'/)
  assert.doesNotMatch(appsScript, /everyMinutes\(5\)/)
  assert.match(appsScript, /getRawContent\(\)/)
  assert.match(appsScript, /PERSONAL_OS_SECRET/)
  assert.match(financeApi, /refetchInterval: 30_000/)
  assert.match(financeApi, /accounts!transactions_account_id_fkey/)
  assert.doesNotMatch(extensionIngest, /from\("finance_email_candidates"\)/)
})

test('Finance is an expense tracker with monthly targets and evidence links', async () => {
  const migration = await read('supabase/migrations/20260803110000_monthly_expense_tracking.sql')
  const financeScreen = await read('src/features/finance/FinanceScreen.tsx')
  const financeApi = await read('src/features/finance/finance.api.ts')
  assert.match(migration, /create table public\.monthly_expense_targets/)
  assert.match(migration, /enable row level security/)
  assert.match(migration, /categorize_finance_expense/)
  assert.match(migration, /apply_default_merchant_category/)
  assert.match(financeScreen, /Monthly spending target/)
  assert.match(financeScreen, /Needs category/)
  assert.match(financeScreen, /Open Gmail proof/)
  assert.doesNotMatch(financeScreen, /Total Balance|Income this month/)
  assert.match(financeApi, /eq\('direction', 'debit'\)/)
  assert.match(financeApi, /FINANCE_TRACKING_START = '2026-01-01'/)
})

test('Finance supports receipt OCR drafts, daily Gmail refresh, and automatic categories', async () => {
  const migration = await read('supabase/migrations/20260803150000_finance_daily_sync_categories_receipts.sql')
  const receiptOcr = await read('supabase/functions/receipt-ocr/index.ts')
  const financeScreen = await read('src/features/finance/FinanceScreen.tsx')
  assert.match(migration, /create table public\.finance_receipt_drafts/)
  assert.match(migration, /infer_finance_category/)
  assert.match(migration, /set_gmail_apps_script_url/)
  assert.match(migration, /2025-12-31 17:00:00\+00/)
  assert.match(receiptOcr, /GEMINI_API_KEY/)
  assert.match(receiptOcr, /responseSchema/)
  assert.match(receiptOcr, /finance-receipts/)
  assert.match(financeScreen, /capture="environment"/)
  assert.match(financeScreen, /Confirm receipt/)
  assert.match(financeScreen, /Sync now/)
})
