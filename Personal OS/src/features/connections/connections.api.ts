import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requireSupabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-context'

export type ToolStatus = 'account_only' | 'free' | 'trial' | 'grant' | 'paid' | 'expired' | 'cancelled' | 'unknown'

export interface DiscoveryEvidence {
  id: string
  source: 'google_connected_apps' | 'gmail' | 'provider_dashboard' | 'manual'
  evidenceType: string
  title: string | null
  sender: string | null
  excerpt: string | null
  evidenceDate: string | null
  statusHint: ToolStatus | null
}

export interface ConnectedTool {
  id: string
  displayName: string
  domain: string | null
  accountEmail: string | null
  category: string
  status: ToolStatus
  planName: string | null
  confidence: number
  websiteUrl: string | null
  lastDiscoveredAt: string
  lastVerifiedAt: string | null
  evidence: DiscoveryEvidence[]
}

export interface ExtensionDevice {
  id: string
  name: string
  lastSeenAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface ScanJob {
  id: string
  source: 'google_connected_apps' | 'gmail' | 'provider_dashboard'
  status: 'running' | 'completed' | 'failed'
  recordsFound: number
  startedAt: string
  errorMessage: string | null
}

export interface ConnectionsData {
  tools: ConnectedTool[]
  devices: ExtensionDevice[]
  jobs: ScanJob[]
}

interface ToolRow {
  id: string
  display_name: string
  domain: string | null
  account_email: string | null
  category: string
  status: ToolStatus
  plan_name: string | null
  confidence: number
  website_url: string | null
  last_discovered_at: string
  last_verified_at: string | null
  discovery_evidence: EvidenceRow[] | EvidenceRow | null
}

interface EvidenceRow {
  id: string
  source: DiscoveryEvidence['source']
  evidence_type: string
  title: string | null
  sender: string | null
  excerpt: string | null
  evidence_date: string | null
  status_hint: ToolStatus | null
}

interface DeviceRow { id: string; name: string; last_seen_at: string | null; revoked_at: string | null; created_at: string }
interface JobRow { id: string; source: ScanJob['source']; status: ScanJob['status']; records_found: number; started_at: string; error_message: string | null }

export const connectionKeys = { all: (userId: string) => ['connections', userId] as const }

export async function fetchConnectionsData(): Promise<ConnectionsData> {
  const client = requireSupabase()
  const [toolsResult, devicesResult, jobsResult] = await Promise.all([
    client
      .from('connected_tools')
      .select('id,display_name,domain,account_email,category,status,plan_name,confidence,website_url,last_discovered_at,last_verified_at,discovery_evidence(id,source,evidence_type,title,sender,excerpt,evidence_date,status_hint)')
      .is('deleted_at', null)
      .order('last_discovered_at', { ascending: false }),
    client
      .from('extension_devices')
      .select('id,name,last_seen_at,revoked_at,created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    client
      .from('scan_jobs')
      .select('id,source,status,records_found,started_at,error_message')
      .is('deleted_at', null)
      .order('started_at', { ascending: false })
      .limit(8),
  ])

  if (toolsResult.error) throw toolsResult.error
  if (devicesResult.error) throw devicesResult.error
  if (jobsResult.error) throw jobsResult.error

  return {
    tools: ((toolsResult.data ?? []) as ToolRow[]).map((row) => ({
      id: row.id,
      displayName: row.display_name,
      domain: row.domain,
      accountEmail: row.account_email,
      category: row.category,
      status: row.status,
      planName: row.plan_name,
      confidence: Number(row.confidence),
      websiteUrl: row.website_url,
      lastDiscoveredAt: row.last_discovered_at,
      lastVerifiedAt: row.last_verified_at,
      evidence: (Array.isArray(row.discovery_evidence) ? row.discovery_evidence : row.discovery_evidence ? [row.discovery_evidence] : []).map((item) => ({
        id: item.id,
        source: item.source,
        evidenceType: item.evidence_type,
        title: item.title,
        sender: item.sender,
        excerpt: item.excerpt,
        evidenceDate: item.evidence_date,
        statusHint: item.status_hint,
      })),
    })),
    devices: ((devicesResult.data ?? []) as DeviceRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      lastSeenAt: row.last_seen_at,
      revokedAt: row.revoked_at,
      createdAt: row.created_at,
    })),
    jobs: ((jobsResult.data ?? []) as JobRow[]).map((row) => ({
      id: row.id,
      source: row.source,
      status: row.status,
      recordsFound: row.records_found,
      startedAt: row.started_at,
      errorMessage: row.error_message,
    })),
  }
}

async function createPairing(userId: string): Promise<{ code: string; expiresAt: string }> {
  const client = requireSupabase()
  const code = randomPairingCode()
  const codeHash = await sha256(code)
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()
  const { error } = await client.from('extension_pairings').insert({
    user_id: userId,
    code_hash: codeHash,
    expires_at: expiresAt,
  })
  if (error) throw error
  return { code, expiresAt }
}

async function revokeDevice(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('extension_devices').update({ revoked_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

async function updateToolStatus(id: string, status: ToolStatus): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('connected_tools').update({ status, confidence: 1, last_verified_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export function useConnectionsData() {
  const { user } = useAuth()
  return useQuery({
    queryKey: connectionKeys.all(user?.id ?? 'anonymous'),
    queryFn: fetchConnectionsData,
    enabled: Boolean(user),
    staleTime: 30_000,
  })
}

export function useCreateExtensionPairing() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('You must be signed in')
      return createPairing(user.id)
    },
  })
}

export function useRevokeExtensionDevice() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all(user?.id ?? 'anonymous') }),
  })
}

export function useUpdateToolStatus() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ToolStatus }) => updateToolStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all(user?.id ?? 'anonymous') }),
  })
}

function randomPairingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const values = crypto.getRandomValues(new Uint8Array(10))
  return [...values].map((value) => alphabet[value % alphabet.length]).join('')
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
