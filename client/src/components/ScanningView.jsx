import ShieldAnimation from './ShieldAnimation'
import './ScanningView.css'

function ScanningView({ url, completedChecks }) {
  return <section className="scanning-page"><div className="scanning-layout"><div className="scanning-visual"><ShieldAnimation scanState="safe-scanning" /></div><div className="scanning-copy"><p className="eyebrow">ShieldCheck scan</p><h1>Scanning <span>{url}</span></h1><p className="scanning-intro">We are checking this link against six safety signals.</p><div className="scan-check-list">{['Phishing', 'Malware', 'SSL certificate', 'Domain age', 'Reputation', 'Redirects'].map((name, index) => <div className={`scan-check ${completedChecks > index ? 'is-complete' : ''}`} key={name}><span className="scan-check-icon">{completedChecks > index ? '&#10003;' : <i />}</span><span>{name}</span><small>{completedChecks > index ? 'Checked' : 'Waiting'}</small></div>)}</div></div></div></section>
}
export default ScanningView
