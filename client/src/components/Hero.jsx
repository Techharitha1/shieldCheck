import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShieldAnimation from './ShieldAnimation'
import './Hero.css'

function Hero() {
  const navigate = useNavigate()
  const [invalid, setInvalid] = useState(false)
  const handleSubmit = (event) => {
    event.preventDefault()
    const value = event.currentTarget.elements.target.value.trim()
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
    let valid = false
    try {
      const parsed = new URL(candidate)
      valid = Boolean(parsed.hostname && parsed.hostname.includes('.') && !parsed.hostname.startsWith('.') && !parsed.hostname.endsWith('.'))
    } catch {
      valid = false
    }
    if (!valid) {
      setInvalid(true)
      window.setTimeout(() => setInvalid(false), 550)
      return
    }
    navigate(`/result?url=${encodeURIComponent(candidate)}`)
  }
  return <section className="hero" id="home"><div className="container hero-grid">
    <div className="hero-copy reveal is-visible"><div className="hero-badge"><span className="badge-dot" /> Free for students</div><h1>Check before<br /><span>you trust.</span></h1><p className="hero-subtitle">ShieldCheck helps you spot risky links, files, and accounts before they become a problem.</p><form className={`check-form ${invalid ? 'input-shake' : ''}`} onSubmit={handleSubmit}><label className="sr-only" htmlFor="target">Link, file or account to check</label><input id="target" name="target" placeholder="Paste a link, e.g. https://example.com" aria-invalid={invalid} onChange={() => setInvalid(false)} /><button className="button button-primary" type="submit">Check now <span aria-hidden="true">&#8594;</span></button></form>{invalid && <p className="input-error" role="alert">Enter a valid link, e.g. https://example.com</p>}<div className="trust-note"><span className="lock-icon" aria-hidden="true">&#10003;</span> Private by design <span className="note-divider" /> No account needed</div><div className="signal-strip" aria-label="ShieldCheck service status"><div><strong>0.8s</strong><span>avg. scan</span></div><span className="signal-divider" /><div><strong>99.9%</strong><span>coverage</span></div><span className="signal-divider" /><div className="signal-live"><i /> Live protection</div></div><div className="protection-activity" aria-label="Active protection checks"><span className="activity-label">Protecting</span><span className="activity-pill"><i /> Links</span><span className="activity-pill"><i /> Files</span><span className="activity-pill"><i /> Accounts</span></div><div className="hero-brand-stamp"><svg viewBox="0 0 32 36" aria-hidden="true"><path d="M16 2 28 6v9c0 8.4-5.1 15.2-12 18C9.1 30.2 4 23.4 4 15V6l12-4Z" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="m10.5 17 3.4 3.4 7.7-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>ShieldCheck <small>trust, verified</small></span></div></div>
    <ShieldAnimation scanState="idle" />
  </div></section>
}
export default Hero
