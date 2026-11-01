import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requireSupabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-context'

export const FINANCE_TRACKING_START = '2026-01-01'

export interface FinanceAccount {
  id: string
  name: string
  currency: string
}

export interface FinanceTransaction {
  id: string
  description: string
  amountMinor: number
  currency: string
  occurredAt: string
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  accountName: string
  source: 'email' | 'ocr' | 'manual' | 'import'
  confidence: number | null
  gmailEvidenceUrl: string | null
  attachmentCount: number
}

export interface FinanceEmailCandidate {
  id: string
  merchantName: string
  sender: string | null
  subject: string
  excerpt: string | null
  occurredAt: string | null
  direction: 'debit' | 'credit' | 'transfer' | null
  amountMinor: number | null
  currency: string | null
  paymentHint: string | null
  confidence: number
  createdAt: string
  bank: string | null
  counterpartAccountName: string | null
  reviewReason: string | null
}

export interface GmailAutoSyncStatus {
  configured: boolean
  bcaSender: string | null
  bsiSender: string | null
  labelName: string
  lastReceivedAt: string | null
  lastSuccessAt: string | null
  lastError: string | null
  appsScriptUrl: string | null
}

export interface FinanceReceiptDraft {
  id: string
  merchantName: string | null
  totalMinor: number | null
  currency: string | null
  occurredAt: string | null
  accountHint: string | null
  categoryHint: string | null
  confidence: Record<string, number>
  status: 'pending' | 'needs_review' | 'failed'
  errorMessage: string | null
  createdAt: string
}

export interface MonthlyExpenseTarget {
  monthStart: string
  amountMinor: number
  currency: string
}

export interface FinanceData {
  accounts: FinanceAccount[]
  categories: Array<{ id: string; name: string; icon: string | null }>
  transactions: FinanceTransaction[]
  uncategorizedTransactions: FinanceTransaction[]
  uncategorizedCount: number
  overview: FinanceOverview
  emailCandidates: FinanceEmailCandidate[]
  monthlyTargets: MonthlyExpenseTarget[]
  gmailSync: GmailAutoSyncStatus
  receiptDrafts: FinanceReceiptDraft[]
}

export interface FinanceOverview {
  monthSpentMinor: number
  monthRecordCount: number
  categorySpending: Array<{ name: string; icon: string | null; amountMinor: number }>
  accountSpending: Array<{ name: string; amountMinor: number }>
  monthlyTrend: Array<{ month: string; amountMinor: number }>
}

export interface ExpenseInput {
  description: string
  amountMinor: number
  currency: string
  occurredAt: string
  accountId: string
  categoryId: string
}

export interface FinanceCandidateApprovalInput {
  candidateId: string
  accountId: string
  counterpartAccountId: string | null
  categoryId: string | null
  description: string
  direction: 'debit' | 'credit' | 'transfer'
  amountMinor: number
  currency: string
  occurredAt: string
}

interface TransactionRow {
  id: string
  description: string
  amount_minor: number
  currency: string
  occurred_at: string
  category_id: string | null
  accounts: { name: string } | Array<{ name: string }> | null
  categories: { name: string; icon: string | null } | Array<{ name: string; icon: string | null }> | null
  raw_ingests: { raw_payload: Record<string, unknown> } | Array<{ raw_payload: Record<string, unknown> }> | null
  attachments: Array<{ id: string }> | null
  source: 'email' | 'ocr' | 'manual' | 'import'
  confidence: number | null
}

interface FinanceEmailCandidateRow {
  id: string
  merchant_name: string
  sender: string | null
  subject: string
  excerpt: string | null
  occurred_at: string | null
  direction: 'debit' | 'credit' | 'transfer' | null
  amount_minor: number | null
  currency: string | null
  payment_hint: string | null
  confidence: number
  created_at: string
  metadata: Record<string, unknown> | null
}

interface GmailAutoSyncStatusRow {
  configured: boolean
  bca_sender: string | null
  bsi_sender: string | null
  label_name: string
  last_received_at: string | null
  last_success_at: string | null
  last_error: string | null
  apps_script_url: string | null
}

interface FinanceReceiptDraftRow {
  id: string
  merchant_name: string | null
  total_minor: number | null
  currency: string | null
  occurred_at: string | null
  account_hint: string | null
  category_hint: string | null
  field_confidence: Record<string, number> | null
  status: 'pending' | 'needs_review' | 'failed'
  error_message: string | null
  created_at: string
}

