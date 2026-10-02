const API_BASE = import.meta.env.VITE_API_URL
const TOKEN_KEY = 'shieldcheck_token'
const checkRequests = new Map()

async function apiRequest(path, options = {}) {
  const { token: explicitToken, body, headers: customHeaders, ...requestOptions } = options
  const token = explicitToken === undefined ? localStorage.getItem(TOKEN_KEY) : explicitToken
  const headers = { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(customHeaders || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

export { TOKEN_KEY }
export function checkLink(url) {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const key = `${url}|${token}`
  const existing = checkRequests.get(key)
  if (existing) return existing.promise

  const promise = apiRequest('/api/check', { method: 'POST', body: { url } })
  const timeout = window.setTimeout(() => checkRequests.delete(key), 10000)
  checkRequests.set(key, { promise, timeout })
  return promise
}
export default apiRequest
