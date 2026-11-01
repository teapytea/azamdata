import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requireSupabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-context'

export interface QuotaProvider {
  id: string
  name: string
  providerKey: string
  fetchMethod: 'api' | 'local_agent' | 'manual'
  lastSyncedAt: string | null
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed'
  syncError: string | null
  snapshots: QuotaSnapshot[]
}

export interface QuotaSnapshot {
  id: string
  remaining: number
  limit: number | null
  unit: string
  windowType: string
  resetsAt: string | null
  expiresAt: string | null
  measuredAt: string
}

export interface QuotaProviderInput {
  name: string
  providerKey: string
  fetchMethod: QuotaProvider['fetchMethod']
}

export interface QuotaSnapshotInput {
  providerId: string
  remaining: number
  limit: number | null
  unit: string
  windowType: string
  resetsAt: string | null
  expiresAt: string | null
}

interface ProviderRow {
  id: string; name: string; provider_key: string; fetch_method: QuotaProvider['fetchMethod']; last_synced_at: string | null; sync_status: QuotaProvider['syncStatus']; sync_error: string | null
}
interface SnapshotRow {
  id: string; provider_id: string; remaining: number; quota_limit: number | null; unit: string; window_type: string; resets_at: string | null; expires_at: string | null; measured_at: string
}

export const quotaKeys = { all: (userId: string) => ['quotas', userId] as const }

export async function fetchQuotaProviders(): Promise<QuotaProvider[]> {
  const client = requireSupabase()
  const [providersResult, snapshotsResult] = await Promise.all([
    client.from('quota_providers').select('id,name,provider_key,fetch_method,last_synced_at,sync_status,sync_error').is('deleted_at', null).order('name'),
    client.from('quota_snapshots').select('id,provider_id,remaining,quota_limit,unit,window_type,resets_at,expires_at,measured_at').is('deleted_at', null).order('measured_at', { ascending: false }).limit(200),
  ])

  if (providersResult.error) throw providersResult.error
  if (snapshotsResult.error) throw snapshotsResult.error

  const snapshotsByProvider = new Map<string, QuotaSnapshot[]>()
  for (const row of (snapshotsResult.data ?? []) as SnapshotRow[]) {
    const snapshots = snapshotsByProvider.get(row.provider_id) ?? []
    if (!snapshots.some((snapshot) => snapshot.windowType === row.window_type)) {
      snapshots.push({
        id: row.id,
        remaining: Number(row.remaining),
        limit: row.quota_limit === null ? null : Number(row.quota_limit),
        unit: row.unit,
        windowType: row.window_type,
        resetsAt: row.resets_at,
        expiresAt: row.expires_at,
        measuredAt: row.measured_at,
      })
    }
    snapshotsByProvider.set(row.provider_id, snapshots)
  }

  return ((providersResult.data ?? []) as ProviderRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    providerKey: row.provider_key,
    fetchMethod: row.fetch_method,
    lastSyncedAt: row.last_synced_at,
    syncStatus: row.sync_status,
    syncError: row.sync_error,
    snapshots: snapshotsByProvider.get(row.id) ?? [],
  }))
}

async function createQuotaProvider(userId: string, input: QuotaProviderInput): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('quota_providers').insert({
    user_id: userId,
    name: input.name.trim(),
    provider_key: input.providerKey.trim().toLowerCase().replace(/\s+/g, '-'),
    fetch_method: input.fetchMethod,
  })
  if (error) throw error
}

async function createQuotaSnapshot(userId: string, input: QuotaSnapshotInput): Promise<void> {
  const client = requireSupabase()
  const now = new Date().toISOString()
  const snapshotResult = await client.from('quota_snapshots').insert({
    user_id: userId,
    provider_id: input.providerId,
    remaining: input.remaining,
    quota_limit: input.limit,
    unit: input.unit,
    window_type: input.windowType,
    resets_at: input.resetsAt,
    expires_at: input.expiresAt,
    measured_at: now,
  })
  if (snapshotResult.error) throw snapshotResult.error

  const providerResult = await client
    .from('quota_providers')
    .update({ last_synced_at: now, sync_status: 'success', sync_error: null })
    .eq('id', input.providerId)
  if (providerResult.error) throw providerResult.error
}

export function useQuotaProviders() {
  const { user } = useAuth()
  return useQuery({ queryKey: quotaKeys.all(user?.id ?? 'anonymous'), queryFn: fetchQuotaProviders, enabled: Boolean(user), staleTime: 5 * 60_000 })
}

export function useCreateQuotaProvider() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: QuotaProviderInput) => {
      if (!user) throw new Error('You must be signed in')
      return createQuotaProvider(user.id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotaKeys.all(user?.id ?? 'anonymous') }),
  })
}

export function useCreateQuotaSnapshot() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: QuotaSnapshotInput) => {
      if (!user) throw new Error('You must be signed in')
      return createQuotaSnapshot(user.id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotaKeys.all(user?.id ?? 'anonymous') }),
  })
}
