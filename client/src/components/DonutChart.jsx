import { useState } from 'react'
import './DonutChart.css'

function DonutChart({ checks }) {
  const [active, setActive] = useState(null)
  const counts = { pass: checks.filter((check) => check.status === 'pass').length, warning: checks.filter((check) => check.status === 'warning').length, fail: checks.filter((check) => check.status === 'fail').length }
  const segments = [{ key: 'pass', label: 'Passed', color: '#22c55e', count: counts.pass }, { key: 'warning', label: 'Warnings', color: '#f59e0b', count: counts.warning }, { key: 'fail', label: 'Failed', color: '#ef4444', count: counts.fail }]
  let offset = 0
  return <article className="donut-card chart-card"><div className="chart-title"><div><p className="eyebrow">Signal breakdown</p><h2>Check summary</h2></div></div><div className="donut-layout"><div className="donut-wrap"><svg viewBox="0 0 120 120" role="img" aria-label={`${counts.pass} of 6 checks passed`}>{segments.map((segment) => { const dash = (segment.count / checks.length) * 301.6; const segmentOffset = offset; offset += dash; return <circle key={segment.key} className={active === segment.key ? 'donut-segment active' : 'donut-segment'} cx="60" cy="60" r="48" fill="none" stroke={segment.color} strokeWidth="13" pathLength="301.6" strokeDasharray={`${dash} ${301.6 - dash}`} strokeDashoffset={-segmentOffset} onMouseEnter={() => setActive(segment.key)} onMouseLeave={() => setActive(null)} /> })}</svg><div className="donut-center"><strong>{counts.pass}/6</strong><span>passed</span></div></div><div className="donut-legend">{segments.map((segment) => <button type="button" className={active === segment.key ? 'legend-item active' : 'legend-item'} key={segment.key} onMouseEnter={() => setActive(segment.key)} onMouseLeave={() => setActive(null)}><i style={{ background: segment.color }} /> <span>{segment.label}</span><strong>{segment.count}</strong></button>)}</div></div><p className="chart-caption">Number of security checks passed</p></article>
}
export default DonutChart
