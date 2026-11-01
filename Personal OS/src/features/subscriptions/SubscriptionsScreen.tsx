import { type FormEvent, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { QueryFeedback } from '@/components/ui/QueryFeedback'
import { formatDate, formatMoney } from '@/lib/format'
import {
  type Subscription,
  type SubscriptionInput,
  useArchiveSubscription,
  useCreateSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from './subscriptions.api'

const filters = ['All Tools', 'AI & LLMs', 'Development', 'Design'] as const

const logoByName: Record<string, string> = {
  claude: '/assets/claude.svg',
  chatgpt: '/assets/openai.svg',
  openai: '/assets/openai.svg',
  cursor: '/assets/cursor.svg',
  figma: '/assets/figma.svg',
  midjourney: '/assets/midjourney.svg',
}

export function SubscriptionsScreen() {
  const subscriptionsQuery = useSubscriptions()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All Tools')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Subscription | 'new' | null>(null)
  const subscriptions = useMemo(() => subscriptionsQuery.data ?? [], [subscriptionsQuery.data])

  const visibleSubscriptions = useMemo(() => subscriptions.filter((subscription) => {
    const matchesFilter = filter === 'All Tools' || subscription.category === filter
    const matchesQuery = subscription.name.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  }), [filter, query, subscriptions])

  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'active')
  const currencies = new Set(activeSubscriptions.map((subscription) => subscription.currency))
  const currency = currencies.size === 1 ? activeSubscriptions[0]?.currency : null
  const monthlyMinor = activeSubscriptions.reduce((total, subscription) => total + (subscription.billingCycle === 'monthly' ? subscription.amountMinor : Math.round(subscription.amountMinor / 12)), 0)
  const annualMinor = activeSubscriptions.reduce((total, subscription) => total + (subscription.billingCycle === 'monthly' ? subscription.amountMinor * 12 : subscription.amountMinor), 0)
  const nextPayment = [...activeSubscriptions].sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate))[0]

  return (
    <div className="page subscriptions-page">
      <PageHeader
        action={(
          <div className="subscription-header-actions">
            <button className="add-subscription-button" onClick={() => setEditing('new')} type="button"><Icon name="add" size={19} /> Add</button>
            <div className="view-toggle"><button aria-label="Card view" className="active" type="button"><Icon name="grid_view" size={20} /></button><button aria-label="List view" type="button"><Icon name="view_list" size={20} /></button></div>
          </div>
        )}
        description="Manage recurring tools and upcoming payments."
        title="Active Subscriptions"
      />

      <section aria-label="Subscription totals" className="subscription-stats">
        <article className="stat-card"><span className="card-icon blue"><Icon name="payments" /></span><span><small>Monthly Spend</small><strong>{currency ? formatMoney(monthlyMinor, currency) : '—'}</strong></span><em>{activeSubscriptions.length} active</em></article>
        <article className="stat-card"><span className="card-icon violet"><Icon name="calendar_month" /></span><span><small>Annual Spend</small><strong>{currency ? formatMoney(annualMinor, currency) : '—'}</strong></span><em>{currencies.size > 1 ? 'Mixed currencies' : 'Projected'}</em></article>
        <article className="stat-card next-payment"><span className="card-icon pink"><Icon name="schedule" /></span><span><small>Next Payment</small><strong>{nextPayment?.name ?? 'None scheduled'}</strong><em>{nextPayment ? `${formatDate(nextPayment.nextBillingDate)}, ${formatMoney(nextPayment.amountMinor, nextPayment.currency)}` : '—'}</em></span></article>
      </section>

      <div className="subscription-tools">
        <label className="search-field"><Icon name="search" size={20} /><input aria-label="Search subscriptions" onChange={(event) => setQuery(event.target.value)} placeholder="Search subscriptions" type="search" value={query} /></label>
        <div className="filter-pills" role="group" aria-label="Subscription category">
          {filters.map((item) => <button aria-pressed={filter === item} className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}
        </div>
      </div>

      {subscriptionsQuery.isPending ? <SubscriptionSkeleton /> : null}
      {subscriptionsQuery.isError ? <QueryFeedback actionLabel="Try again" message={subscriptionsQuery.error.message} onAction={() => void subscriptionsQuery.refetch()} title="Subscriptions could not be loaded" tone="error" /> : null}
      {subscriptionsQuery.isSuccess && subscriptions.length === 0 ? <QueryFeedback actionLabel="Add subscription" message="Create your first subscription. Totals and next billing dates will be calculated from stored records." onAction={() => setEditing('new')} title="No subscriptions yet" /> : null}

      {visibleSubscriptions.length > 0 ? (
        <section aria-live="polite" className="subscription-grid">
          {visibleSubscriptions.map((subscription) => (
            <article className="subscription-card" key={subscription.id}>
              <div className="subscription-card-top">
                <div className="service-identity"><span className="service-logo"><img alt="" src={getProviderLogo(subscription.name)} /></span><span><strong>{subscription.name}</strong><small>{subscription.category}</small></span></div>
                <span className={`subscription-status ${subscription.status}`}>{subscription.status}</span>
              </div>
              <div className="subscription-price"><strong>{formatMoney(subscription.amountMinor, subscription.currency)}</strong><span>/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}</span></div>
              <div className="subscription-meta">
                <div><span><Icon name="event" size={18} /> Next billing</span><strong>{formatDate(subscription.nextBillingDate)}</strong></div>
                <div><span><Icon name="credit_card" size={18} /> Payment</span><strong>{subscription.paymentMethod ? `${subscription.paymentMethod.name} ${subscription.paymentMethod.lastFour ? `•••• ${subscription.paymentMethod.lastFour}` : ''}` : 'Not linked'}</strong></div>
              </div>
              <button className="manage-button" onClick={() => setEditing(subscription)} type="button">Manage subscription <Icon name="arrow_outward" size={18} /></button>
            </article>
          ))}
        </section>
      ) : null}

      {editing ? <SubscriptionDialog onClose={() => setEditing(null)} subscription={editing === 'new' ? null : editing} /> : null}
    </div>
  )
}

