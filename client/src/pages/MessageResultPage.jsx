import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import apiRequest from '../utils/api'
import './MessageResultPage.css'

const pending = new Map()

function checkMessage(message) {
  if (!pending.has(message)) {
    pending.set(message, apiRequest('/api/check-message', { method: 'POST', body: { message } }))
    window.setTimeout(() => pending.delete(message), 10000)
  }
  return pending.get(message)
}

const COPY = {
  Safe: {
    tone: 'safe',
    title: 'No scam signs found',
    text: 'We found no scam wording and no risky links. Stay careful, because no tool is 100% accurate.',
  },
  Suspicious: {
    tone: 'warn',
    title: 'Be careful with this message',
    text: 'This message has some warning signs. It may be genuine, but do not act on it until you confirm the sender.',
  },
  Risky: {
    tone: 'risk',
    title: 'This message looks like a scam',
    text: 'It matches patterns scammers commonly use. Do not click its links or share any details.',
  },
}

const toneOf = (verdict) => (COPY[verdict] ? COPY[verdict].tone : 'warn')

function CheckIcon() {
  return (
    <svg className="msg-icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6 10.3 2.8 2.8L14.2 7.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg className="msg-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.5 18 16.5H2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 8v4M10 14.2v.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function Ring({ score }) {
  const circumference = 226.2
  const offset = circumference * (1 - score / 100)
  return (
    <div className="msg-ring" role="img" aria-label={`Safety score ${score} out of 100`}>
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <circle className="msg-ring-track" cx="44" cy="44" r="36" fill="none" strokeWidth="8" />
        <circle
          className="msg-ring-fill"
          cx="44" cy="44" r="36" fill="none" strokeWidth="8"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="msg-ring-text"><b>{score}</b><small>/100</small></div>
    </div>
  )
}

function linkNote(link) {
  const worst = [...(link.checks || [])].sort((a, b) => a.safety - b.safety)[0]
  if (!worst || worst.status === 'pass') return 'No warning signs found in this link.'
  return worst.explanation
}

function Shell({ children }) {
  return (
    <div className="app-shell result-shell">
      <Navbar />
      <main className="msg-page"><div className="container msg-container">{children}</div></main>
      <Footer />
    </div>
  )
}

function MessageResultPage() {
  const location = useLocation()
  const message = location.state && location.state.message
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!message) return undefined
    let active = true
    setData(null)
    setError('')
    checkMessage(message)
      .then((result) => { if (active) setData(result) })
      .catch((err) => { if (active) setError(err.message || 'Something went wrong. Please try again.') })
    return () => { active = false }
  }, [message])

  if (!message) return <Navigate replace to="/" />

  if (error) {
    return (
      <Shell>
        <div className="msg-state">
          <h1>We couldn't check that message</h1>
          <p>{error}</p>
          <Link className="button button-primary" to="/">Try again</Link>
        </div>
      </Shell>
    )
  }

  if (!data) {
    return (
      <Shell>
        <div className="msg-state" role="status">
          <div className="msg-spinner" />
          <h1>Checking your message...</h1>
          <p>Reading the wording and checking each link. This can take a few seconds.</p>
        </div>
      </Shell>
    )
  }

  const copy = COPY[data.verdict] || COPY.Suspicious
  const safety = 100 - data.riskScore
  const advice = [...new Set(data.recommendations || [])]

  return (
    <Shell>
      <section className="msg-banner" data-tone={copy.tone}>
        <Ring score={safety} />
        <div>
          <p className="eyebrow">Message check</p>
          <h1>{copy.title}</h1>
          <p className="msg-banner-text">{copy.text}</p>
        </div>
      </section>

      <section className="msg-card">
        <h2>Why we flagged it</h2>
        {data.signals.length === 0 ? (
          <p className="msg-empty">No scam wording found in this message.</p>
        ) : (
          <ul className="msg-list">
            {data.signals.map((signal) => (
              <li key={signal.id} className="msg-signal">
                <WarnIcon />
                <div>
                  <strong>{signal.label}</strong>
                  <span>{`"${signal.phrase}"`}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="msg-card">
        <h2>Links in this message</h2>
        {data.links.length === 0 ? (
          <p className="msg-empty">No links found in this message.</p>
        ) : (
          <ul className="msg-list">
            {data.links.map((link) => (
              <li key={link.url} className="msg-link" data-tone={toneOf(link.verdict)}>
                <div className="msg-link-main">
                  <strong>{link.host}</strong>
                  <span>{linkNote(link)}</span>
                </div>
                <div className="msg-link-score"><b>{100 - link.riskScore}</b><small>/100</small></div>
                <span className="msg-badge">{link.verdict}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="msg-note">We check up to 5 links per message.</p>
      </section>

      <section className="msg-card">
        <h2>What you should do</h2>
        <ul className="msg-list">
          {advice.map((item) => (
            <li key={item} className="msg-advice"><CheckIcon /><span>{item}</span></li>
          ))}
        </ul>
      </section>

      <div className="msg-actions">
        <Link className="button button-primary" to="/">Check another</Link>
      </div>
      <p className="msg-disclaimer">Your message is not saved. No tool is 100% accurate. If you are unsure, do not enter passwords or payment details.</p>
    </Shell>
  )
}

export default MessageResultPage