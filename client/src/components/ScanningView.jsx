import ShieldAnimation from './ShieldAnimation'
import './ScanningView.css'

function ScanningView({ url, completedChecks }) {
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } })()
  return <section className="scanning-page"><div className="scanning-layout"><div className="scanning-visual"><ShieldAnimation scanState="safe-scanning" /></div><div className="scanning-copy"><p className="eyebrow">ShieldCheck scan</p><h1>Scanning <span>{host}</span></h1><p className="scanning-intro">We are checking this link against six safety signals.</p><div className="scan-check-list">{['Phishing', 'Malware', 'SSL certificate', 'Domain age', 'Reputation', 'Redirects'].map((name, index) => <div className={`scan-check ${completedChecks > index ? 'is-complete' : ''}`} key={name}><span className="scan-check-icon">{completedChecks > index ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg> : <i />}</span><span>{name}</span><small>{completedChecks > index ? 'Checked' : 'Waiting'}</small></div>)}</div></div></div></section>
}
export default ScanningView
