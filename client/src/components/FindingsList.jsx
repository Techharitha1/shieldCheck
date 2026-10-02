import './FindingsList.css'

function FindingIcon({ status }) {
  const path = status === 'pass' ? 'm5 12 4 4L19 6' : status === 'warning' ? 'M12 5v7m0 4h.01' : 'm7 7 10 10m0-10L7 17'
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg>
}
function FindingsList({ checks }) { return <section className="findings-section"><div className="section-heading"><p className="eyebrow">Detailed findings</p><h2>What we found</h2><p>Each check is explained in plain language so you can decide what to do next.</p></div><div className="findings-grid">{checks.map((check, index) => <article className={`finding-card finding-${check.status}`} style={{ '--finding-delay': `${index * 80}ms` }} key={check.name}><div className="finding-icon"><FindingIcon status={check.status} /></div><div className="finding-copy"><div className="finding-heading"><h3>{check.name}</h3><span className="status-badge">{check.status}</span></div><p>{check.explanation}</p></div><strong className="finding-score">{check.score}</strong></article>)}</div></section> }
export default FindingsList
