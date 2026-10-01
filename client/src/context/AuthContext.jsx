// Temporary front-end only auth. Replace with the real backend later.
import { createContext, useState } from 'react'

const USERS_KEY = 'shieldcheck_users'
const SESSION_KEY = 'shieldcheck_session'
const AuthContext = createContext(null)

function readUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] } }
function readSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null } }
async function hashPassword(password) { const bytes = new TextEncoder().encode(password); const digest = await crypto.subtle.digest('SHA-256', bytes); return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('') }

function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const saveSession = (nextUser) => { const session = { id: nextUser.id, name: nextUser.name, email: nextUser.email }; localStorage.setItem(SESSION_KEY, JSON.stringify(session)); setUser(session) }
  const signup = async ({ name, email, password }) => { const normalizedEmail = email.trim().toLowerCase(); const users = readUsers(); if (users.some((item) => item.email === normalizedEmail)) throw new Error('An account with this email already exists'); const account = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) }; localStorage.setItem(USERS_KEY, JSON.stringify([...users, account])); saveSession(account); return account }
  const login = async ({ email, password }) => { const normalizedEmail = email.trim().toLowerCase(); const passwordHash = await hashPassword(password); const account = readUsers().find((item) => item.email === normalizedEmail && item.passwordHash === passwordHash); if (!account) throw new Error('Email or password is incorrect'); saveSession(account); return account }
  const logout = () => { localStorage.removeItem(SESSION_KEY); setUser(null) }
  return <AuthContext.Provider value={{ user, signup, login, logout }}>{children}</AuthContext.Provider>
}
export { AuthContext, AuthProvider }
