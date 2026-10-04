import { useEffect, useRef, useState } from 'react'
import './Footer.css'

const SHOW_VISITORS = true

const API = import.meta.env.VITE_API_URL
const VISITOR_KEY = 'shieldcheck_visitor'
const SENT_KEY = 'shieldcheck_visit_sent'

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12)
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

function Footer() {
  const [total, setTotal] = useState(null)
  const [shown, setShown] = useState(0)
  const [seen, setSeen] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!SHOW_VISITORS) return undefined
    let active = true
    const id = getVisitorId()
    let sent = false
    try { sent = sessionStorage.getItem(SENT_KEY) === '1' } catch { sent = false }
    const request = id && !sent
      ? fetch(`${API}/api/stats/visit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      : fetch(`${API}/api/stats`)
    request
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('stats'))))
      .then((data) => {
        if (!active) return
        if (id && !sent) { try { sessionStorage.setItem(SENT_KEY, '1') } catch { /* ignore */ } }
        if (typeof data.visitors === 'number') setTotal(data.visitors)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const node = cardRef.current
    if (!SHOW_VISITORS || !node) return undefined
    if (!('IntersectionObserver' in window)) { setSeen(true); return undefined }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect() }
    }, { threshold: 0.3 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!SHOW_VISITORS || total === null || !seen) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(total); return undefined }
    let frame
    const start = performance.now()
    const duration = 1600
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setShown(Math.round(total * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [total, seen])

  return (
    <footer className="footer">
      <div className="container">
        {SHOW_VISITORS && (
          <div ref={cardRef} className={`visitor-card ${seen ? 'is-visible' : ''}`}>
            <div className="visitor-icon" aria-hidden="true">
              <span className="visitor-ring" />
              <span className="visitor-orbit" />
              <svg viewBox="0 0 32 36" className="visitor-shield"><path d="M16 2 28 6v9c0 8.4-5.1 15.2-12 18C9.1 30.2 4 23.4 4 15V6l12-4Z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m10.5 17 3.4 3.4 7.7-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div className="visitor-text">
              <span className="visitor-live"><i aria-hidden="true" />Live</span>
              <p className="visitor-number" aria-live="polite">{total === null ? '···' : shown.toLocaleString('en-IN')}</p>
              <p className="visitor-label">people have visited ShieldCheck</p>
            </div>
          </div>
        )}

        <div className="footer-inner">
          <div>
            <a className="footer-brand" href="/">Shield<span>Check</span></a>
            <p>Trust, verified.</p>
          </div>
          <div className="footer-links">
            <a href="/#how-it-works">How it works</a>
            <a href="/learn">Learn</a>
            <a href="/about">About</a>
            <a href="/about#contact">Contact</a>
          </div>
          <p className="copyright">© 2026 ShieldCheck</p>
        </div>
      </div>
    </footer>
  )
}
export default Footer