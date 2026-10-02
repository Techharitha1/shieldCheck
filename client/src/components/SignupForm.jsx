import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import PasswordStrength from './PasswordStrength'

function EyeIcon({ hidden }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={hidden ? 'm3 3 18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.1 3.9M6.1 6.1C3.3 8.1 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 2.8-.4' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'} /></svg>
}

function SignupForm({ onSuccess, onToast }) {
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const update = (event) => { const { name, value, checked, type } = event.target; setForm({ ...form, [name]: type === 'checkbox' ? checked : value }); setErrors({ ...errors, [name]: '', form: '' }) }
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.'
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = 'Use 8+ characters with a letter and a number.'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.'
    if (!form.terms) next.terms = 'Please agree to continue.'
    return next
  }
  const submit = async (event) => {
    event.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
    setSubmitting(true)
    try { await signup(form); onSuccess() } catch (error) { setErrors({ form: error.message.includes('Failed to fetch') ? 'Cannot reach the server. Check that it is running.' : error.message }) } finally { setSubmitting(false) }
  }
  return <form className="auth-form" onSubmit={submit} noValidate><label>Full name<input name="name" value={form.name} onChange={update} onBlur={() => setErrors({ ...errors, ...validate() })} autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} /></label>{errors.name && <p className="auth-error">{errors.name}</p>}<label>Email<input name="email" type="email" value={form.email} onChange={update} onBlur={() => setErrors({ ...errors, ...validate() })} autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} /></label>{errors.email && <p className="auth-error">{errors.email}</p>}<label>Password<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update} onBlur={() => setErrors({ ...errors, ...validate() })} autoComplete="new-password" placeholder="Create a password" aria-invalid={Boolean(errors.password)} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}><EyeIcon hidden={showPassword} /></button></div></label><PasswordStrength password={form.password} />{errors.password && <p className="auth-error">{errors.password}</p>}<label>Confirm password<input name="confirm" type="password" value={form.confirm} onChange={update} onBlur={() => setErrors({ ...errors, ...validate() })} autoComplete="new-password" placeholder="Repeat your password" aria-invalid={Boolean(errors.confirm)} /></label>{errors.confirm && <p className="auth-error">{errors.confirm}</p>}<label className="checkbox-label terms-label"><input name="terms" type="checkbox" checked={form.terms} onChange={update} />I agree to the <button type="button" className="inline-link" onClick={() => onToast('Coming soon')}>Terms and Privacy Policy</button></label>{errors.terms && <p className="auth-error">{errors.terms}</p>}{errors.form && <p className="auth-error auth-form-error">{errors.form}</p>}<button className="auth-submit button button-primary" type="submit" disabled={submitting}>{submitting ? <span className="auth-spinner" /> : 'Create account'}</button></form>
}
export default SignupForm
