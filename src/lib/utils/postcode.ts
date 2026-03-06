export const UK_POSTCODE_REGEX = /^(GIR\s?0AA|[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2})$/i

export function validateUKPostcode(postcode: string): boolean {
  if (!postcode) return false
  const cleaned = postcode.trim().replace(/\s+/g, ' ').toUpperCase()
  return UK_POSTCODE_REGEX.test(cleaned)
}

export function formatPostcode(postcode: string): string {
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '')
  if (cleaned === 'GIR0AA') return 'GIR 0AA'
  if (cleaned.length >= 5) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3)
  }
  return cleaned
}

export function getOutwardCode(postcode: string): string {
  const formatted = formatPostcode(postcode)
  return formatted.split(' ')[0] ?? ''
}

export function getPostcodeArea(postcode: string): string {
  const outward = getOutwardCode(postcode)
  return outward.replace(/[0-9].*/g, '')
}
