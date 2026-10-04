import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShieldAnimation from './ShieldAnimation'
import isValidLink from '../utils/validateLink'
import './Hero.css'

function Hero() {
  const navigate = useNavigate()
  const [invalid, setInvalid] = useState(false)
  const handleSubmit = (event) => {
    event.preventDefault()
    const cleanedLink = isValidLink(event.currentTarget.elements.target.value)
    if (!cleanedLink) {
      setInvalid(true)
      window.setTimeout(() => setInvalid(false), 550)
      return
    }
    navigate(`/result?url=${encodeURIComponent(cleanedLink)}`)
  }
  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-copy reveal is-visible">
          <h1>Check before<br /><span>you trust.</span></h1>
          <p className="hero-subtitle">ShieldCheck helps you spot risky links before they become a problem.</p>
          <form className={`check-form ${invalid ? 'input-shake' : ''}`} onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="target">Link to check</label>
            <input id="target" name="target" placeholder="Paste a link, e.g. https://example.com" aria-invalid={invalid} onChange={() => setInvalid(false)} />
            <button className="button button-primary" type="submit">Check now <span aria-hidden="true">→</span></button>
          </form>
          {invalid && <p className="input-error" role="alert">Enter a full link, e.g. myntra.com</p>}
          <div className="trust-note"><span className="lock-icon" aria-hidden="true">✓</span> Private by design <span className="note-divider" /> No account needed</div>
          <div className="signal-strip" aria-label="What ShieldCheck uses">
            <div><strong>6</strong><span>safety checks</span></div>
            <span className="signal-divider" />
            <div><strong>Google</strong><span>Safe Browsing</span></div>
            <span className="signal-divider" />
            <div className="signal-live"><i /> Live results</div>
          </div>
          <div className="protection-activity" aria-label="What ShieldCheck looks for">
            <span className="activity-label">Looking for</span>
            <span className="activity-pill"><i /> Phishing</span>
            <span className="activity-pill"><i /> Malware</span>
            <span className="activity-pill"><i /> Scam sites</span>
          </div>
          <div className="hero-brand-stamp">
            <svg viewBox="0 0 32 36" aria-hidden="true"><path d="M16 2 28 6v9c0 8.4-5.1 15.2-12 18C9.1 30.2 4 23.4 4 15V6l12-4Z" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="m10.5 17 3.4 3.4 7.7-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>ShieldCheck <small>trust, verified</small></span>
          </div>
        </div>
        <ShieldAnimation scanState="idle" />
      </div>
    </section>
  )
}
export default Hero