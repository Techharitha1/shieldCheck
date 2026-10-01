import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScanningView from '../components/ScanningView'
import VerdictBanner from '../components/VerdictBanner'
import RiskGauge from '../components/RiskGauge'
import DonutChart from '../components/DonutChart'
import CheckBars from '../components/CheckBars'
import FindingsList from '../components/FindingsList'
import Recommendations from '../components/Recommendations'
import analyzeUrl from '../utils/analyzeUrl'
import useHistory from '../hooks/useHistory'
import './ResultPage.css'

function ResultPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { getById, addResult } = useHistory()
  const savedResult = id ? getById(id) : null
  const queryUrl = searchParams.get('url')
  const url = savedResult?.url || queryUrl || ''
  const analyzed = useMemo(() => url ? analyzeUrl(url) : null, [url])
  const result = savedResult || analyzed
  const [scanning, setScanning] = useState(!id)
  const [completedChecks, setCompletedChecks] = useState(0)
  const scanCompleted = useRef(false)

  useEffect(() => {
    if (id || !analyzed) return undefined
    const scanTimer = window.setTimeout(() => {
      if (scanCompleted.current) return
      scanCompleted.current = true
      addResult({ ...analyzed, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date: new Date().toISOString() })
      setScanning(false)
    }, 3000)
    const checkTimer = window.setInterval(() => setCompletedChecks((current) => Math.min(current + 1, 6)), 480)
    return () => { window.clearTimeout(scanTimer); window.clearInterval(checkTimer) }
  }, [addResult, analyzed, id, url])

  if (!id && !queryUrl) return <Navigate replace to="/" />
  if (id && !savedResult) return <div className="app-shell result-shell"><Navbar /><main className="fallback-page"><div className="fallback-icon" aria-hidden="true">?</div><h1>Result not found</h1><p>This saved check may have been deleted.</p><a className="button button-primary" href="/history">Back to history <span aria-hidden="true">&#8594;</span></a></main><Footer /></div>
  return <div className="app-shell result-shell"><Navbar /><main>{scanning ? <ScanningView url={url} completedChecks={completedChecks} /> : <div className="result-page"><div className="result-container"><VerdictBanner result={result} /><div className="charts-grid"><RiskGauge score={result.riskScore} /><DonutChart checks={result.checks} /></div><CheckBars checks={result.checks} /><FindingsList checks={result.checks} /><Recommendations result={result} saved={Boolean(id)} /></div></div>}</main><Footer /></div>
}
export default ResultPage
