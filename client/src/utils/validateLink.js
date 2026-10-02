function isValidLink(input) {
  const value = input.trim()
  if (!value) return null
  const cleaned = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const parsed = new URL(cleaned)
    const parts = parsed.hostname.split('.')
    const topLevelDomain = parts[parts.length - 1]
    if (parts.length < 2 || !/^[A-Za-z]{2,}$/.test(topLevelDomain)) return null
    return parsed.href
  } catch {
    return null
  }
}

export default isValidLink
