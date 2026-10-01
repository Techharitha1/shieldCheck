import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import useHistory from '../hooks/useHistory'
import './HistoryPage.css'

function shortUrl(url) { return url.length > 42 ? `${url.slice(0, 39)}...` : url }
function formatDate(value) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function MiniRing({ score, verdict }) { return <svg className={`mini-ring ring-${verdict.toLowerCase()}`} viewBox="0 0 42 42" aria-label={`Risk score ${score}`}><circle className="mini-ring-track" cx="21" cy="21" r="16" /><circle className="mini-ring-value" cx="21" cy="21" r="16" pathLength="100" strokeDasharray={`${score} ${100 - score}`} /><text x="21" y="23" textAnchor="middle">{score}</text></svg> }

function HistoryPage() {
  const { history, deleteResult, clearHistory } = useHistory()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Safe', 'Suspicious', 'Risky']
  const visible = useMemo(() => history.filter((item) => (filter === 'All' || item.verdict === filter) && item.url.toLowerCase().includes(search.toLowerCase())), [filter, history, search])
  const handleClear = () => { if (window.confirm('Clear all saved checks?')) clearHistory() }
  return <div className="app-shell history-shell"><Navbar /><main className="history-page"><div className="history-container"><div className="history-heading"><div><p className="eyebrow">Your checks</p><h1>History</h1><p>Review links you have checked before.</p></div><button className="button button-secondary clear-button" type="button" onClick={handleClear} disabled={!history.length}>Clear all</button></div><div className="history-toolbar"><label className="history-search"><span aria-hidden="true">&#9906;</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search checked links" aria-label="Search checked links" /></label><div className="filter-chips" role="group" aria-label="Filter history">{filters.map((item) => <button type="button" className={filter === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div>{visible.length ? <div className="history-grid">{visible.map((item, index) => <article className="history-card" style={{ '--history-delay': `${index * 70}ms` }} key={item.id}><MiniRing score={item.riskScore} verdict={item.verdict} /><div className="history-card-copy"><span className={`history-verdict verdict-${item.verdict.toLowerCase()}`}>{item.verdict}</span><h2 title={item.url}>{shortUrl(item.url)}</h2><time dateTime={item.date}>{formatDate(item.date)}</time></div><div className="history-card-actions"><Link className="button button-primary" to={`/result/${item.id}`}>View result</Link><button className="delete-button" type="button" aria-label={`Delete ${item.url}`} onClick={() => deleteResult(item.id)}>&#128465;</button></div></article>)}</div> : <div className="history-empty"><div className="empty-shield" aria-hidden="true">&#10003;</div><h2>No checks yet</h2><p>Your saved link checks will appear here.</p><Link className="button button-primary" to="/">Check a link <span aria-hidden="true">&#8594;</span></Link></div>}</div></main><Footer /></div>
}
export default HistoryPage
