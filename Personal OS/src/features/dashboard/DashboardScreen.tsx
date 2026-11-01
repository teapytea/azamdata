import { Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatCompactMoney, formatDate, formatMoney, formatRelativeTime } from '@/lib/format'
import { useFinanceData } from '@/features/finance/finance.api'
import { useIdeas } from '@/features/ideas/ideas.api'
import { useQuotaProviders } from '@/features/quota/quota.api'
import { useSubscriptions } from '@/features/subscriptions/subscriptions.api'

const quickActions = [
  { icon: 'add_card', label: 'New Sub', to: '/subscriptions' as const },
  { icon: 'receipt_long', label: 'Add Expense', to: '/finance' as const },
  { icon: 'lightbulb', label: 'View Ideas', to: '/ideas' as const },
]

export function DashboardScreen() {
  const subscriptionsQuery = useSubscriptions()
  const financeQuery = useFinanceData()
  const quotasQuery = useQuotaProviders()
  const ideasQuery = useIdeas()
  const subscriptions = subscriptionsQuery.data ?? []
  const finance = financeQuery.data
  const quotas = quotasQuery.data ?? []
  const ideas = ideasQuery.data ?? []
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'active')
  const subscriptionCurrencies = new Set(activeSubscriptions.map((subscription) => subscription.currency))
  const subscriptionCurrency = subscriptionCurrencies.size === 1 ? activeSubscriptions[0]?.currency : null
  const monthlySubscriptionCost = activeSubscriptions.reduce((total, subscription) => total + (subscription.billingCycle === 'monthly' ? subscription.amountMinor : Math.round(subscription.amountMinor / 12)), 0)
  const nextPayment = [...activeSubscriptions].sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate))[0]
  const currentMonth = new Date().toISOString().slice(0, 7)
  const financeTarget = finance?.monthlyTargets.find((target) => target.monthStart.startsWith(currentMonth))
  const financeCurrency = financeTarget?.currency ?? 'IDR'
  const currentExpenses = finance?.transactions.filter((transaction) => transaction.currency === financeCurrency && transaction.occurredAt.slice(0, 7) === currentMonth) ?? []
  const monthExpenseMinor = currentExpenses.reduce((total, transaction) => total + transaction.amountMinor, 0)
  const remainingTargetMinor = financeTarget ? financeTarget.amountMinor - monthExpenseMinor : null
  const chartPoints = buildExpenseSparkline(currentExpenses)
  const isPending = subscriptionsQuery.isPending || financeQuery.isPending || quotasQuery.isPending || ideasQuery.isPending
  const hasError = subscriptionsQuery.isError || financeQuery.isError || quotasQuery.isError || ideasQuery.isError

  return (
    <div className="page dashboard-page">
      <PageHeader action={<div className="desktop-actions"><button className="icon-button" type="button"><Icon name="notifications" /></button><img alt="" className="header-avatar" src="/assets/avatar.png" /></div>} eyebrow={new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())} title="Command Center" />
      <div className="quick-actions" role="group" aria-label="Quick actions">{quickActions.map((action) => <Link className="action-pill" key={action.label} to={action.to}><Icon name={action.icon} size={19} />{action.label}</Link>)}</div>
      {hasError ? <div className="inline-data-warning"><Icon name="cloud_off" size={18} /> Some dashboard records could not be loaded. Open the related module for details.</div> : null}

      <section aria-busy={isPending} aria-label="Personal OS overview" className="dashboard-grid">
        <article className="surface-card subscription-summary dashboard-card">
          <div className="card-heading-row"><span className="card-icon blue"><Icon name="credit_card" /></span><span className="card-label">Subscriptions</span><span className="live-data-badge">Live</span></div>
          <p className="metric-value">{isPending ? '…' : subscriptionCurrency ? formatMoney(monthlySubscriptionCost, subscriptionCurrency) : subscriptionCurrencies.size > 1 ? 'Mixed' : formatMoney(0, 'USD')}</p><p className="metric-caption">per month</p><div className="summary-divider" />
          <div className="mini-stats"><span><small>Active</small><strong>{activeSubscriptions.length}</strong></span><span><small>Next payment</small><strong>{nextPayment ? `${nextPayment.name} · ${formatDate(nextPayment.nextBillingDate)}` : 'None scheduled'}</strong></span></div>
        </article>

        <article className="surface-card quota-summary dashboard-card">
          <div className="card-heading-row"><span className="card-icon violet"><Icon name="data_usage" /></span><span className="card-label">API Quotas</span><span className="live-data-badge">Live</span></div>
          <div className="quota-list">{quotas.slice(0, 2).map((provider) => { const snapshot = provider.snapshots[0]; const usedPercent = snapshot?.limit ? Math.max(0, Math.min(100, ((snapshot.limit - snapshot.remaining) / snapshot.limit) * 100)) : 0; return <div key={provider.id}><div className="row-between"><span>{provider.name}</span><strong>{snapshot ? `${snapshot.remaining}${snapshot.limit ? ` / ${snapshot.limit}` : ''} ${snapshot.unit}` : 'No snapshot'}</strong></div><ProgressBar label={`${provider.name} usage`} tone="secondary" value={usedPercent} /><small>{formatRelativeTime(provider.lastSyncedAt)}</small></div> })}{!isPending && quotas.length === 0 ? <p className="card-empty-copy">No quota providers configured.</p> : null}</div>
        </article>

        <article className="surface-card finance-summary dashboard-card dashboard-wide">
          <div className="card-heading-row"><span className="card-icon cyan"><Icon name="account_balance_wallet" /></span><span className="card-label">Monthly Expenses</span><span className="live-data-badge">Live</span></div>
          <div className="finance-card-content">
            <div><p className="metric-caption">{financeTarget ? 'Target remaining' : 'Spent this month'}</p><p className="metric-value">{isPending ? '…' : formatCompactMoney(financeTarget ? Math.abs(remainingTargetMinor ?? 0) : monthExpenseMinor, financeCurrency)}</p><div className="finance-delta"><span className="negative"><Icon name="payments" size={17} /> {formatCompactMoney(monthExpenseMinor, financeCurrency)} spent</span><span><Icon name="flag" size={17} /> {financeTarget ? formatCompactMoney(financeTarget.amountMinor, financeCurrency) : 'Target not set'}</span></div></div>
            {chartPoints ? <svg aria-label="Recent expense trend" className="mini-chart" role="img" viewBox="0 0 330 112"><polyline fill="none" points={chartPoints} stroke="#4d89ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg> : <div className="chart-empty">Add expenses to build a trend.</div>}
          </div>
        </article>

        <article className="surface-card ideas-summary dashboard-card dashboard-wide">
          <div className="card-heading-row"><span className="card-icon pink"><Icon name="lightbulb" /></span><span className="card-label">Active Ideas</span><span className="count-pill">{ideas.length} Total</span></div>
          <div className="idea-preview-list">{ideas.slice(0, 2).map((idea) => <div className="idea-preview" key={idea.id}><span className="idea-status violet" /><div><strong>{idea.title}</strong><small>{idea.tags.join(' · ') || idea.noteType} · {formatRelativeTime(idea.updatedAt)}</small></div><Icon name="chevron_right" size={20} /></div>)}{!isPending && ideas.length === 0 ? <p className="card-empty-copy">No Obsidian notes have been synchronized.</p> : null}</div>
          <Link className="text-button" to="/ideas">View All Ideas <Icon name="arrow_forward" size={18} /></Link>
        </article>
      </section>
    </div>
  )
}

function buildExpenseSparkline(transactions: Array<{ amountMinor: number }>): string | null {
  if (transactions.length < 2) return null
  const values = transactions.slice(0, 12).reverse().reduce<number[]>((running, transaction) => { running.push((running.at(-1) ?? 0) + transaction.amountMinor); return running }, [])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  return values.map((value, index) => `${(index / (values.length - 1)) * 328 + 1},${105 - ((value - min) / range) * 96}`).join(' ')
}
