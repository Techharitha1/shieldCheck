import { Link } from 'react-router-dom'
import './ThreatWatch.css'

function shortUrl(url) { return url.length > 37 ? `${url.slice(0, 34)}...` : url }
function ThreatWatch({ history }) { const threats = [...history].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3); return <article className="dashboard-card threat-card"><p className="eyebrow">Threat watch</p><h2>Riskiest links checked</h2>{threats.length ? <div className="threat-list">{threats.map((item) => <Link className="threat-row" to={`/result/${item.id}`} key={item.id}><div className="threat-top"><span title={item.url}>{shortUrl(item.url)}</span><strong>{item.riskScore}</strong></div><div className="threat-track"><span style={{ width: `${item.riskScore}%` }} /></div></Link>)}</div> : <p className="muted-copy">No risky links to watch yet.</p>}</article> }
export default ThreatWatch
