import { type FormEvent, type ReactNode, useDeferredValue, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { QueryFeedback } from '@/components/ui/QueryFeedback'
import { formatCompactMoney, formatMoney, formatRelativeTime } from '@/lib/format'
import {
  type ExpenseInput,
  type FinanceCandidateApprovalInput,
  type FinanceEmailCandidate,
  type FinanceReceiptDraft,
  type FinanceTransaction,
  FINANCE_TRACKING_START,
  useApproveFinanceCandidate,
  useCategorizeExpense,
  useConfirmReceiptDraft,
  useConfigureGmailAutoSync,
  useCreateExpense,
  useDeleteReceiptDraft,
  useExpenseSearch,
  useFinanceData,
  useRejectFinanceCandidate,
  useScanReceipt,
  useSetGmailAppsScriptUrl,
  useSetMonthlyExpenseTarget,
} from './finance.api'

const gmailIngestEndpoint = 'https://xmflqzqesgvbzyuucoxg.supabase.co/functions/v1/gmail-ingest'
const jakartaMonthFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' })

export function FinanceScreen() {
  const [selectedMonth, setSelectedMonth] = useState(() => jakartaMonthFormatter.format(new Date()))
  const financeQuery = useFinanceData(selectedMonth)
  const finance = financeQuery.data
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showReceiptCapture, setShowReceiptCapture] = useState(false)
  const [showTargetForm, setShowTargetForm] = useState(false)
  const [showGmailSetup, setShowGmailSetup] = useState(false)
  const [reviewCandidate, setReviewCandidate] = useState<FinanceEmailCandidate | null>(null)
  const [categorizeExpense, setCategorizeExpense] = useState<FinanceTransaction | null>(null)
  const [receiptDraft, setReceiptDraft] = useState<FinanceReceiptDraft | null>(null)
  const [deleteReceiptDraft, setDeleteReceiptDraft] = useState<FinanceReceiptDraft | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)
  const [syncFailed, setSyncFailed] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const deferredHistorySearch = useDeferredValue(historySearch.trim())
  const expenseSearch = useExpenseSearch(deferredHistorySearch)
  const rejectCandidate = useRejectFinanceCandidate()

  const selectedExpenses = finance?.transactions ?? []
  const displayedExpenses = deferredHistorySearch.length >= 2 ? expenseSearch.data ?? [] : selectedExpenses
  const target = finance?.monthlyTargets.find((item) => item.monthStart.startsWith(selectedMonth))
  const currency = target?.currency ?? selectedExpenses[0]?.currency ?? 'IDR'
  const spentMinor = finance?.overview.monthSpentMinor ?? 0
  const remainingMinor = target ? target.amountMinor - spentMinor : null
  const progress = target ? Math.min(100, (spentMinor / target.amountMinor) * 100) : 0
  const uncategorized = finance?.uncategorizedTransactions ?? []
  const categories = finance?.overview.categorySpending ?? []
  const accounts = finance?.overview.accountSpending ?? []
  const maxCategoryAmount = Math.max(1, ...categories.map((item) => item.amountMinor))
  const spendingPoints = buildSpendingPoints(finance?.overview.monthlyTrend ?? [])
  const gmailReady = Boolean(finance?.gmailSync.configured && finance.gmailSync.appsScriptUrl)

  async function runFinanceRefresh() {
    if (!finance?.gmailSync.appsScriptUrl) return setShowGmailSetup(true)
    setSyncFeedback(null)
    setSyncFailed(false)
    setIsRefreshing(true)
    try {
      const triggerUrl = new URL(finance.gmailSync.appsScriptUrl)
      triggerUrl.searchParams.set('action', 'sync')
      triggerUrl.searchParams.set('format', 'json')
      await fetch(triggerUrl, { method: 'GET', mode: 'no-cors', cache: 'no-store' })
      await financeQuery.refetch()
      setSyncFeedback('Refresh finished in the background. New matching bank transactions are now shown.')
      window.setTimeout(() => setSyncFeedback(null), 20000)
    } catch (cause) {
      setSyncFailed(true)
      setSyncFeedback(cause instanceof Error ? cause.message : 'Finance refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="page finance-page">
      <header className="finance-hero expense-hero">
        <div className="finance-topline">
          <h1 className="sr-only">Finance</h1>
          <label className="month-picker" aria-label="Expense month"><input min={FINANCE_TRACKING_START.slice(0, 7)} onChange={(event) => setSelectedMonth(event.target.value)} type="month" value={selectedMonth} /></label>
        </div>
        <p className="balance-label">Monthly spending target</p>
        <p className={`balance-value ${remainingMinor !== null && remainingMinor < 0 ? 'budget-over' : ''}`}>
          {financeQuery.isPending ? '…' : target ? `${formatMoney(Math.abs(remainingMinor ?? 0), currency)} ${remainingMinor !== null && remainingMinor < 0 ? 'over' : 'left'}` : 'Target not set'}
        </p>
        <div className="budget-progress"><ProgressBar label="Monthly spending target usage" value={progress} /></div>
        <div className="balance-summary expense-summary">
          <div><span className="trend-dot expense"><Icon name="payments" size={18} /></span><span><small>Spent this month</small><strong>{formatCompactMoney(spentMinor, currency)}</strong></span></div>
          <div><span className="trend-dot target"><Icon name="flag" size={18} /></span><span><small>Monthly limit</small><strong>{target ? formatCompactMoney(target.amountMinor, target.currency) : 'Set a target'}</strong></span></div>
        </div>
      </header>

      <div className="finance-primary-actions">
        <button className="primary-action" disabled={!finance?.accounts.length} onClick={() => setShowReceiptCapture(true)} type="button"><Icon name="photo_camera" /> Scan receipt</button>
        <button className="secondary-button target-button" disabled={!finance?.accounts.length} onClick={() => setShowExpenseForm(true)} type="button"><Icon name="edit_note" size={18} /> Manual entry</button>
        <button className="secondary-button target-button" onClick={() => setShowTargetForm(true)} type="button"><Icon name="edit" size={18} /> {target ? 'Edit target' : 'Set target'}</button>
      </div>

      {financeQuery.isError ? <QueryFeedback actionLabel="Try again" message={financeQuery.error.message} onAction={() => void financeQuery.refetch()} title="Expense data could not be loaded" tone="error" /> : null}

      <section className="surface-card gmail-sync-card">
        <div className="gmail-sync-summary">
          <span className={`source-mark ${finance?.gmailSync.configured ? 'gmail-sync-active' : 'gmail'}`}><Icon name={finance?.gmailSync.configured ? 'sync' : 'mail'} size={21} /></span>
          <div>
            <div className="gmail-sync-title"><span className="card-label">Bank email import</span><span className={`status-pill ${gmailReady ? 'active' : 'unknown'}`}>{gmailReady ? 'Ready' : finance?.gmailSync.configured ? 'Finish setup' : 'Setup required'}</span></div>
            <p className="metric-caption">{finance?.gmailSync.lastSuccessAt ? `Last imported ${formatRelativeTime(finance.gmailSync.lastSuccessAt)} · automatic check once daily` : 'Connect Gmail to import BCA, BSI, Shopee, GoPay, and Grab finance notifications.'}</p>
            {!gmailReady && finance?.gmailSync.configured ? <p className="gmail-sync-hint">Save the deployed Apps Script /exec URL to enable manual refresh.</p> : null}
            {finance?.gmailSync.lastError ? <p className="form-error" role="status">{finance.gmailSync.lastError}</p> : null}
            {syncFeedback ? <p className={syncFailed ? 'form-error' : 'form-success'} role="status">{syncFeedback}</p> : null}
          </div>
        </div>
        <div className="gmail-sync-actions"><button className="secondary-button compact" disabled={!finance?.gmailSync.configured || isRefreshing} onClick={() => void runFinanceRefresh()} type="button"><Icon name="refresh" size={17} /> {isRefreshing ? 'Refreshing…' : gmailReady ? 'Refresh' : 'Finish setup'}</button><button className="secondary-button compact" onClick={() => setShowGmailSetup(true)} type="button">Sync settings</button></div>
      </section>

      {finance?.receiptDrafts.length ? (
        <section className="surface-card finance-inbox-card">
          <div className="card-heading-row"><div><span className="card-label">Receipt drafts</span><p className="metric-caption">Confirm OCR fields before they become expenses</p></div><span className="status-pill unknown">{finance.receiptDrafts.length}</span></div>
          <div className="finance-candidate-list">{finance.receiptDrafts.map((draft) => <ReceiptDraftRow draft={draft} key={draft.id} onDelete={() => setDeleteReceiptDraft(draft)} onReview={() => setReceiptDraft(draft)} />)}</div>
        </section>
      ) : null}

      {uncategorized.length ? (
        <section className="surface-card finance-inbox-card">
          <div className="card-heading-row"><div><span className="card-label">Needs category</span><p className="metric-caption">Categorize once and reuse it for the same merchant</p></div><span className="status-pill unknown">{finance?.uncategorizedCount ?? uncategorized.length}</span></div>
          <div className="finance-candidate-list">
            {uncategorized.map((transaction) => <ExpenseRow key={transaction.id} onCategorize={() => setCategorizeExpense(transaction)} transaction={transaction} />)}
          </div>
        </section>
      ) : null}

      {finance?.emailCandidates.length ? (
        <section className="surface-card finance-inbox-card">
          <div className="card-heading-row"><div><span className="card-label">Needs transaction review</span><p className="metric-caption">Incomplete, unusual, or unreconciled finance emails appear here</p></div><span className="status-pill unknown">{finance.emailCandidates.length}</span></div>
          <div className="finance-candidate-list">
            {finance.emailCandidates.map((candidate) => (
              <article className="finance-candidate-row" key={candidate.id}>
                <span className="transaction-icon"><Icon name={candidate.direction === 'transfer' ? 'swap_horiz' : 'receipt_long'} size={20} /></span>
                <span className="finance-candidate-copy"><strong>{candidate.merchantName}</strong><small>{candidate.reviewReason ?? candidate.subject}</small><small>{candidate.sender ?? 'Gmail finance email'} · {Math.round(candidate.confidence * 100)}% confidence</small></span>
                <strong className="amount-negative">{candidate.amountMinor !== null && candidate.currency ? formatMoney(candidate.amountMinor, candidate.currency) : 'Amount needed'}</strong>
                <span className="finance-candidate-actions"><button className="secondary-button compact" onClick={() => setReviewCandidate(candidate)} type="button">Review</button><button aria-label={`Ignore ${candidate.subject}`} className="icon-button" disabled={rejectCandidate.isPending} onClick={() => rejectCandidate.mutate(candidate.id)} type="button"><Icon name="close" size={18} /></button></span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="finance-grid expense-grid">
        <article className="surface-card categories-card">
          <div className="card-heading-row"><span className="card-label">Spending by category</span><span className="metric-caption">{displayMonth(selectedMonth)}</span></div>
          <div className="category-list">
            {categories.map((category) => <div className="category-row" key={category.name}><span className="category-icon"><Icon name={category.icon ?? 'category'} size={20} /></span><div><div className="row-between"><strong>{category.name}</strong><strong>{formatMoney(category.amountMinor, currency)}</strong></div><ProgressBar label={`${category.name} spending`} value={(category.amountMinor / maxCategoryAmount) * 100} /></div></div>)}
            {!categories.length ? <p className="card-empty-copy">No expenses in this month.</p> : null}
          </div>
        </article>

        <article className="surface-card cashflow-card">
          <div className="card-heading-row"><div><span className="card-label">Monthly spending trend</span><p className="metric-caption">Expenses only · transfers excluded</p></div></div>
          {spendingPoints ? <svg aria-label="Expense trend since January" className="cashflow-chart" role="img" viewBox="0 0 620 220"><g className="chart-grid"><path d="M36 24H602M36 76H602M36 128H602M36 180H602" /></g><polyline fill="none" points={spendingPoints.points} stroke="#4d89ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />{spendingPoints.labels.map((label, index) => <text key={`${label}-${index}`} textAnchor="middle" x={spendingPoints.x[index]} y="210">{label}</text>)}</svg> : <div className="chart-empty large">Monthly history appears after expenses are recorded.</div>}
        </article>

        <article className="surface-card account-spending-card">
          <div className="card-heading-row"><span className="card-label">Spent from</span><span className="metric-caption">Payment source</span></div>
          <div className="account-balance-list">{accounts.map((account) => <div className="row-between" key={account.name}><span>{account.name}</span><strong>{formatMoney(account.amountMinor, currency)}</strong></div>)}{!accounts.length ? <p className="card-empty-copy">No payment sources used this month.</p> : null}</div>
        </article>

        <article className="surface-card transactions-card">
          <div className="card-heading-row history-heading"><div><span className="card-label">Expense history</span><p className="metric-caption">Latest 8 for {displayMonth(selectedMonth)} · search covers all records since 2026</p></div><span className="metric-caption">{deferredHistorySearch.length >= 2 ? `${displayedExpenses.length} results` : `${selectedExpenses.length} of ${finance?.overview.monthRecordCount ?? 0}`}</span></div>
          <label className="expense-search-field"><span className="sr-only">Search all expense history</span><Icon name="search" size={20} /><input autoComplete="off" onChange={(event) => setHistorySearch(event.target.value)} placeholder="Search merchant, for example Mirota" type="search" value={historySearch} />{historySearch ? <button aria-label="Clear expense search" className="icon-button small" onClick={() => setHistorySearch('')} type="button"><Icon name="close" size={18} /></button> : null}</label>
          {expenseSearch.isFetching ? <p className="history-search-status" role="status">Searching all expense records…</p> : null}
          {expenseSearch.isError ? <p className="form-error" role="alert">Search failed. Please try again.</p> : null}
          <div className="transaction-list">{displayedExpenses.map((transaction) => <ExpenseRow key={transaction.id} onCategorize={!transaction.categoryId ? () => setCategorizeExpense(transaction) : undefined} transaction={transaction} />)}{!displayedExpenses.length && !expenseSearch.isFetching ? <p className="card-empty-copy transaction-empty">{deferredHistorySearch.length >= 2 ? 'No matching expenses found since January 2026.' : 'No expenses recorded for this month.'}</p> : null}</div>
        </article>
      </section>

      {showExpenseForm && finance ? <ExpenseDialog finance={finance} onClose={() => setShowExpenseForm(false)} /> : null}
      {showReceiptCapture && finance ? <ReceiptCaptureDialog finance={finance} onClose={() => setShowReceiptCapture(false)} /> : null}
      {receiptDraft && finance ? <ReceiptCaptureDialog finance={finance} initialDraft={receiptDraft} onClose={() => setReceiptDraft(null)} /> : null}
      {deleteReceiptDraft ? <DeleteReceiptDraftDialog draft={deleteReceiptDraft} onClose={() => setDeleteReceiptDraft(null)} /> : null}
      {showTargetForm ? <TargetDialog currency={currency} month={selectedMonth} onClose={() => setShowTargetForm(false)} targetMinor={target?.amountMinor ?? null} /> : null}
      {showGmailSetup && finance ? <GmailAutoSyncDialog finance={finance} onClose={() => setShowGmailSetup(false)} /> : null}
      {reviewCandidate && finance ? <FinanceCandidateDialog candidate={reviewCandidate} finance={finance} onClose={() => setReviewCandidate(null)} /> : null}
      {categorizeExpense && finance ? <CategoryDialog categories={finance.categories} onClose={() => setCategorizeExpense(null)} transaction={categorizeExpense} /> : null}
    </div>
  )
}

function ExpenseRow({ onCategorize, transaction }: { onCategorize?: () => void; transaction: FinanceTransaction }) {
  return <div className="transaction-row"><span className="transaction-icon"><Icon name={transaction.categoryIcon ?? 'receipt_long'} size={20} /></span><span><strong>{transaction.description}</strong><small>{transaction.categoryName ?? 'Uncategorized'} · {transaction.accountName} · {formatRelativeTime(transaction.occurredAt)}</small><span className="evidence-actions">{transaction.gmailEvidenceUrl ? <a href={transaction.gmailEvidenceUrl} rel="noreferrer" target="_blank"><Icon name="mail" size={14} /> Open Gmail proof</a> : null}{transaction.attachmentCount ? <span><Icon name="attachment" size={14} /> {transaction.attachmentCount} file</span> : null}{onCategorize ? <button onClick={onCategorize} type="button">Categorize</button> : null}</span></span><strong className="amount-negative">{formatMoney(transaction.amountMinor, transaction.currency)}</strong></div>
}

function ReceiptDraftRow({ draft, onDelete, onReview }: { draft: FinanceReceiptDraft; onDelete: () => void; onReview: () => void }) {
  return <article className="finance-candidate-row"><span className="transaction-icon"><Icon name="document_scanner" size={20} /></span><span><strong>{draft.merchantName ?? 'Receipt needs review'}</strong><small>{draft.errorMessage ?? `Scanned ${formatRelativeTime(draft.createdAt)}`}</small></span><strong>{draft.totalMinor && draft.currency ? formatMoney(draft.totalMinor, draft.currency) : '—'}</strong><span className="finance-candidate-actions"><button className="secondary-button compact" onClick={onReview} type="button">Review</button><button aria-label={`Delete ${draft.merchantName ?? 'receipt draft'}`} className="icon-button danger-icon-button" onClick={onDelete} type="button"><Icon name="delete" size={19} /></button></span></article>
}

function DeleteReceiptDraftDialog({ draft, onClose }: { draft: FinanceReceiptDraft; onClose: () => void }) {
  const mutation = useDeleteReceiptDraft()
  const [error, setError] = useState<string | null>(null)
  async function handleDelete() {
    try {
      await mutation.mutateAsync(draft.id)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Receipt draft could not be deleted')
    }
  }
  return <DialogFrame eyebrow="Delete receipt draft" onClose={onClose} title="Remove this scanned receipt?"><div className="delete-confirm-copy"><p><strong>{draft.merchantName ?? 'Unnamed receipt'}</strong> will be removed together with its private uploaded image.</p><p>This does not affect confirmed expenses.</p></div>{error ? <p className="form-error" role="alert">{error}</p> : null}<footer><span /><div><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="danger-button" disabled={mutation.isPending} onClick={() => void handleDelete()} type="button">{mutation.isPending ? 'Deleting…' : 'Delete draft'}</button></div></footer></DialogFrame>
}

function ReceiptCaptureDialog({ finance, initialDraft = null, onClose }: { finance: NonNullable<ReturnType<typeof useFinanceData>['data']>; initialDraft?: FinanceReceiptDraft | null; onClose: () => void }) {
  const scanMutation = useScanReceipt()
  const [draft, setDraft] = useState<FinanceReceiptDraft | null>(initialDraft)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !cameraStream) return undefined
    video.srcObject = cameraStream
    void video.play()
    return () => { video.srcObject = null }
  }, [cameraStream])

  useEffect(() => () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
  }, [cameraStream])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function stopCamera() {
    setCameraStream((stream) => {
      stream?.getTracks().forEach((track) => track.stop())
      return null
    })
  }

  async function startCamera() {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) return setError('This browser cannot open a live camera. Use Choose existing image instead.')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } })
      setCameraStream(stream)
    } catch (cause) {
      setError(cameraErrorMessage(cause))
    }
  }

  async function captureCamera() {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) return setError('The camera is not ready yet. Wait a moment and try again.')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return setError('The camera image could not be prepared.')
    context.drawImage(video, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('The camera image could not be captured')), 'image/jpeg', .92))
    stopCamera()
    await handleImage(new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' }))
  }

  async function handleImage(file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      const prepared = await prepareReceiptImage(file)
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return prepared.previewUrl
      })
      const result = await scanMutation.mutateAsync(prepared.payload)
      setDraft(result.draft)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Receipt could not be scanned')
    }
  }

  function closeDialog() {
    stopCamera()
    onClose()
  }

  return <DialogFrame eyebrow="Camera receipt capture" onClose={closeDialog} title={draft ? 'Confirm receipt' : 'Scan a receipt'}>{draft ? <ReceiptConfirmForm draft={draft} finance={finance} onClose={closeDialog} previewUrl={previewUrl} /> : <div className="receipt-capture-flow">{cameraStream ? <div className="receipt-live-camera"><video aria-label="Live receipt camera" autoPlay muted playsInline ref={videoRef} /><div className="receipt-camera-actions"><button className="primary-action" disabled={scanMutation.isPending} onClick={() => void captureCamera()} type="button"><Icon name="photo_camera" /> Capture receipt</button><button className="secondary-button" onClick={stopCamera} type="button">Close camera</button></div></div> : <>{previewUrl ? <img alt="Receipt preview" className="receipt-preview" src={previewUrl} /> : <div className="receipt-camera-placeholder"><Icon name="photo_camera" size={44} /><strong>Photograph the full receipt</strong><p>Keep the total and date readable. The image is compressed before upload.</p></div>}<button className={`primary-action receipt-camera-button ${scanMutation.isPending ? 'disabled' : ''}`} disabled={scanMutation.isPending} onClick={() => void startCamera()} type="button"><Icon name="photo_camera" />{scanMutation.isPending ? 'Reading receipt…' : 'Open camera'}</button><label className="secondary-button receipt-upload-button"><Icon name="upload" size={18} /> Choose existing image<input accept="image/jpeg,image/png,image/webp" disabled={scanMutation.isPending} onChange={(event) => void handleImage(event.target.files?.[0])} type="file" /></label></>}{error ? <p className="form-error" role="alert">{error}</p> : null}<p className="metric-caption">Gemini only prepares a draft. Nothing is saved as an expense until you confirm it.</p></div>}</DialogFrame>
}