interface FinanceOverviewRow {
  monthSpentMinor?: number | string
  monthRecordCount?: number | string
  categorySpending?: Array<{ name: string; icon: string | null; amountMinor: number | string }>
  accountSpending?: Array<{ name: string; amountMinor: number | string }>
  monthlyTrend?: Array<{ month: string; amountMinor: number | string }>
}

export const financeKeys = {
  root: (userId: string) => ['finance', userId] as const,
  all: (userId: string, month: string) => ['finance', userId, month] as const,
  search: (userId: string, query: string) => ['finance-search', userId, query] as const,
}

export async function fetchFinanceData(selectedMonth: string): Promise<FinanceData> {
  const client = requireSupabase()
  const { error: defaultsError } = await client.rpc('ensure_finance_defaults')
  if (defaultsError) throw defaultsError
  const { start, end } = monthBounds(selectedMonth)

  const [accountsResult, categoriesResult, transactionsResult, uncategorizedResult, overviewResult, candidatesResult, targetsResult, gmailSyncResult, receiptDraftsResult] = await Promise.all([
    client.from('accounts').select('id,name,currency').is('deleted_at', null).order('name'),
    client.from('categories').select('id,name,icon').eq('category_type', 'expense').is('deleted_at', null).order('name'),
    transactionQuery(client).gte('occurred_at', start).lt('occurred_at', end).order('occurred_at', { ascending: false }).limit(8),
    transactionQuery(client, { count: 'exact' }).is('category_id', null).gte('occurred_at', '2025-12-31T17:00:00.000Z').order('occurred_at', { ascending: false }).limit(50),
    client.rpc('get_finance_overview', { target_month: selectedMonth }),
    client.from('finance_email_candidates').select('id,merchant_name,sender,subject,excerpt,occurred_at,direction,amount_minor,currency,payment_hint,confidence,created_at,metadata').is('deleted_at', null).eq('status', 'pending').order('occurred_at', { ascending: false, nullsFirst: false }).limit(200),
    client.from('monthly_expense_targets').select('month_start,amount_minor,currency').gte('month_start', FINANCE_TRACKING_START).is('deleted_at', null).order('month_start'),
    client.rpc('get_gmail_auto_sync_status'),
    client.from('finance_receipt_drafts').select('id,merchant_name,total_minor,currency,occurred_at,account_hint,category_hint,field_confidence,status,error_message,created_at').is('deleted_at', null).in('status', ['pending', 'needs_review', 'failed']).order('created_at', { ascending: false }).limit(20),
  ])

  for (const result of [accountsResult, categoriesResult, transactionsResult, uncategorizedResult, overviewResult, candidatesResult, targetsResult, gmailSyncResult, receiptDraftsResult]) {
    if (result.error) throw result.error
  }

  const overview = (overviewResult.data ?? {}) as FinanceOverviewRow

  return {
    accounts: (accountsResult.data ?? []).map((account) => ({ id: account.id, name: account.name, currency: account.currency })),
    categories: (categoriesResult.data ?? []).map((category) => ({ id: category.id, name: category.name, icon: category.icon })),
    transactions: mapTransactionRows(transactionsResult.data as TransactionRow[] | null),
    uncategorizedTransactions: mapTransactionRows(uncategorizedResult.data as TransactionRow[] | null),
    uncategorizedCount: uncategorizedResult.count ?? 0,
    overview: {
      monthSpentMinor: Number(overview.monthSpentMinor ?? 0),
      monthRecordCount: Number(overview.monthRecordCount ?? 0),
      categorySpending: (overview.categorySpending ?? []).map((item) => ({ ...item, amountMinor: Number(item.amountMinor) })),
      accountSpending: (overview.accountSpending ?? []).map((item) => ({ ...item, amountMinor: Number(item.amountMinor) })),
      monthlyTrend: (overview.monthlyTrend ?? []).map((item) => ({ ...item, amountMinor: Number(item.amountMinor) })),
    },
    emailCandidates: ((candidatesResult.data ?? []) as FinanceEmailCandidateRow[]).map((candidate) => ({
      id: candidate.id,
      merchantName: candidate.merchant_name,
      sender: candidate.sender,
      subject: candidate.subject,
      excerpt: candidate.excerpt,
      occurredAt: candidate.occurred_at,
      direction: candidate.direction,
      amountMinor: candidate.amount_minor === null ? null : Number(candidate.amount_minor),
      currency: candidate.currency,
      paymentHint: candidate.payment_hint,
      confidence: Number(candidate.confidence),
      createdAt: candidate.created_at,
      bank: typeof candidate.metadata?.bank === 'string' ? candidate.metadata.bank : null,
      counterpartAccountName: typeof candidate.metadata?.counterpart_account_name === 'string' ? candidate.metadata.counterpart_account_name : null,
      reviewReason: typeof candidate.metadata?.reason === 'string' ? candidate.metadata.reason : null,
    })),
    monthlyTargets: (targetsResult.data ?? []).map((target) => ({
      monthStart: target.month_start,
      amountMinor: Number(target.amount_minor),
      currency: target.currency,
    })),
    gmailSync: (() => {
      const row = ((gmailSyncResult.data ?? []) as GmailAutoSyncStatusRow[])[0]
      return {
        configured: row?.configured ?? false,
        bcaSender: row?.bca_sender ?? null,
        bsiSender: row?.bsi_sender ?? null,
        labelName: row?.label_name ?? 'PersonalOS/Bank',
        lastReceivedAt: row?.last_received_at ?? null,
        lastSuccessAt: row?.last_success_at ?? null,
        lastError: row?.last_error ?? null,
        appsScriptUrl: row?.apps_script_url ?? null,
      }
    })(),
    receiptDrafts: ((receiptDraftsResult.data ?? []) as FinanceReceiptDraftRow[]).map((draft) => ({
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
    })),
  }
}

