import { type FormEvent, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { QueryFeedback } from '@/components/ui/QueryFeedback'
import { formatCountdown, formatRelativeTime } from '@/lib/format'
import { type QuotaProvider, type QuotaProviderInput, type QuotaSnapshot, type QuotaSnapshotInput, useCreateQuotaProvider, useCreateQuotaSnapshot, useQuotaProviders } from './quota.api'

const providerLogos: Record<string, string> = {
  claude: '/assets/claude.svg',
  anthropic: '/assets/claude.svg',
  cursor: '/assets/cursor.svg',
  openai: '/assets/openai.svg',
  chatgpt: '/assets/openai.svg',
  midjourney: '/assets/midjourney.svg',
  figma: '/assets/figma.svg',
}

export function QuotaScreen() {
  const quotaQuery = useQuotaProviders()
  const providers = quotaQuery.data ?? []
  const [dialog, setDialog] = useState<'provider' | QuotaProvider | null>(null)

  return (
    <div className="page quota-page">
      <PageHeader
        action={<div className="quota-header-actions"><button className="add-subscription-button" onClick={() => setDialog('provider')} type="button"><Icon name="add" size={18} /> Provider</button><button className="sync-pill" disabled={quotaQuery.isFetching} onClick={() => void quotaQuery.refetch()} type="button"><span className="sync-dot" />{quotaQuery.isFetching ? 'Refreshing…' : 'Refresh data'}<Icon className={quotaQuery.isFetching ? 'spin' : ''} name="sync" size={18} /></button></div>}
        description="Monitor persisted quota snapshots and provider synchronization health."
        title="Quota Tracker"
      />

      {quotaQuery.isError ? <QueryFeedback actionLabel="Try again" message={quotaQuery.error.message} onAction={() => void quotaQuery.refetch()} title="Quota data could not be loaded" tone="error" /> : null}
      {quotaQuery.isSuccess && providers.length === 0 ? <QueryFeedback actionLabel="Add provider" message="Add a provider and record its first manual snapshot. This screen never invents a quota value." onAction={() => setDialog('provider')} title="No quota providers configured" /> : null}

      <section className="quota-primary-grid">
        {providers.slice(0, 2).map((provider, index) => index === 0 ? <FeaturedProviderCard key={provider.id} onUpdate={() => setDialog(provider)} provider={provider} /> : <StandardProviderCard key={provider.id} onUpdate={() => setDialog(provider)} provider={provider} />)}
      </section>

      {providers.length > 2 ? (
        <section className="secondary-quotas">
          <div className="section-heading"><div><h2>Secondary APIs</h2><p>Latest persisted snapshots</p></div><button className="text-button" onClick={() => void quotaQuery.refetch()} type="button"><Icon name="refresh" size={18} /> Refresh all</button></div>
          <div className="secondary-grid">{providers.slice(2).map((provider) => <SecondaryProviderCard key={provider.id} onUpdate={() => setDialog(provider)} provider={provider} />)}</div>
        </section>
      ) : null}
      {dialog === 'provider' ? <ProviderDialog onClose={() => setDialog(null)} /> : null}
      {dialog && dialog !== 'provider' ? <SnapshotDialog onClose={() => setDialog(null)} provider={dialog} /> : null}
    </div>
  )
}

function FeaturedProviderCard({ onUpdate, provider }: { onUpdate: () => void; provider: QuotaProvider }) {
  const snapshot = provider.snapshots[0]
  const usage = getUsage(snapshot)
  return (
    <article className="quota-provider-card featured">
      <ProviderHeading provider={provider} />
      <div className="featured-quota-content">
        <div aria-label={`${provider.name} usage: ${usage.usedPercent}%`} className="quota-ring" role="img" style={{ background: `conic-gradient(var(--primary-strong) 0 ${usage.usedPercent}%, var(--surface-highest) ${usage.usedPercent}% 100%)` }}><span><strong>{usage.usedPercent}%</strong><small>used</small></span></div>
        <div className="quota-copy"><p><strong>{snapshot?.remaining ?? '—'}</strong> {snapshot?.unit ?? 'no snapshot'}</p><small>{snapshot?.windowType.replaceAll('_', ' ') ?? 'Waiting for provider data'}</small><div className="reset-timer"><Icon name="schedule" size={20} /><span><small>Reset</small><strong>{formatCountdown(snapshot?.resetsAt ?? null)}</strong></span></div></div>
      </div>
      <ProviderFooter onUpdate={onUpdate} provider={provider} />
    </article>
  )
}

function StandardProviderCard({ onUpdate, provider }: { onUpdate: () => void; provider: QuotaProvider }) {
  const snapshot = provider.snapshots[0]
  const usage = getUsage(snapshot)
  return (
    <article className="quota-provider-card cursor-card">
      <ProviderHeading provider={provider} />
      <div className="cursor-quota"><div className="row-between"><span><strong>{snapshot?.remaining ?? '—'}</strong>{snapshot?.limit === null || snapshot?.limit === undefined ? '' : ` / ${snapshot.limit}`} {snapshot?.unit ?? ''}</span><strong>{usage.usedPercent}% used</strong></div><ProgressBar label={`${provider.name} usage`} tone={usage.usedPercent >= 80 ? 'warning' : 'primary'} value={usage.usedPercent} /><small>{snapshot ? `${snapshot.windowType.replaceAll('_', ' ')} · ${formatCountdown(snapshot.resetsAt)}` : 'No snapshot received'}</small></div>
      {provider.syncStatus === 'failed' ? <div className="quota-warning"><Icon name="warning" size={19} /><span><strong>Sync failed</strong><small>{provider.syncError ?? 'Provider did not return data'}</small></span></div> : null}
      <ProviderFooter onUpdate={onUpdate} provider={provider} />
    </article>
  )
}

function SecondaryProviderCard({ onUpdate, provider }: { onUpdate: () => void; provider: QuotaProvider }) {
  const snapshot = provider.snapshots[0]
  const usage = getUsage(snapshot)
  return (
    <button className="secondary-quota-card" onClick={onUpdate} type="button"><span className="provider-letter logo"><img alt="" src={getProviderLogo(provider)} /></span><span className="secondary-copy"><span className="row-between"><span><strong>{provider.name}</strong><small>{provider.fetchMethod.replace('_', ' ')}</small></span><strong>{snapshot ? `${snapshot.remaining} ${snapshot.unit}` : '—'}</strong></span><ProgressBar label={`${provider.name} usage`} tone="secondary" value={usage.usedPercent} /><small>{formatRelativeTime(provider.lastSyncedAt)}</small></span><Icon name="chevron_right" /></button>
  )
}

function ProviderHeading({ provider }: { provider: QuotaProvider }) {
  return <div className="provider-heading"><span className="provider-mark"><img alt="" src={getProviderLogo(provider)} /></span><span><small>{provider.fetchMethod.replace('_', ' ')}</small><strong>{provider.name}</strong></span><span className={`provider-sync-state ${provider.syncStatus}`}>{provider.syncStatus}</span></div>
}

function ProviderFooter({ onUpdate, provider }: { onUpdate: () => void; provider: QuotaProvider }) {
  return <div className="quota-card-footer"><span><Icon name="history" size={17} /> Updated {formatRelativeTime(provider.lastSyncedAt)}</span><button onClick={onUpdate} type="button">Update snapshot <Icon name="edit" size={16} /></button></div>
}

function getProviderLogo(provider: QuotaProvider): string {
  const key = `${provider.providerKey} ${provider.name}`.toLowerCase()
  return Object.entries(providerLogos).find(([name]) => key.includes(name))?.[1] ?? '/assets/personal-os.png'
}

function getUsage(snapshot: QuotaSnapshot | undefined): { usedPercent: number } {
  if (!snapshot || !snapshot.limit || snapshot.limit <= 0) return { usedPercent: 0 }
  return { usedPercent: Math.round(Math.max(0, Math.min(100, ((snapshot.limit - snapshot.remaining) / snapshot.limit) * 100))) }
}

function ProviderDialog({ onClose }: { onClose: () => void }) {
  const mutation = useCreateQuotaProvider()
  const [error, setError] = useState<string | null>(null)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: QuotaProviderInput = { name: String(form.get('name') ?? ''), providerKey: String(form.get('providerKey') ?? ''), fetchMethod: String(form.get('fetchMethod')) as QuotaProviderInput['fetchMethod'] }
    try { await mutation.mutateAsync(input); onClose() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Provider could not be saved') }
  }
  return <div aria-labelledby="provider-dialog-title" aria-modal="true" className="dialog-backdrop" role="dialog"><section className="record-dialog"><header><div><p className="eyebrow">Quota source</p><h2 id="provider-dialog-title">Add provider</h2></div><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><Icon name="close" /></button></header><form onSubmit={handleSubmit}><label>Provider name<input name="name" placeholder="Claude" required /></label><label>Provider key<input name="providerKey" placeholder="claude" required /></label><label>Fetch method<select defaultValue="manual" name="fetchMethod"><option value="manual">Manual</option><option value="api">API</option><option value="local_agent">Local agent</option></select></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<footer><span /><div><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="save-button" disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving…' : 'Save provider'}</button></div></footer></form></section></div>
}

function SnapshotDialog({ onClose, provider }: { onClose: () => void; provider: QuotaProvider }) {
  const mutation = useCreateQuotaSnapshot()
  const [error, setError] = useState<string | null>(null)
  const snapshot = provider.snapshots[0]
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const limitValue = String(form.get('limit') ?? '')
    const input: QuotaSnapshotInput = { providerId: provider.id, remaining: Number(form.get('remaining')), limit: limitValue ? Number(limitValue) : null, unit: String(form.get('unit')), windowType: String(form.get('windowType')), resetsAt: dateTimeOrNull(form.get('resetsAt')), expiresAt: dateTimeOrNull(form.get('expiresAt')) }
    if (!Number.isFinite(input.remaining) || (input.limit !== null && !Number.isFinite(input.limit))) { setError('Remaining and limit must be valid numbers'); return }
    try { await mutation.mutateAsync(input); onClose() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Snapshot could not be saved') }
  }
  return <div aria-labelledby="snapshot-dialog-title" aria-modal="true" className="dialog-backdrop" role="dialog"><section className="record-dialog"><header><div><p className="eyebrow">Manual snapshot</p><h2 id="snapshot-dialog-title">Update {provider.name}</h2></div><button aria-label="Close" className="icon-button" onClick={onClose} type="button"><Icon name="close" /></button></header><form onSubmit={handleSubmit}><div className="form-grid"><label>Remaining<input defaultValue={snapshot?.remaining} name="remaining" required step="any" type="number" /></label><label>Limit<input defaultValue={snapshot?.limit ?? ''} name="limit" step="any" type="number" /></label></div><div className="form-grid"><label>Unit<select defaultValue={snapshot?.unit ?? 'requests'} name="unit"><option value="requests">Requests</option><option value="messages">Messages</option><option value="percent">Percent</option><option value="credits">Credits</option><option value="usd">USD</option><option value="hours">Hours</option><option value="tokens">Tokens</option></select></label><label>Window<select defaultValue={snapshot?.windowType ?? 'monthly'} name="windowType"><option value="rolling_5h">Rolling 5h</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="balance">Balance</option><option value="manual">Manual</option></select></label></div><label>Resets at<input name="resetsAt" type="datetime-local" /></label><label>Expires at<input name="expiresAt" type="datetime-local" /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<footer><span /><div><button className="secondary-button" onClick={onClose} type="button">Cancel</button><button className="save-button" disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving…' : 'Save snapshot'}</button></div></footer></form></section></div>
}

function dateTimeOrNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? '')
  return text ? new Date(text).toISOString() : null
}