function ReceiptConfirmForm({ draft, finance, onClose, previewUrl }: { draft: FinanceReceiptDraft; finance: NonNullable<ReturnType<typeof useFinanceData>['data']>; onClose: () => void; previewUrl: string | null }) {
  const mutation = useConfirmReceiptDraft()
  const [error, setError] = useState<string | null>(null)
  const hintedAccount = finance.accounts.find((account) => account.name.toLowerCase() === draft.accountHint?.toLowerCase()) ?? finance.accounts[0]
  const hintedCategory = finance.categories.find((category) => category.name === draft.categoryHint)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get('amount'))
    const occurredAt = new Date(String(form.get('occurredAt')))
    const accountId = String(form.get('accountId') ?? '')
    const account = finance.accounts.find((item) => item.id === accountId)
    const categoryId = String(form.get('categoryId') ?? '')
    const description = String(form.get('description') ?? '').trim()
    if (!account || !categoryId || !description || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(occurredAt.getTime())) return setError('Confirm the merchant, total, date, source, and category')
    try {
      await mutation.mutateAsync({ draftId: draft.id, accountId, categoryId, description, amountMinor: Math.round(amount * 100), currency: account.currency, occurredAt: occurredAt.toISOString(), rememberMerchant: form.get('rememberMerchant') === 'on' })
      onClose()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Receipt expense could not be saved') }
  }
  const confidence = draft.confidence
  return <form className="receipt-confirm-form" onSubmit={handleSubmit}>{previewUrl ? <img alt="Receipt preview" className="receipt-preview compact" src={previewUrl} /> : null}<label className={confidence.merchant < .7 ? 'low-confidence-field' : ''}>Merchant<input defaultValue={draft.merchantName ?? ''} name="description" required /></label><div className="form-grid"><label className={confidence.total < .7 ? 'low-confidence-field' : ''}>Total<input defaultValue={draft.totalMinor ? draft.totalMinor / 100 : ''} min="0.01" name="amount" required step="0.01" type="number" /></label><label className={confidence.date < .7 ? 'low-confidence-field' : ''}>Date and time<input defaultValue={draft.occurredAt ? toLocalDateTime(new Date(draft.occurredAt)) : ''} min="2026-01-01T00:00" name="occurredAt" required type="datetime-local" /></label></div><div className="form-grid"><label className={confidence.account < .7 ? 'low-confidence-field' : ''}>Paid from<select defaultValue={hintedAccount?.id ?? ''} name="accountId" required>{finance.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label className={confidence.category < .7 ? 'low-confidence-field' : ''}>Category<select defaultValue={hintedCategory?.id ?? ''} name="categoryId" required><option value="">Choose category</option>{finance.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><label className="checkbox-label"><input defaultChecked name="rememberMerchant" type="checkbox" /> Remember this merchant category</label>{draft.errorMessage ? <p className="setup-warning"><Icon name="warning" size={17} /> {draft.errorMessage}</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}<DialogFooter busy={mutation.isPending} busyLabel="Saving…" label="Confirm expense" onClose={onClose} /></form>
}

function TargetDialog({ currency, month, onClose, targetMinor }: { currency: string; month: string; onClose: () => void; targetMinor: number | null }) {
  const mutation = useSetMonthlyExpenseTarget()
  const [error, setError] = useState<string | null>(null)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(new FormData(event.currentTarget).get('amount'))
    if (!Number.isFinite(amount) || amount <= 0) return setError('Enter a target greater than zero')
    try { await mutation.mutateAsync({ monthStart: `${month}-01`, amountMinor: Math.round(amount * 100), currency }); onClose() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Target could not be saved') }
  }
  return <DialogFrame eyebrow="Monthly planning" onClose={onClose} title={`Target for ${displayMonth(month)}`}><form onSubmit={handleSubmit}><label>Maximum monthly spending<input defaultValue={targetMinor ? targetMinor / 100 : ''} min="1" name="amount" required step="1" type="number" /></label><label>Currency<input readOnly value={currency} /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<DialogFooter busy={mutation.isPending} busyLabel="Saving…" label="Save target" onClose={onClose} /></form></DialogFrame>
}

function CategoryDialog({ categories, onClose, transaction }: { categories: Array<{ id: string; name: string }>; onClose: () => void; transaction: FinanceTransaction }) {
  const mutation = useCategorizeExpense()
  const [error, setError] = useState<string | null>(null)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const categoryId = String(form.get('categoryId') ?? '')
    if (!categoryId) return setError('Choose an expense category')
    try { await mutation.mutateAsync({ transactionId: transaction.id, categoryId, rememberMerchant: form.get('rememberMerchant') === 'on' }); onClose() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Category could not be saved') }
  }
  return <DialogFrame eyebrow="Expense classification" onClose={onClose} title={transaction.description}><form onSubmit={handleSubmit}><p className="dialog-intro">{formatMoney(transaction.amountMinor, transaction.currency)} from {transaction.accountName}</p><label>Category<select name="categoryId" required><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="checkbox-label"><input defaultChecked name="rememberMerchant" type="checkbox" /> Apply this category to matching past and future merchant records</label>{error ? <p className="form-error" role="alert">{error}</p> : null}<DialogFooter busy={mutation.isPending} busyLabel="Saving…" label="Save category" onClose={onClose} /></form></DialogFrame>
}

function ExpenseDialog({ finance, onClose }: { finance: NonNullable<ReturnType<typeof useFinanceData>['data']>; onClose: () => void }) {
  const mutation = useCreateExpense()
  const [accountId, setAccountId] = useState(finance.accounts[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const account = finance.accounts.find((item) => item.id === accountId)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get('amount'))
    const occurredAt = new Date(String(form.get('occurredAt')))
    const categoryId = String(form.get('categoryId') ?? '')
    if (!account || !categoryId || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(occurredAt.getTime())) return setError('Choose a source, category, amount, and valid date')
    const input: ExpenseInput = { description: String(form.get('description') ?? ''), amountMinor: Math.round(amount * 100), currency: account.currency, occurredAt: occurredAt.toISOString(), accountId: account.id, categoryId }
    try { await mutation.mutateAsync(input); onClose() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Expense could not be saved') }
  }
  return <DialogFrame eyebrow="Manual expense" onClose={onClose} title="Add expense"><form onSubmit={handleSubmit}><div className="form-grid"><label>Amount<input min="0.01" name="amount" required step="0.01" type="number" /></label><label>Currency<input readOnly value={account?.currency ?? 'IDR'} /></label></div><label>Description<input name="description" required /></label><label>Paid from<select name="accountId" onChange={(event) => setAccountId(event.target.value)} required value={accountId}>{finance.accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Category<select name="categoryId" required><option value="">Choose category</option>{finance.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Date and time<input defaultValue={toLocalDateTime(new Date())} name="occurredAt" required type="datetime-local" /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<DialogFooter busy={mutation.isPending} busyLabel="Saving…" label="Save expense" onClose={onClose} /></form></DialogFrame>
}

function GmailAutoSyncDialog({ finance, onClose }: { finance: NonNullable<ReturnType<typeof useFinanceData>['data']>; onClose: () => void }) {
  const mutation = useConfigureGmailAutoSync()
  const urlMutation = useSetGmailAppsScriptUrl()
  const [secret, setSecret] = useState<string | null>(null)
  const [showCredentialForm, setShowCredentialForm] = useState(!finance.gmailSync.configured)
  const [error, setError] = useState<string | null>(null)
  const [urlSaved, setUrlSaved] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const bcaSender = String(form.get('bcaSender') ?? '').trim().toLowerCase() || null
    const bsiSender = String(form.get('bsiSender') ?? '').trim().toLowerCase() || null
    if (!bcaSender && !bsiSender) return setError('Enter at least one exact sender address')
    try { const result = await mutation.mutateAsync({ bcaSender, bsiSender }); setSecret(result.secret); setError(null) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Gmail auto-sync could not be configured') }
  }
  async function handleUrlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const appsScriptUrl = String(new FormData(event.currentTarget).get('appsScriptUrl') ?? '').trim()
    try { await urlMutation.mutateAsync(appsScriptUrl); setUrlSaved(true); setError(null) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Refresh link could not be saved') }
  }
  async function copyValue(label: string, value: string) { await navigator.clipboard.writeText(value); setCopied(label) }
  return <DialogFrame eyebrow="Daily Gmail sync" onClose={onClose} title="Connect Gmail finance email">{secret ? <div className="gmail-setup-result"><p className="setup-warning"><Icon name="key" size={17} /> This secret is shown once.</p><SetupValue copied={copied === 'endpoint'} label="PERSONAL_OS_ENDPOINT" onCopy={() => void copyValue('endpoint', gmailIngestEndpoint)} value={gmailIngestEndpoint} /><SetupValue copied={copied === 'secret'} label="PERSONAL_OS_SECRET" onCopy={() => void copyValue('secret', secret)} value={secret} /><ol className="gmail-setup-steps"><li><a href="/downloads/personal-os-gmail-sync.gs?v=20260805-1" target="_blank">Open the latest Apps Script code</a> and replace the old code.</li><li>Store the endpoint and secret in Script properties. BCA, BSI, Shopee, GoPay, and Grab sender addresses are already included.</li><li>Run <code>setup()</code> once to create the labels and daily trigger.</li><li>Deploy a new Web app version that executes as you and is accessible to <strong>Anyone</strong>.</li><li>Copy its <code>/exec</code> URL and save it here. Refresh will then run in the background without leaving Finance.</li></ol><footer><span /><button className="save-button" onClick={onClose} type="button">Done</button></footer></div> : showCredentialForm ? <form onSubmit={handleSubmit}><p className="dialog-intro">Use the exact From address of genuine BCA and BSI notifications. Shopee, GoPay, and Grab use the built-in addresses listed in the setup code.</p><label>BCA sender<input defaultValue={finance.gmailSync.bcaSender ?? ''} name="bcaSender" type="email" /></label><label>BSI sender<input defaultValue={finance.gmailSync.bsiSender ?? ''} name="bsiSender" type="email" /></label>{finance.gmailSync.configured ? <p className="setup-warning"><Icon name="warning" size={17} /> Saving rotates the existing secret.</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}<DialogFooter busy={mutation.isPending} busyLabel="Generating…" label="Generate setup secret" onClose={onClose} /></form> : <div className="gmail-connection-settings"><form onSubmit={handleUrlSubmit}><p className="dialog-intro">The daily trigger checks recent messages. Refresh runs the same scan in the background and keeps you on the Finance page. The Web app deployment must be accessible to Anyone.</p><label>Apps Script Web app URL<input defaultValue={finance.gmailSync.appsScriptUrl ?? ''} name="appsScriptUrl" placeholder="https://script.google.com/macros/s/…/exec" type="url" /></label>{urlSaved ? <p className="form-success">Refresh link saved.</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}<footer><button className="secondary-button" onClick={() => setShowCredentialForm(true)} type="button">Change senders / secret</button><button className="save-button" disabled={urlMutation.isPending} type="submit">{urlMutation.isPending ? 'Saving…' : 'Save refresh link'}</button></footer></form></div>}</DialogFrame>
}

function FinanceCandidateDialog({ candidate, finance, onClose }: { candidate: FinanceEmailCandidate; finance: NonNullable<ReturnType<typeof useFinanceData>['data']>; onClose: () => void }) {
  const mutation = useApproveFinanceCandidate()
  const [direction, setDirection] = useState<'debit' | 'credit' | 'transfer' | ''>(candidate.direction ?? '')
  const defaultAccount = finance.accounts.find((item) => item.name.toLowerCase() === candidate.bank?.toLowerCase()) ?? finance.accounts[0]
  const [accountId, setAccountId] = useState(defaultAccount?.id ?? '')
  const [counterpartAccountId, setCounterpartAccountId] = useState(finance.accounts.find((item) => item.name.toLowerCase() === candidate.counterpartAccountName?.toLowerCase())?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const selectedAccount = finance.accounts.find((item) => item.id === accountId) ?? defaultAccount
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get('amount'))
    const occurredAt = new Date(String(form.get('occurredAt')))
    const categoryId = String(form.get('categoryId') ?? '') || null
    if (!direction || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(occurredAt.getTime()) || (direction === 'debit' && !categoryId) || (direction === 'transfer' && (!counterpartAccountId || counterpartAccountId === accountId))) return setError('Complete the direction, amount, category, and account fields')
    const input: FinanceCandidateApprovalInput = { candidateId: candidate.id, accountId, counterpartAccountId: direction === 'transfer' ? counterpartAccountId : null, categoryId: direction === 'debit' ? categoryId : null, description: String(form.get('description') ?? ''), direction, amountMinor: Math.round(amount * 100), currency: selectedAccount?.currency ?? 'IDR', occurredAt: occurredAt.toISOString() }
    try { await mutation.mutateAsync(input); onClose() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Transaction could not be approved') }
  }
  return <DialogFrame eyebrow="Gmail evidence" onClose={onClose} title="Review transaction"><div className="gmail-evidence-preview"><strong>{candidate.subject}</strong><small>{candidate.reviewReason}</small>{candidate.excerpt ? <p>{candidate.excerpt}</p> : null}</div><form onSubmit={handleSubmit}><div className="form-grid"><label>Type<select onChange={(event) => setDirection(event.target.value as typeof direction)} required value={direction}><option value="">Choose type</option><option value="debit">Expense</option><option value="transfer">Transfer between own accounts</option><option value="credit">Not an expense / credit</option></select></label><label>Amount<input defaultValue={candidate.amountMinor ? candidate.amountMinor / 100 : ''} min="0.01" name="amount" required step="0.01" type="number" /></label></div><label>Description<input defaultValue={candidate.merchantName} name="description" required /></label><label>Source<select onChange={(event) => setAccountId(event.target.value)} required value={accountId}>{finance.accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{direction === 'transfer' ? <label>Destination<select onChange={(event) => setCounterpartAccountId(event.target.value)} required value={counterpartAccountId}><option value="">Choose account</option>{finance.accounts.filter((item) => item.id !== accountId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}{direction === 'debit' ? <label>Category<select name="categoryId" required><option value="">Choose category</option>{finance.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}<label>Date and time<input defaultValue={toLocalDateTime(new Date(candidate.occurredAt ?? candidate.createdAt))} name="occurredAt" required type="datetime-local" /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<DialogFooter busy={mutation.isPending} busyLabel="Confirming…" label="Confirm" onClose={onClose} /></form></DialogFrame>
}

function DialogFrame({ children, eyebrow, onClose, title }: { children: ReactNode; eyebrow: string; onClose: () => void; title: string }) { return <div aria-modal="true" className="dialog-backdrop" role="dialog"><section className="record-dialog"><header><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><Icon name="close" /></button></header>{children}</section></div> }
function DialogFooter({ busy, busyLabel, label, onClose }: { busy: boolean; busyLabel: string; label: string; onClose: () => void }) { return <footer><span /><div><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="save-button" disabled={busy} type="submit">{busy ? busyLabel : label}</button></div></footer> }
function SetupValue({ copied, label, onCopy, value }: { copied: boolean; label: string; onCopy: () => void; value: string }) { return <div className="setup-value"><span><small>{label}</small><code>{value}</code></span><button className="secondary-button compact" onClick={onCopy} type="button">{copied ? 'Copied' : 'Copy'}</button></div> }

function displayMonth(value: string) { return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(`${value}-01T12:00:00+07:00`)) }
function buildSpendingPoints(trend: Array<{ month: string; amountMinor: number }>) {
  if (!trend.length) return null
  const values = trend.map((item) => item.amountMinor)
  const max = Math.max(1, ...values)
  const x = values.map((_, index) => values.length === 1 ? 319 : 42 + index * (560 / (values.length - 1)))
  return { points: values.map((value, index) => `${x[index]},${180 - (value / max) * 145}`).join(' '), labels: trend.map((item) => new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(`${item.month}-01T12:00:00+07:00`))), x }
}
function toLocalDateTime(value: Date) { const offset = value.getTimezoneOffset(); return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16) }

function cameraErrorMessage(cause: unknown) {
  if (cause instanceof DOMException && cause.name === 'NotAllowedError') return 'Camera permission was denied. Allow camera access in the browser address bar, then try again.'
  if (cause instanceof DOMException && cause.name === 'NotFoundError') return 'No camera was found on this device. Use Choose existing image instead.'
  return cause instanceof Error ? cause.message : 'The camera could not be opened.'
}

async function prepareReceiptImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file')
  const bitmap = await createImageBitmap(file)
  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = Math.min(1, 1000 / longest)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Camera image could not be prepared')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Camera image could not be compressed')), 'image/jpeg', .84))
  const buffer = await blob.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  const imageBase64 = await blobToBase64(blob)
  return { previewUrl: URL.createObjectURL(blob), payload: { imageBase64, mimeType: 'image/jpeg', contentHash } }
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Camera image could not be read'))
    reader.onload = () => resolve(String(reader.result).split(',', 2)[1] ?? '')
    reader.readAsDataURL(blob)
  })
}
