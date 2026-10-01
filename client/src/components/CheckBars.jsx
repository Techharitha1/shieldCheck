import './CheckBars.css'

function CheckBars({ checks }) { return <article className="bars-card chart-card"><div className="chart-title"><div><p className="eyebrow">Signal confidence</p><h2>Safety by check</h2><p className="chart-caption bars-caption">Safety score for each check</p></div></div><div className="check-bars">{checks.map((check, index) => <div className="bar-row" key={check.name} style={{ '--bar-delay': `${index * 90}ms` }}><div className="bar-meta"><span>{check.name}</span><strong>{check.score}</strong></div><div className="bar-track"><span className={`bar-fill bar-${check.status}`} style={{ width: `${check.score}%` }} /></div></div>)}</div></article> }
export default CheckBars
