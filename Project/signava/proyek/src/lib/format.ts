const numberFormatter = new Intl.NumberFormat("id-ID")

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatRupiah(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return dateFormatter.format(date)
}
