export function normalizeExternalUrl(value) {
  const trimmed = String(value || '').trim()

  if (!trimmed) return ''

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  let url

  try {
    url = new URL(candidate)
  } catch {
    throw new Error('Enter a valid website URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http:// and https:// links are allowed.')
  }

  return url.href
}

export function safeExternalUrl(value) {
  try {
    return normalizeExternalUrl(value)
  } catch {
    return ''
  }
}
