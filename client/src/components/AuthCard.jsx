import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import './AuthCard.css'

function AuthCard() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const activeTab = params.get('tab') === 'signup' ? 'signup' : 'login'
  const switchTab = (tab) => setParams({ tab })
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200) }
  const successComplete = () => { setSuccess(true); window.setTimeout(() => navigate('/dashboard'), 800) }
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setResetOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  const openReset = () => { setResetEmail(''); setResetSent(false); setResetOpen(true) }
  return <div className="auth-card"><div className="auth-tabs" role="tablist"><button className={activeTab === 'login' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={activeTab === 'login'} onClick={() => switchTab('login')}>Log in</button><button className={activeTab === 'signup' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={activeTab === 'signup'} onClick={() => switchTab('signup')}>Sign up</button></div>{success ? <div className="auth-success"><div className="success-check">✓</div><h2>You're all set</h2><p>Taking you to your dashboard...</p></div> : <div className="auth-form-panel" key={activeTab}>{activeTab === 'login' ? <LoginForm onSuccess={successComplete} onToast={openReset} /> : <SignupForm onSuccess={successComplete} onToast={showToast} />}</div>}{toast && <div className="auth-toast" role="status">{toast}</div>}<div className="social-divider"><span>or continue with</span></div><div className="social-buttons"><button type="button" onClick={() => showToast('Coming soon')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.7 0 0  .8-.3 2.8 1a9.5 9.5 0 0 1 5.1 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.5.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.4.3.7 1 .7 2v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></svg> GitHub</button><button type="button" onClick={() => showToast('Coming soon')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z" /><path d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z" /><path d="M6.2 13.7a6 6 0 0 1 0-3.4V7.7H2.9a10 10 0 0 0 0 8.6l3.3-2.6Z" /><path d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3 14.7 2 12 2a10 10 0 0 0-9.1 5.7l3.3 2.6C7 7.8 9.3 6.1 12 6.1Z" /></svg> Google</button></div>{resetOpen && <div className="reset-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetOpen(false) }}><div className="reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">{resetSent ? <><h2 id="reset-title">Password reset</h2><p>Password reset by email is coming soon. For now, create a new account or contact us.</p><Link className="button button-primary" to="/about#contact" onClick={() => setResetOpen(false)}>Contact us</Link><button className="button button-secondary" type="button" onClick={() => setResetOpen(false)}>Close</button></> : <><h2 id="reset-title">Reset your password</h2><label>Email<input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} autoFocus /></label><button className="button button-primary" type="button" onClick={() => setResetSent(true)} disabled={!resetEmail}>Send reset link</button><button className="button button-secondary" type="button" onClick={() => setResetOpen(false)}>Close</button></>}</div></div>}</div>
}
export default AuthCard
