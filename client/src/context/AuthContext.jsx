import { createContext, useEffect, useState } from 'react'
import apiRequest, { TOKEN_KEY } from '../utils/api'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setAuthLoading(false); return undefined }
    apiRequest('/api/auth/me', { token }).then(({ user: nextUser }) => setUser(nextUser)).catch(() => {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }).finally(() => setAuthLoading(false))
    return undefined
  }, [])

  const saveAuth = ({ token, user: nextUser }) => {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(nextUser)
    return nextUser
  }
  const signup = async ({ name, email, password }) => saveAuth(await apiRequest('/api/auth/signup', { method: 'POST', body: { name, email, password }, token: null }))
  const login = async ({ email, password }) => saveAuth(await apiRequest('/api/auth/login', { method: 'POST', body: { email, password }, token: null }))
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null) }
  return <AuthContext.Provider value={{ user, authLoading, signup, login, logout }}>{children}</AuthContext.Provider>
}
export { AuthContext, AuthProvider }
