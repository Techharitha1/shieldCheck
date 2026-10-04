import './AuthIllustration.css'

function BenefitIcon() {
  return (
    <svg className="auth-benefit-icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6 10.3 2.8 2.8L14.2 7.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AuthIllustration() {
  return (
    <div className="auth-illustration">
      <div className="auth-shield-wrap">
        <div className="auth-glow-ring" />
        <svg viewBox="0 0 160 184" aria-hidden="true">
          <path className="auth-shield-fill" d="M80 8 145 31v48c0 45-26 73-65 93C41 152 15 124 15 79V31L80 8Z" />
          <path className="auth-shield-outline" d="M80 8 145 31v48c0 45-26 73-65 93C41 152 15 124 15 79V31L80 8Z" />
          <path className="auth-check" d="m45 91 22 22 48-52" />
        </svg>
      </div>
      <p className="eyebrow">ShieldCheck</p>
      <h1>Check before<br /><span>you trust.</span></h1>
      <p className="auth-illustration-copy">A calmer, clearer way to decide what is safe online.</p>
      <ul className="auth-benefits">
        <li><BenefitIcon /> Quick safety signals</li>
        <li><BenefitIcon /> Private by design</li>
        <li><BenefitIcon /> Made for everyday browsing</li>
      </ul>
    </div>
  )
}
export default AuthIllustration