function transactionQuery(client: ReturnType<typeof requireSupabase>, options?: { count: 'exact' }) {
  return client
    .from('transactions')
    .select('id,description,amount_minor,currency,occurred_at,category_id,source,confidence,accounts:accounts!transactions_account_id_fkey(name),categories:categories!transactions_category_id_fkey(name,icon),raw_ingests:raw_ingests!transactions_raw_ingest_id_fkey(raw_payload),attachments(id)', options)
    .eq('direction', 'debit')
    .is('deleted_at', null)
    .in('status', ['confirmed', 'reconciled'])
}

function mapTransactionRows(rows: TransactionRow[] | null): FinanceTransaction[] {
  return (rows ?? []).map((row) => {
    const account = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories
    const rawIngest = Array.isArray(row.raw_ingests) ? row.raw_ingests[0] : row.raw_ingests
    const threadId = typeof rawIngest?.raw_payload?.gmail_thread_id === 'string' ? rawIngest.raw_payload.gmail_thread_id : null
    return {
      id: row.id,
      description: row.description,
      amountMinor: Number(row.amount_minor),
      currency: row.currency,
      occurredAt: row.occurred_at,
      categoryId: row.category_id,
      categoryName: category?.name ?? null,
      categoryIcon: category?.icon ?? null,
      accountName: account?.name ?? 'Unknown source',
      source: row.source,
      confidence: row.confidence === null ? null : Number(row.confidence),
      gmailEvidenceUrl: threadId ? `https://mail.google.com/mail/#all/${encodeURIComponent(threadId)}` : null,
      attachmentCount: row.attachments?.length ?? 0,
    }
  })
}

