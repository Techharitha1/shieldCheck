import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StatCard from '../components/StatCard'
import SafetyRing from '../components/SafetyRing'
import ActivityChart from '../components/ActivityChart'
import VerdictDonut from '../components/VerdictDonut'
import RecentChecks from '../components/RecentChecks'
import ThreatWatch from '../components/ThreatWatch'
import TipCard from '../components/TipCard'
import useHistory from '../hooks/useHistory'
import useAuth from '../hooks/useAuth'
import analyzeUrl from '../utils/analyzeUrl'
import './DashboardPage.css'
import CollapsibleSection from '../components/CollapsibleSection'

function dayKey(date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` }
function DashboardPage() {
  const { history, loading, error, addResult, clearHistory } = useHistory()
  const { user } = useAuth()
  const [today] = useState(() => new Date())
  const total = history.length
  const counts = { safe: history.filter((item) => item.verdict === 'Safe').length, suspicious: history.filter((item) => item.verdict === 'Suspicious').length, risky: history.filter((item) => item.verdict === 'Risky').length }
  const activity = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index)); return { key: dayKey(date), label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), count: history.filter((item) => dayKey(new Date(item.date)) === dayKey(date)).length } }), [history, today])
  const safetyScore = total ? Math.round(history.reduce((sum, item) => sum + (100 - item.riskScore), 0) / total) : 0
  const loadSamples = () => { const urls = ['https://google.com', 'https://github.com', 'https://youtube.com', 'https://microsoft.com', 'http://old-news.example.com', 'https://free-prize.example.com', 'https://verify-login.example.com', 'https://new-store.example.com']; const samples = urls.map((url, index) => { const result = analyzeUrl(url); const date = new Date(); date.setDate(date.getDate() - (index % 7)); date.setHours(9 + index, 15, 0, 0); return { ...result, id: `demo-${index}-${url}`, date: date.toISOString() } }); addResult(samples) }
  const clear = () => { if (window.confirm('Clear all dashboard data?')) clearHistory() }
  return <div className="app-shell dashboard-shell"><Navbar /><main className="dashboard-page"><div className="dashboard-container"><header className="dashboard-header"><div><p className="eyebrow">Dashboard</p><h1>Your security overview</h1><p>{today.toLocaleDateString(undefined, { dateStyle: 'full' })}</p></div><div className="dashboard-actions"><Link to="/" className="button button-primary">Check a link <span aria-hidden="true">?</span></Link><button className="button button-secondary" type="button" onClick={clear} disabled={!history.length}>Clear data</button></div></header>{loading ? <section className="dashboard-empty"><p>Loading your checks...</p></section> : error ? <section className="dashboard-empty"><h2>History unavailable</h2><p>{error}</p></section> : total === 0 ? <section className="dashboard-empty"><div className="empty-shield-large" aria-hidden="true"><svg viewBox="0 0 64 72"><path d="M32 3 57 12v19c0 21-10 30-25 38C17 61 7 52 7 31V12L32 3Z" /><path d="m18 36 9 9 19-20" /></svg></div><h2>Your dashboard is ready</h2><p>Check a link or load sample data to see your security overview.</p><div className="empty-actions">{!user && <button className="button button-primary" type="button" onClick={loadSamples}>Load sample data</button>}<Link to="/" className="button button-secondary">Try a demo</Link></div></section> : <><section className="stats-grid"><StatCard label="Total checks" value={total} tone="checks" icon="checks" /><StatCard label="Safe" value={counts.safe} tone="safe" icon="safe" /><StatCard label="Suspicious" value={counts.suspicious} tone="suspicious" icon="suspicious" /><StatCard label="Risky" value={counts.risky} tone="risky" icon="risky" /></section><section className="dashboard-chart-grid"><SafetyRing percentage={safetyScore} /><ActivityChart data={activity} /><VerdictDonut counts={counts} /><CollapsibleSection title="Threat watch"><ThreatWatch history={history} /></CollapsibleSection><CollapsibleSection title="Security tip"><TipCard /></CollapsibleSection></section><RecentChecks history={history} /></>}</div></main><Footer /></div>
}
export default DashboardPage
