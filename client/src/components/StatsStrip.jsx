import { useEffect, useRef, useState } from 'react'
import useHistory from '../hooks/useHistory'
import './StatsStrip.css'

function Count({ target }) { const [value, setValue] = useState(0); const ref = useRef(null); useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) return; let frame; const start = performance.now(); const tick = (now) => { const progress = Math.min((now - start) / 900, 1); setValue(Math.round(target * progress)); if (progress < 1) frame = requestAnimationFrame(tick) }; frame = requestAnimationFrame(tick); observer.disconnect(); return () => cancelAnimationFrame(frame) }, { threshold: 0.7 }); if (ref.current) observer.observe(ref.current); return () => observer.disconnect() }, [target]); return <strong ref={ref}>{value}</strong> }
function StatsStrip() { const { history } = useHistory(); const safe = history.filter((item) => item.verdict === 'Safe').length; const threats = history.filter((item) => item.verdict !== 'Safe').length; return <section className="stats-strip" aria-label="ShieldCheck stats"><div><Count target={history.length} /><span>Checks run</span></div><div><Count target={threats} /><span>Threats found</span></div><div><Count target={safe} /><span>Safe links</span></div></section> }
export default StatsStrip
