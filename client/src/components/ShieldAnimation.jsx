import './ShieldAnimation.css'

const particles = [{ x: '9%', y: '31%', delay: '0s' }, { x: '83%', y: '19%', delay: '1.5s' }, { x: '88%', y: '70%', delay: '0.7s' }, { x: '15%', y: '77%', delay: '2.2s' }, { x: '74%', y: '87%', delay: '3s' }]

function ShieldAnimation({ scanState }) {
  const scanning = scanState.includes('scanning')
  const risky = scanState === 'risky'
  const complete = scanState === 'safe' || risky
  return <div className={`hero-visual ${scanning ? 'is-scanning' : ''} ${risky ? 'is-risky' : ''}`} aria-live="polite">
    <div className="visual-grid" aria-hidden="true" />{particles.map((particle, index) => <span className="particle" key={index} style={{ left: particle.x, top: particle.y, animationDelay: particle.delay }} />)}<div className="shield-orbit orbit-one" aria-hidden="true" /><div className="shield-orbit orbit-two" aria-hidden="true" />
    <div className="shield-stage"><div className="shield-glow" /><svg className="shield-svg" viewBox="0 0 240 278" role="img" aria-label={scanning ? 'Shield is scanning your link' : complete ? (risky ? 'Risky link detected' : 'Link looks safe') : 'ShieldCheck security shield'}><defs><linearGradient id="shieldFill" x1="25%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor={risky ? '#ef4444' : '#3b82f6'} /><stop offset="100%" stopColor={risky ? '#991b1b' : '#0891b2'} /></linearGradient></defs><path className="shield-fill" d="M120 13 221 47v74c0 69-42 111-101 139C61 232 19 190 19 121V47L120 13Z" fill="url(#shieldFill)" /><path className="shield-outline" d="M120 13 221 47v74c0 69-42 111-101 139C61 232 19 190 19 121V47L120 13Z" fill="none" stroke="url(#shieldFill)" strokeWidth="4" /><path className={`shield-check ${complete && !risky ? 'show' : ''}`} d="m67 137 34 34 74-76" fill="none" stroke="#d7fff0" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" /><path className={`shield-cross ${risky ? 'show' : ''}`} d="m80 105 80 80m0-80-80 80" fill="none" stroke="#ffe0e0" strokeWidth="11" strokeLinecap="round" /><path className="scan-line" d="M38 139h164" fill="none" stroke={risky ? '#fecaca' : '#b7f8ff'} strokeWidth="2" /></svg><div className={`scan-label ${scanning ? 'active' : ''} ${complete ? 'complete' : ''}`}><span className="label-dot" />{scanning ? 'Scanning...' : complete ? (risky ? 'Risky link' : 'Looks safe') : 'Ready to protect'}</div></div>
  </div>
}
export default ShieldAnimation