function getProviderLogo(name: string): string {
  const normalized = name.toLowerCase()
  const match = Object.entries(logoByName).find(([provider]) => normalized.includes(provider))
  return match?.[1] ?? '/assets/personal-os.png'
}

function SubscriptionSkeleton() {
  return <div className="subscription-grid" role="status" aria-label="Loading subscriptions">{[1, 2, 3].map((item) => <div className="subscription-card data-skeleton" key={item} />)}</div>
}

function SubscriptionDialog({ onClose, subscription }: { onClose: () => void; subscription: Subscription | null }) {
  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()
  const archiveMutation = useArchiveSubscription()
  const [error, setError] = useState<string | null>(null)
  const isSaving = createMutation.isPending || updateMutation.isPending || archiveMutation.isPending

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get('amount'))
    const input: SubscriptionInput = {
      name: String(form.get('name') ?? ''),
      category: String(form.get('category') ?? ''),
      billingCycle: String(form.get('billingCycle')) as SubscriptionInput['billingCycle'],
      anchorDate: String(form.get('anchorDate') ?? ''),
      amountMinor: Math.round(amount * 100),
      currency: String(form.get('currency') ?? 'USD'),
      status: String(form.get('status')) as SubscriptionInput['status'],
      websiteUrl: String(form.get('websiteUrl') ?? ''),
    }

    if (!Number.isFinite(input.amountMinor) || input.amountMinor < 0) {
      setError('Amount must be zero or greater')
      return
    }

    try {
      if (subscription) await updateMutation.mutateAsync({ id: subscription.id, input })
      else await createMutation.mutateAsync(input)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Subscription could not be saved')
    }
  }

  async function handleArchive() {
    if (!subscription || !window.confirm(`Archive ${subscription.name}?`)) return
    setError(null)
    try {
      await archiveMutation.mutateAsync(subscription.id)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Subscription could not be archived')
    }
  }

  return (
    <div aria-labelledby="subscription-dialog-title" aria-modal="true" className="dialog-backdrop" role="dialog">
      <section className="record-dialog">
        <header><div><p className="eyebrow">Database record</p><h2 id="subscription-dialog-title">{subscription ? 'Edit subscription' : 'New subscription'}</h2></div><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><Icon name="close" /></button></header>
        <form onSubmit={handleSubmit}>
          <label>Service name<input defaultValue={subscription?.name} name="name" placeholder="Claude Pro" required /></label>
          <label>Category<input defaultValue={subscription?.category ?? 'AI & LLMs'} name="category" required /></label>
          <div className="form-grid">
            <label>Amount<input defaultValue={subscription ? subscription.amountMinor / 100 : ''} min="0" name="amount" required step="0.01" type="number" /></label>
            <label>Currency<input defaultValue={subscription?.currency ?? 'USD'} maxLength={3} minLength={3} name="currency" required /></label>
          </div>
          <div className="form-grid">
            <label>Billing cycle<select defaultValue={subscription?.billingCycle ?? 'monthly'} name="billingCycle"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
            <label>Anchor date<input defaultValue={subscription?.anchorDate ?? new Date().toISOString().slice(0, 10)} name="anchorDate" required type="date" /></label>
          </div>
          <label>Status<select defaultValue={subscription?.status ?? 'active'} name="status"><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></select></label>
          <label>Website URL<input defaultValue={subscription?.websiteUrl ?? ''} name="websiteUrl" placeholder="https://…" type="url" /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <footer>
            {subscription ? <button className="danger-button" disabled={isSaving} onClick={() => void handleArchive()} type="button">Archive</button> : <span />}
            <div><button className="secondary-button" disabled={isSaving} onClick={onClose} type="button">Cancel</button><button className="save-button" disabled={isSaving} type="submit">{isSaving ? 'Saving…' : 'Save subscription'}</button></div>
          </footer>
        </form>
      </section>
    </div>
  )
}
