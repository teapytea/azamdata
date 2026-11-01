export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(amountMinor / 100)
}

export function formatCompactMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amountMinor / 100)
}

export function formatRelativeTime(value: string | null): string {
  if (!value) return 'Never synced'

  const elapsedMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(elapsedMs / 60_000))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.floor(hours / 24)}d ago`
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function formatCountdown(value: string | null): string {
  if (!value) return 'No reset scheduled'

  const remainingMs = new Date(value).getTime() - Date.now()
  if (remainingMs <= 0) return 'Reset due'

  const totalMinutes = Math.floor(remainingMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`
}