function monthBounds(month: string) {
  const start = new Date(`${month}-01T00:00:00+07:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

async function configureGmailAutoSync(input: { bcaSender: string | null; bsiSender: string | null }) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('configure_gmail_auto_sync', {
    exact_bca_sender: input.bcaSender?.trim() || null,
    exact_bsi_sender: input.bsiSender?.trim() || null,
  })
  if (error) throw error
  const result = (data as Array<{ secret: string; endpoint_label: string }> | null)?.[0]
  if (!result?.secret) throw new Error('Gmail auto-sync secret was not generated')
  return { secret: result.secret, labelName: result.endpoint_label }
}

async function createExpense(userId: string, input: ExpenseInput): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('transactions').insert({
    user_id: userId,
    description: input.description.trim(),
    direction: 'debit',
    amount_minor: input.amountMinor,
    currency: input.currency.toUpperCase(),
    occurred_at: input.occurredAt,
    account_id: input.accountId,
    category_id: input.categoryId,
    status: 'confirmed',
    source: 'manual',
  })
  if (error) throw error
}

async function approveFinanceCandidate(input: FinanceCandidateApprovalInput): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.rpc('approve_finance_email_candidate', {
    candidate_id: input.candidateId,
    target_account_id: input.accountId,
    target_counterpart_account_id: input.counterpartAccountId,
    target_category_id: input.categoryId,
    resolved_description: input.description.trim(),
    resolved_direction: input.direction,
    resolved_amount_minor: input.amountMinor,
    resolved_currency: input.currency.toUpperCase(),
    resolved_occurred_at: input.occurredAt,
  })
  if (error) throw error
}

async function rejectFinanceCandidate(candidateId: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('finance_email_candidates').update({ status: 'rejected' }).eq('id', candidateId).eq('status', 'pending')
  if (error) throw error
}

export function useFinanceData(selectedMonth = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(new Date())) {
  const { user } = useAuth()
  return useQuery({
    queryKey: financeKeys.all(user?.id ?? 'anonymous', selectedMonth),
    queryFn: () => fetchFinanceData(selectedMonth),
    enabled: Boolean(user),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useExpenseSearch(query: string) {
  const { user } = useAuth()
  const normalized = query.trim()
  return useQuery({
    queryKey: financeKeys.search(user?.id ?? 'anonymous', normalized),
    enabled: Boolean(user) && normalized.length >= 2,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await transactionQuery(requireSupabase())
        .gte('occurred_at', '2025-12-31T17:00:00.000Z')
        .ilike('description', `%${normalized}%`)
        .order('occurred_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return mapTransactionRows(data as TransactionRow[] | null)
    },
  })
}

function useFinanceMutation<T, TResult>(mutationFn: (input: T, userId: string) => Promise<TResult>) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: T) => {
      if (!user) throw new Error('You must be signed in')
      return mutationFn(input, user.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.root(user?.id ?? 'anonymous') })
      void queryClient.invalidateQueries({ queryKey: ['finance-search', user?.id ?? 'anonymous'] })
    },
  })
}

export function useCreateExpense() {
  return useFinanceMutation((input: ExpenseInput, userId) => createExpense(userId, input))
}

export function useSetMonthlyExpenseTarget() {
  return useFinanceMutation(async (input: { monthStart: string; amountMinor: number; currency: string }) => {
    const { error } = await requireSupabase().rpc('set_monthly_expense_target', {
      target_month: input.monthStart,
      target_amount_minor: input.amountMinor,
      target_currency: input.currency,
    })
    if (error) throw error
  })
}

export function useCategorizeExpense() {
  return useFinanceMutation(async (input: { transactionId: string; categoryId: string; rememberMerchant: boolean }) => {
    const { error } = await requireSupabase().rpc('categorize_finance_expense', {
      target_transaction_id: input.transactionId,
      target_category_id: input.categoryId,
      remember_merchant: input.rememberMerchant,
    })
    if (error) throw error
  })
}

export function useConfigureGmailAutoSync() {
  return useFinanceMutation((input: { bcaSender: string | null; bsiSender: string | null }) => configureGmailAutoSync(input))
}

export function useSetGmailAppsScriptUrl() {
  return useFinanceMutation(async (appsScriptUrl: string) => {
    const { error } = await requireSupabase().rpc('set_gmail_apps_script_url', { target_url: appsScriptUrl.trim() || null })
    if (error) throw error
  })
}

export function useScanReceipt() {
  return useFinanceMutation(async (input: { imageBase64: string; mimeType: string; contentHash: string }) => {
    const { data, error } = await requireSupabase().functions.invoke<{ draft: FinanceReceiptDraft; duplicate: boolean }>('receipt-ocr', { body: input })
    if (error) throw error
    if (!data?.draft) throw new Error('Receipt OCR did not return a draft')
    return data
  })
}

export function useConfirmReceiptDraft() {
  return useFinanceMutation(async (input: {
    draftId: string
    accountId: string
    categoryId: string
    description: string
    amountMinor: number
    currency: string
    occurredAt: string
    rememberMerchant: boolean
  }) => {
    const { error } = await requireSupabase().rpc('confirm_finance_receipt_draft', {
      target_draft_id: input.draftId,
      target_account_id: input.accountId,
      target_category_id: input.categoryId,
      resolved_description: input.description.trim(),
      resolved_amount_minor: input.amountMinor,
      resolved_currency: input.currency.toUpperCase(),
      resolved_occurred_at: input.occurredAt,
      remember_merchant: input.rememberMerchant,
    })
    if (error) throw error
  })
}

export function useDeleteReceiptDraft() {
  return useFinanceMutation(async (draftId: string) => {
    const { data, error } = await requireSupabase().functions.invoke<{ deleted: boolean }>('receipt-ocr', {
      body: { action: 'delete', draftId },
    })
    if (error) throw error
    if (!data?.deleted) throw new Error('Receipt draft could not be deleted')
  })
}

export function useApproveFinanceCandidate() {
  return useFinanceMutation((input: FinanceCandidateApprovalInput) => approveFinanceCandidate(input))
}

export function useRejectFinanceCandidate() {
  return useFinanceMutation((candidateId: string) => rejectFinanceCandidate(candidateId))
}
