import { useEffect, useState } from 'react'
import './ScoreRing.css'

function ScoreRing({ score }) { const [value, setValue] = useState(0); useEffect(() => { let frame; const start = performance.now(); const tick = (now) => { const progress = Math.min((now - start) / 900, 1); setValue(Math.round(score * progress)); if (progress < 1) frame = requestAnimationFrame(tick) }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame) }, [score]); const rating = score >= 80 ? 'Expert' : score >= 50 ? 'Aware' : 'Beginner'; return <div className="quiz-score-ring"><div className="score-ring-graphic"><svg viewBox="0 0 150 150"><circle className="score-ring-track" cx="75" cy="75" r="58" /><circle className="score-ring-progress" cx="75" cy="75" r="58" pathLength="100" strokeDasharray={`${value} ${100 - value}`} /></svg><strong>{value}%</strong></div><p className="score-rating">{rating}</p></div> }
export default ScoreRing
