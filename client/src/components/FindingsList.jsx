import './FindingsList.css'

const icons = { pass: '&#10003;', warning: '&#33;', fail: '&#10005;' }
function FindingsList({ checks }) { return <section className="findings-section"><div className="section-heading"><p className="eyebrow">Detailed findings</p><h2>What we found</h2><p>Each check is explained in plain language so you can decide what to do next.</p></div><div className="findings-grid">{checks.map((check, index) => <article className={`finding-card finding-${check.status}`} style={{ '--finding-delay': `${index * 80}ms` }} key={check.name}><div className="finding-icon" dangerouslySetInnerHTML={{ __html: icons[check.status] }} /><div className="finding-copy"><div className="finding-heading"><h3>{check.name}</h3><span className="status-badge">{check.status}</span></div><p>{check.explanation}</p></div><strong className="finding-score">{check.score}</strong></article>)}</div></section> }
export default FindingsList
