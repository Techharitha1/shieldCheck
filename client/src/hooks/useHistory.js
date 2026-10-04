import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'
import apiRequest from '../utils/api'

const STORAGE_KEY = 'shieldcheck_history'
const GUEST_KEY = 'shieldcheck_guest_history'
const GUEST_MINUTES = 60

try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

function loadGuest() {
  try {
    const raw = window.sessionStorage.getItem(GUEST_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.items) || Date.now() - data.savedAt > GUEST_MINUTES * 60000) {
      window.sessionStorage.removeItem(GUEST_KEY)
      return []
    }
    return data.items
  } catch {
    return []
  }
}

function saveGuest(items) {
  try {
    window.sessionStorage.setItem(GUEST_KEY, JSON.stringify({ savedAt: Date.now(), items }))
  } catch { /* ignore */ }
}

let guestHistory = loadGuest()
const listeners = new Set()

function setGuestHistory(next) {
  guestHistory = next
  saveGuest(next)
  listeners.forEach((listener) => listener(guestHistory))
}

function useHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState(() => (user ? [] : guestHistory))
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')

  const normalize = useCallback((item) => ({ ...item, date: item.checkedAt || item.date, checks: (item.checks || []).map((check) => ({ ...check, score: check.safety ?? check.score })) }), [])

  useEffect(() => {
    let active = true
    setError('')
    if (user) {
      setLoading(true)
      apiRequest('/api/history').then(({ items }) => {
        if (active) setHistory((items || []).map(normalize))
      }).catch((loadError) => {
        if (active) setError(loadError.message)
      }).finally(() => { if (active) setLoading(false) })
      return () => { active = false }
    }
    setLoading(false)
    setHistory(guestHistory)
    const sync = (next) => setHistory(next)
    listeners.add(sync)
    return () => { active = false; listeners.delete(sync) }
  }, [normalize, user])

  const getHistory = useCallback(() => history, [history])

  const addResult = useCallback((result) => {
    if (user) return result
    const results = Array.isArray(result) ? result : [result]
    const savedResults = results.map((item) => ({ ...item, id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }))
    const savedIds = new Set(savedResults.map((item) => item.id))
    setGuestHistory([...savedResults, ...guestHistory.filter((item) => !savedIds.has(item.id))].slice(0, 20))
    return Array.isArray(result) ? savedResults : savedResults[0]
  }, [user])

  const getById = useCallback(async (id) => {
    if (!user) return guestHistory.find((item) => item.id === id)
    const { item } = await apiRequest(`/api/history/${encodeURIComponent(id)}`)
    return normalize(item)
  }, [normalize, user])

  const deleteResult = useCallback(async (id) => {
    try {
      if (user) {
        await apiRequest(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE' })
        setHistory((current) => current.filter((item) => item.id !== id))
      } else setGuestHistory(guestHistory.filter((item) => item.id !== id))
    } catch (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }
  }, [user])

  const clearHistory = useCallback(async () => {
    try {
      if (user) { await apiRequest('/api/history', { method: 'DELETE' }); setHistory([]) }
      else setGuestHistory([])
    } catch (clearError) {
      setError(clearError.message)
      throw clearError
    }
  }, [user])

  return { history, loading, error, getHistory, addResult, getById, deleteResult, clearHistory }
}

export { STORAGE_KEY }
export default useHistory