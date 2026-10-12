import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShieldAnimation from './ShieldAnimation'
import isValidLink from '../utils/validateLink'
import './Hero.css'

const MAX_MESSAGE = 2000

function Hero() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('link')
  const [invalid, setInvalid] = useState(false)
  const [message, setMessage] = useState('')

  const shake = () => {
    setInvalid(true)
    window.setTimeout(() => setInvalid(false), 550)
  }

  const handleLink = (event) => {
    event.preventDefault()
    const cleanedLink = isValidLink(event.currentTarget.elements.target.value)
    if (!cleanedLink) {
      shake()
      return
    }
    navigate(`/result?url=${encodeURIComponent(cleanedLink)}`)
  }

  const handleMessage = (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text) {
      shake()
      return
    }
    navigate('/message-result', { state: { message: text } })
  }

  const switchMode = (next) => {
    setMode(next)
    setInvalid(false)
  }

  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-copy reveal is-visible">
          <h1>Check before<br /><span>you trust.</span></h1>
          <p className="hero-subtitle">ShieldCheck helps you spot risky links and scam messages before they become a problem.</p>

          <div className="check-tabs" role="tablist" aria-label="What do you want to check?">
            <button type="button" role="tab" aria-selected={mode === 'link'} className={`check-tab ${mode === 'link' ? 'is-active' : ''}`} onClick={() => switchMode('link')}>Check a link</button>
            <button type="button" role="tab" aria-selected={mode === 'message'} className={`check-tab ${mode === 'message' ? 'is-active' : ''}`} onClick={() => switchMode('message')}>Check a message</button>
          </div>

          {mode === 'link' ? (
            <>
              <form className={`check-form ${invalid ? 'input-shake' : ''}`} onSubmit={handleLink}>
                <label className="sr-only" htmlFor="target">Link to check</label>
                <input id="target" name="target" placeholder="Paste a link, e.g. https://example.com" aria-invalid={invalid} onChange={() => setInvalid(false)} />
                <button className="button button-primary" type="submit">Check now <span aria-hidden="true">{'\u2192'}</span></button>
              </form>
              {invalid && <p className="input-error" role="alert">Enter a full link, e.g. myntra.com</p>}
            </>
          ) : (
            <>
              <form className={`message-form ${invalid ? 'input-shake' : ''}`} onSubmit={handleMessage}>
                <label className="sr-only" htmlFor="message">Message to check</label>
                <textarea id="message" name="message" maxLength={MAX_MESSAGE} value={message} placeholder="Paste an SMS or WhatsApp message you are unsure about" aria-invalid={invalid} onChange={(event) => { setMessage(event.target.value); setInvalid(false) }} />
                <div className="message-form-footer">
                  <span className="message-count">{message.length} / {MAX_MESSAGE}</span>
                  <button className="button button-primary" type="submit">Check message <span aria-hidden="true">{'\u2192'}</span></button>
                </div>
              </form>
              {invalid && <p className="input-error" role="alert">Paste a message to check.</p>}
            </>
          )}

          <div className="trust-note"><span className="lock-icon" aria-hidden="true">{'\u2713'}</span> Private by design <span className="note-divider" /> No account needed</div>
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