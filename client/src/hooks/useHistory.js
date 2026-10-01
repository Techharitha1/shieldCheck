import { useCallback, useEffect, useState } from 'react'

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
  const [history, setHistory] = useState(readStoredHistory)
  useEffect(() => {
    const sync = () => setHistory(readStoredHistory())
    window.addEventListener('shieldcheck_history_updated', sync)
    return () => window.removeEventListener('shieldcheck_history_updated', sync)
  }, [])
  const writeHistory = useCallback((nextHistory) => {
    setHistory(nextHistory)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
    window.dispatchEvent(new Event('shieldcheck_history_updated'))
  }, [])
  const getHistory = useCallback(() => history, [history])
  const addResult = useCallback((result) => {
    const results = Array.isArray(result) ? result : [result]
    const savedResults = results.map((item) => ({ ...item, id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }))
    const savedIds = new Set(savedResults.map((item) => item.id))
    const next = [...savedResults, ...history.filter((item) => !savedIds.has(item.id))].slice(0, 20)
    writeHistory(next)
    return Array.isArray(result) ? savedResults : savedResults[0]
  }, [history, writeHistory])
  const getById = useCallback((id) => history.find((item) => item.id === id), [history])
  const deleteResult = useCallback((id) => writeHistory(history.filter((item) => item.id !== id)), [history, writeHistory])
  const clearHistory = useCallback(() => writeHistory([]), [writeHistory])
  return { history, getHistory, addResult, getById, deleteResult, clearHistory }
}

export { STORAGE_KEY }
export default useHistory
