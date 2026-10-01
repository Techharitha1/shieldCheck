import './VerdictBanner.css'

function VerdictBanner({ result }) {
  const tone = result.verdict.toLowerCase()
  const summary = tone === 'safe' ? 'This link is safe to open.' : tone === 'suspicious' ? 'Open with care.' : 'Do not open this link.'
  return <section className={`verdict-banner verdict-${tone}`}><div className="verdict-shield" aria-hidden="true"><svg viewBox="0 0 64 72"><path d="M32 3 57 12v19c0 21-10 30-25 38C17 61 7 52 7 31V12L32 3Z" /><path d={tone === 'risky' ? 'm21 25 22 22m0-22L21 47' : 'm18 36 9 9 19-20'} /></svg></div><div className="verdict-copy"><p className="eyebrow">Scan complete</p><h1>{result.verdict}</h1><p className="verdict-url" title={result.url}>{result.url}</p><p>{summary}</p></div></section>
}
export default VerdictBanner
