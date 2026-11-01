import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { QueryFeedback } from '@/components/ui/QueryFeedback'
import { formatRelativeTime } from '@/lib/format'
import {
  type ConnectedTool,
  type ToolStatus,
  useConnectionsData,
  useCreateExtensionPairing,
  useRevokeExtensionDevice,
  useUpdateToolStatus,
} from './connections.api'

const statusFilters = ['all', 'paid', 'trial', 'grant', 'free', 'expired', 'cancelled', 'account_only', 'unknown'] as const
const statusOptions: ToolStatus[] = ['account_only', 'free', 'trial', 'grant', 'paid', 'expired', 'cancelled', 'unknown']

const gmailDiscoveryQuery = 'newer_than:5y {subject:(receipt invoice billing renewal payment charged trial credits grant redeemed welcome cancelled expired) "free credits" "trial ends" "payment successful" "subscription"}'
const gmailDiscoveryUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(gmailDiscoveryQuery)}`

export function ConnectionsScreen() {
  const connectionsQuery = useConnectionsData()
  const pairingMutation = useCreateExtensionPairing()
  const revokeMutation = useRevokeExtensionDevice()
  const statusMutation = useUpdateToolStatus()
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('all')
  const [search, setSearch] = useState('')
  const data = connectionsQuery.data
  const tools = useMemo(() => data?.tools ?? [], [data?.tools])
  const visibleTools = useMemo(() => tools.filter((tool) => {
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter
    const haystack = `${tool.displayName} ${tool.domain ?? ''} ${tool.accountEmail ?? ''}`.toLowerCase()
    return matchesStatus && haystack.includes(search.trim().toLowerCase())
  }), [search, statusFilter, tools])
  const evidenceCount = tools.reduce((total, tool) => total + tool.evidence.length, 0)
  const pairedDevices = (data?.devices ?? []).filter((device) => !device.revokedAt)

  async function copyPairingCode() {
    if (!pairingMutation.data?.code) return
    await navigator.clipboard.writeText(pairingMutation.data.code)
  }

  return (
    <div className="page connections-page">
      <PageHeader
        action={<button className="sync-pill" disabled={connectionsQuery.isFetching} onClick={() => void connectionsQuery.refetch()} type="button"><Icon className={connectionsQuery.isFetching ? 'spin' : ''} name="sync" size={18} />{connectionsQuery.isFetching ? 'Refreshing…' : 'Refresh'}</button>}
        description="Cross-check Google-connected accounts, Gmail evidence, and provider dashboards without storing passwords or browser cookies."
        title="Connections & Discovery"
      />

      <section aria-label="Discovery totals" className="connection-summary-grid">
        <SummaryCard icon="travel_explore" label="Discovered tools" value={tools.length} />
        <SummaryCard icon="verified" label="Provider verified" value={tools.filter((tool) => tool.lastVerifiedAt).length} />
        <SummaryCard icon="description" label="Evidence records" value={evidenceCount} />
        <SummaryCard icon="extension" label="Paired devices" value={pairedDevices.length} />
      </section>

      <section className="connection-setup-grid">
        <article className="surface-card extension-setup-card">
          <div className="card-heading-row"><span className="card-icon blue"><Icon name="extension" /></span><span><strong>Personal OS Edge Scanner</strong><small>Reads only the page you explicitly scan</small></span><span className={`connection-state ${pairedDevices.length ? 'connected' : ''}`}>{pairedDevices.length ? 'Paired' : 'Not paired'}</span></div>
          <ol className="setup-steps">
            <li><span>1</span><p><strong>Install the extension</strong><small>Download, extract, then load the folder as an unpacked Edge extension.</small></p><a className="secondary-button" download href="/downloads/personal-os-edge-extension.zip"><Icon name="download" size={17} /> Download</a></li>
            <li><span>2</span><p><strong>Generate a one-time pairing code</strong><small>The code expires after 10 minutes and can only be claimed once.</small></p><button className="secondary-button" disabled={pairingMutation.isPending} onClick={() => pairingMutation.mutate()} type="button">{pairingMutation.isPending ? 'Generating…' : 'Generate code'}</button></li>
          </ol>
          {pairingMutation.data ? <div className="pairing-code-panel"><span><small>Pairing code</small><strong>{formatPairingCode(pairingMutation.data.code)}</strong></span><button aria-label="Copy pairing code" className="icon-button" onClick={() => void copyPairingCode()} type="button"><Icon name="content_copy" /></button><small>Expires {formatRelativeTime(pairingMutation.data.expiresAt)}</small></div> : null}
          {pairingMutation.isError ? <p className="form-error" role="alert">{pairingMutation.error.message}</p> : null}
          {pairedDevices.length ? <div className="paired-device-list">{pairedDevices.map((device) => <div className="row-between" key={device.id}><span><Icon name="laptop_windows" size={18} /><span><strong>{device.name}</strong><small>{device.lastSeenAt ? `Seen ${formatRelativeTime(device.lastSeenAt)}` : 'Waiting for first scan'}</small></span></span><button disabled={revokeMutation.isPending} onClick={() => revokeMutation.mutate(device.id)} type="button">Revoke</button></div>)}</div> : null}
        </article>

        <article className="surface-card scan-sources-card">
          <div className="card-heading-row"><span className="card-icon violet"><Icon name="manage_search" /></span><span><strong>Scan sources</strong><small>Open a source, then press “Scan current page” in the extension.</small></span></div>
          <a href="https://myaccount.google.com/connections" rel="noreferrer" target="_blank"><span className="source-mark google">G</span><span><strong>Google connected apps</strong><small>Exact account inventory from the page DOM</small></span><Icon name="open_in_new" size={18} /></a>
          <a href={gmailDiscoveryUrl} rel="noreferrer" target="_blank"><span className="source-mark gmail"><Icon name="mail" size={20} /></span><span><strong>Gmail discovery search</strong><small>Invoices, trials, grants, renewals, and cancellations</small></span><Icon name="open_in_new" size={18} /></a>
          <div className="privacy-note"><Icon name="shield" size={19} /><p><strong>Evidence minimization</strong><small>The scanner sends app names, email subject/sender/snippet, and matching plan lines—not passwords, cookies, full messages, or full page contents.</small></p></div>
        </article>
      </section>

      {connectionsQuery.isError ? <QueryFeedback actionLabel="Try again" message={connectionsQuery.error.message} onAction={() => void connectionsQuery.refetch()} title="Discovery data could not be loaded" tone="error" /> : null}

      <section className="discovery-workspace">
        <div className="discovery-toolbar"><div><h2>Discovered accounts</h2><p>Provider dashboard evidence overrides Gmail; Gmail overrides a Google connection-only record.</p></div><label className="search-field"><Icon name="search" size={19} /><input aria-label="Search discovered accounts" onChange={(event) => setSearch(event.target.value)} placeholder="Search tools or domains" type="search" value={search} /></label></div>
        <div className="filter-pills discovery-filters" role="group" aria-label="Discovery status">{statusFilters.map((status) => <button aria-pressed={statusFilter === status} className={statusFilter === status ? 'active' : ''} key={status} onClick={() => setStatusFilter(status)} type="button">{formatStatus(status)}</button>)}</div>

        {connectionsQuery.isPending ? <div className="discovered-tool-grid" role="status">{[1, 2, 3].map((item) => <div className="discovered-tool-card data-skeleton" key={item} />)}</div> : null}
        {connectionsQuery.isSuccess && tools.length === 0 ? <QueryFeedback message="Pair the extension, scan the Google connections page, then scan the Gmail discovery results. Nothing is treated as paid until evidence supports it." title="No accounts scanned yet" /> : null}
        {visibleTools.length ? <div className="discovered-tool-grid">{visibleTools.map((tool) => <DiscoveredToolCard key={tool.id} onStatusChange={(status) => statusMutation.mutate({ id: tool.id, status })} tool={tool} />)}</div> : null}
      </section>

      {data?.jobs.length ? <section className="surface-card scan-history"><div className="card-heading-row"><span className="card-label">Recent scans</span><span className="metric-caption">Persisted audit trail</span></div>{data.jobs.map((job) => <div className="row-between" key={job.id}><span><Icon name={sourceIcon(job.source)} size={18} /><span><strong>{formatSource(job.source)}</strong><small>{formatRelativeTime(job.startedAt)}</small></span></span><span className={`job-state ${job.status}`}>{job.status === 'completed' ? `${job.recordsFound} records` : job.status}</span></div>)}</section> : null}
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return <article className="stat-card connection-stat"><span className="card-icon cyan"><Icon name={icon} /></span><span><small>{label}</small><strong>{value}</strong></span></article>
}

function DiscoveredToolCard({ onStatusChange, tool }: { onStatusChange: (status: ToolStatus) => void; tool: ConnectedTool }) {
  const sources = [...new Set(tool.evidence.map((evidence) => evidence.source))]
  return (
    <article className="discovered-tool-card">
      <div className="discovered-tool-heading"><span className="provider-letter">{tool.displayName.slice(0, 1).toUpperCase()}</span><span><strong>{tool.displayName}</strong><small>{tool.domain ?? tool.accountEmail ?? 'No domain captured'}</small></span><span className={`tool-confidence ${confidenceTone(tool.confidence)}`}>{Math.round(tool.confidence * 100)}%</span></div>
      <div className="evidence-source-list">{sources.length ? sources.map((source) => <span key={source}><Icon name={sourceIcon(source)} size={15} />{formatSource(source)}</span>) : <span>No evidence</span>}</div>
      <div className="tool-plan-row"><span><small>Detected status</small><select aria-label={`Status for ${tool.displayName}`} onChange={(event) => onStatusChange(event.target.value as ToolStatus)} value={tool.status}>{statusOptions.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></span><span><small>Plan</small><strong>{tool.planName ?? 'Not detected'}</strong></span></div>
      <div className="row-between tool-card-footer"><small>{tool.evidence.length} evidence · Last seen {formatRelativeTime(tool.lastDiscoveredAt)}</small>{tool.websiteUrl ? <a aria-label={`Open ${tool.displayName}`} href={tool.websiteUrl} rel="noreferrer" target="_blank"><Icon name="open_in_new" size={17} /></a> : null}</div>
      {tool.evidence.length ? <details><summary>Evidence details</summary><div>{tool.evidence.slice(0, 5).map((evidence) => <p key={evidence.id}><span>{formatSource(evidence.source)}</span><strong>{evidence.title ?? evidence.sender ?? evidence.evidenceType}</strong><small>{evidence.excerpt ?? 'No excerpt stored'}</small></p>)}</div></details> : null}
    </article>
  )
}

function formatPairingCode(code: string) { return `${code.slice(0, 5)}-${code.slice(5)}` }
function formatStatus(status: string) { return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function formatSource(source: string) { return source === 'google_connected_apps' ? 'Google connections' : source === 'provider_dashboard' ? 'Provider dashboard' : source === 'gmail' ? 'Gmail' : 'Manual' }
function sourceIcon(source: string) { return source === 'gmail' ? 'mail' : source === 'provider_dashboard' ? 'verified' : source === 'google_connected_apps' ? 'account_circle' : 'edit_note' }
function confidenceTone(confidence: number) { return confidence >= .9 ? 'high' : confidence >= .6 ? 'medium' : 'low' }
