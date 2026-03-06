export function formatGBP(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100)
}

export function formatGBPFromPence(pence: number): string {
  return formatGBP(pence)
}

export function penceToPounds(pence: number): number {
  return Math.round(pence) / 100
}

export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100)
}
