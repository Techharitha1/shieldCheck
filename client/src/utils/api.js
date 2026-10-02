const API_BASE = import.meta.env.VITE_API_URL
const TOKEN_KEY = 'shieldcheck_token'

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
export default apiRequest
