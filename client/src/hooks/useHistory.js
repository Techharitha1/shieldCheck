import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'
import apiRequest from '../utils/api'

const STORAGE_KEY = 'shieldcheck_history'

function readStoredHistory() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function useHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState(readStoredHistory)
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
    } else {
      setLoading(false)
      setHistory(readStoredHistory())
    }
    const sync = () => setHistory(readStoredHistory())
    if (!user) window.addEventListener('shieldcheck_history_updated', sync)
    return () => { active = false; window.removeEventListener('shieldcheck_history_updated', sync) }
  }, [normalize, user])
  const writeHistory = useCallback((nextHistory) => {
    setHistory(nextHistory)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
    window.dispatchEvent(new Event('shieldcheck_history_updated'))
  }, [])
  const getHistory = useCallback(() => history, [history])
  const addResult = useCallback((result) => {
    if (user) return result
    const results = Array.isArray(result) ? result : [result]
    const savedResults = results.map((item) => ({ ...item, id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }))
    const savedIds = new Set(savedResults.map((item) => item.id))
    const next = [...savedResults, ...history.filter((item) => !savedIds.has(item.id))].slice(0, 20)
    writeHistory(next)
    return Array.isArray(result) ? savedResults : savedResults[0]
  }, [history, user, writeHistory])
  const getById = useCallback(async (id) => {
    if (!user) return history.find((item) => item.id === id)
    const { item } = await apiRequest(`/api/history/${encodeURIComponent(id)}`)
    return normalize(item)
  }, [history, normalize, user])
  const deleteResult = useCallback(async (id) => {
    try {
      if (user) {
        await apiRequest(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE' })
        setHistory((current) => current.filter((item) => item.id !== id))
      } else writeHistory(history.filter((item) => item.id !== id))
    } catch (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }
  }, [history, user, writeHistory])
  const clearHistory = useCallback(async () => {
    try {
      if (user) { await apiRequest('/api/history', { method: 'DELETE' }); setHistory([]) }
      else writeHistory([])
    } catch (clearError) {
      setError(clearError.message)
      throw clearError
    }
  }, [user, writeHistory])
  return { history, loading, error, getHistory, addResult, getById, deleteResult, clearHistory }
}

export { STORAGE_KEY }
export default useHistory
