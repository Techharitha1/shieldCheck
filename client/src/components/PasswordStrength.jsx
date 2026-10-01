import './PasswordStrength.css'

function PasswordStrength({ password }) { const hasLength = password.length >= 8; const hasLetter = /[A-Za-z]/.test(password); const hasNumber = /\d/.test(password); const points = [hasLength, hasLetter, hasNumber].filter(Boolean).length; const label = points <= 1 ? 'Weak' : points === 2 ? 'Medium' : 'Strong'; return <div className={`password-strength strength-${label.toLowerCase()}`} aria-live="polite"><div className="strength-bar"><span style={{ width: `${points / 3 * 100}%` }} /></div><span>{password ? label : 'Use 8+ characters, a letter and a number'}</span></div> }
export default PasswordStrength
