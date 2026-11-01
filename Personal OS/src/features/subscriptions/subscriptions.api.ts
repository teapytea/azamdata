import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requireSupabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-context'

export interface Subscription {
  id: string
  name: string
  category: string
  billingCycle: 'monthly' | 'yearly'
  anchorDate: string
  amountMinor: number
  currency: string
  status: 'active' | 'paused' | 'cancelled'
  websiteUrl: string | null
  paymentMethod: {
    name: string
    lastFour: string | null
  } | null
  nextBillingDate: string
}

export interface SubscriptionInput {
  name: string
  category: string
  billingCycle: 'monthly' | 'yearly'
  anchorDate: string
  amountMinor: number
  currency: string
  status: 'active' | 'paused' | 'cancelled'
  websiteUrl?: string | null
}

interface SubscriptionRow {
  id: string
  name: string
  category: string
  billing_cycle: 'monthly' | 'yearly'
  anchor_date: string
  amount_minor: number
  currency: string
  status: 'active' | 'paused' | 'cancelled'
  website_url: string | null
  payment_methods: { name: string; last_four: string | null } | Array<{ name: string; last_four: string | null }> | null
}

export const subscriptionKeys = {
  all: (userId: string) => ['subscriptions', userId] as const,
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('subscriptions')
    .select('id,name,category,billing_cycle,anchor_date,amount_minor,currency,status,website_url,payment_methods(name,last_four)')
    .is('deleted_at', null)
    .order('name')

  if (error) throw error

  return ((data ?? []) as SubscriptionRow[]).map((row) => {
    const paymentMethod = Array.isArray(row.payment_methods) ? row.payment_methods[0] : row.payment_methods
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      billingCycle: row.billing_cycle,
      anchorDate: row.anchor_date,
      amountMinor: Number(row.amount_minor),
      currency: row.currency,
      status: row.status,
      websiteUrl: row.website_url,
      paymentMethod: paymentMethod ? { name: paymentMethod.name, lastFour: paymentMethod.last_four } : null,
      nextBillingDate: calculateNextBillingDate(row.anchor_date, row.billing_cycle),
    }
  })
}

async function createSubscription(userId: string, input: SubscriptionInput): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('subscriptions').insert({
    user_id: userId,
    name: input.name.trim(),
    category: input.category.trim(),
    billing_cycle: input.billingCycle,
    anchor_date: input.anchorDate,
    amount_minor: input.amountMinor,
    currency: input.currency.toUpperCase(),
    status: input.status,
    website_url: input.websiteUrl?.trim() || null,
  })
  if (error) throw error
}

async function updateSubscription(id: string, input: SubscriptionInput): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('subscriptions').update({
    name: input.name.trim(),
    category: input.category.trim(),
    billing_cycle: input.billingCycle,
    anchor_date: input.anchorDate,
    amount_minor: input.amountMinor,
    currency: input.currency.toUpperCase(),
    status: input.status,
    website_url: input.websiteUrl?.trim() || null,
  }).eq('id', id)
  if (error) throw error
}

async function archiveSubscription(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('subscriptions').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export function useSubscriptions() {
  const { user } = useAuth()
  return useQuery({
    queryKey: subscriptionKeys.all(user?.id ?? 'anonymous'),
    queryFn: fetchSubscriptions,
    enabled: Boolean(user),
  })
}

export function useCreateSubscription() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SubscriptionInput) => {
      if (!user) throw new Error('You must be signed in')
      return createSubscription(user.id, input)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all(user?.id ?? 'anonymous') }),
  })
}

export function useUpdateSubscription() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SubscriptionInput }) => updateSubscription(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all(user?.id ?? 'anonymous') }),
  })
}

export function useArchiveSubscription() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all(user?.id ?? 'anonymous') }),
  })
}

export function calculateNextBillingDate(anchorDate: string, billingCycle: 'monthly' | 'yearly', now = new Date()): string {
  const [, anchorMonth, anchorDay] = anchorDate.split('-').map(Number)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (billingCycle === 'yearly') {
    const year = today.getFullYear()
    let candidate = clampedDate(year, anchorMonth - 1, anchorDay)
    if (candidate < today) candidate = clampedDate(year + 1, anchorMonth - 1, anchorDay)
    return toDateInput(candidate)
  }

  let year = today.getFullYear()
  let month = today.getMonth()
  let candidate = clampedDate(year, month, anchorDay)
  if (candidate < today) {
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
    candidate = clampedDate(year, month, anchorDay)
  }

  return toDateInput(candidate)
}

function clampedDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

function toDateInput(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
