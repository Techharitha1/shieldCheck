import { useEffect, useState } from 'react'
import './RiskGauge.css'

function RiskGauge({ score, trusted }) {
  const [value, setValue] = useState(0)
  useEffect(() => { let frame; const start = performance.now(); const tick = (now) => { const progress = Math.min((now - start) / 1200, 1); setValue(Math.round(score * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) frame = requestAnimationFrame(tick) }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame) }, [score])
  const tone = score >= 70 ? 'safe' : score >= 40 ? 'warning' : 'risk'
  const riskLabel = tone === 'safe' && trusted === false ? 'No threats found' : tone === 'safe' ? 'Safe' : tone === 'warning' ? 'Be careful' : 'Risky'
  const circumference = 251.2
  return <article className={`risk-gauge chart-card tone-${tone}`}><div className="chart-title"><div><p className="eyebrow">Safety score (higher is safer)</p><h2>How safe is it?</h2></div><span className="score-tag">{tone}</span></div><div className="gauge-wrap"><svg viewBox="0 0 220 180" aria-label={`Safety score ${score} out of 100`} role="img"><defs><linearGradient id="safetyGauge" x1="0" x2="1"><stop offset="0" stopColor="#ef4444" /><stop offset="0.5" stopColor="#f59e0b" /><stop offset="1" stopColor="#22c55e" /></linearGradient></defs><path className="gauge-track" d="M30 110a80 80 0 0 1 160 0" pathLength="251.2" /><path className="gauge-progress" d="M30 110a80 80 0 0 1 160 0" pathLength="251.2" style={{ stroke: 'url(#safetyGauge)', strokeDashoffset: circumference - (circumference * value) / 100 }} /><line className="gauge-needle" x1="110" y1="110" x2="110" y2="56" style={{ transform: `rotate(${-90 + value * 1.8}deg)`, transformOrigin: '110px 110px' }} /><circle cx="110" cy="110" r="5" /><text className="gauge-score" x="110" y="148" textAnchor="middle">{value}<tspan>/ 100</tspan></text><text className="gauge-risk-label" x="110" y="168" textAnchor="middle">{riskLabel}</text></svg></div><div className="gauge-labels"><span>Risky</span><span>{riskLabel}</span></div></article>
}
export default RiskGauge
