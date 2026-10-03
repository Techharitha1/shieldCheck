import { useEffect, useRef, useState } from 'react'
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
import useHistory from '../hooks/useHistory'
import useAuth from '../hooks/useAuth'
import { checkLink } from '../utils/api'
import isValidLink from '../utils/validateLink'
import './ResultPage.css'

function ResultPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { getById, addResult } = useHistory()
  const { user, authLoading } = useAuth()
    const addResultRef = useRef(addResult)
  addResultRef.current = addResult
  const getByIdRef = useRef(getById)
  getByIdRef.current = getById
  const userId = user?.id ?? null
  const [savedResult, setSavedResult] = useState(null)
  const [savedLoading, setSavedLoading] = useState(Boolean(id))
  const [scanError, setScanError] = useState('')
  const [savedError, setSavedError] = useState(false)
  const queryUrl = searchParams.get('url')
  const cleanedQueryUrl = queryUrl ? isValidLink(queryUrl) : null
  const url = savedResult?.url || cleanedQueryUrl || ''
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(!id)
  const [completedChecks, setCompletedChecks] = useState(0)

  useEffect(() => {
    if (!id) return undefined
    let active = true
    setSavedLoading(true)
    getByIdRef.current(id).then((item) => {
      if (active && item) { setSavedResult(item); setResult(item) }
      if (active && !item) setSavedError(true)
    }).catch(() => { if (active) setSavedError(true) }).finally(() => { if (active) setSavedLoading(false) })
    return () => { active = false }
  }, [id])

   useEffect(() => {
    if (id || !cleanedQueryUrl || authLoading) return undefined
    let active = true
    setScanning(true)
    setScanError('')
    setCompletedChecks(0)
    const request = checkLink(cleanedQueryUrl).then((data) => ({
      ...data,
      date: data.checkedAt || new Date().toISOString(),
      checks: (data.checks || []).map((check) => ({ ...check, score: check.safety ?? check.score })),
    }))
    const scanTimer = new Promise((resolve) => window.setTimeout(resolve, 3000))
    const checkTimer = window.setInterval(() => setCompletedChecks((current) => Math.min(current + 1, 6)), 480)
    Promise.all([request, scanTimer]).then(([data]) => {
      if (!active) return
      setResult(data)
      if (!userId) addResultRef.current(data)
      setScanning(false)
    }).catch((error) => { if (active) { setScanError(error.message); setScanning(false) } })
    return () => { active = false; window.clearInterval(checkTimer) }
  }, [authLoading, cleanedQueryUrl, id, userId])
  if (!id && !queryUrl) return <Navigate replace to="/" />
  if (!id && !cleanedQueryUrl) return <div className="app-shell result-shell"><Navbar /><main className="fallback-page"><div className="fallback-icon" aria-hidden="true">!</div><h1>We couldn't check that link</h1><p>Enter a full link, e.g. myntra.com</p><button className="button button-primary" type="button" onClick={() => window.location.assign('/')}>Try again</button></main><Footer /></div>
  if (id && !savedLoading && (savedError || !savedResult)) return <div className="app-shell result-shell"><Navbar /><main className="fallback-page"><div className="fallback-icon" aria-hidden="true">?</div><h1>Result not found</h1><p>This saved check may have been deleted.</p><a className="button button-primary" href="/history">Back to history <span aria-hidden="true">?</span></a></main><Footer /></div>
  if (scanError) return <div className="app-shell result-shell"><Navbar /><main className="fallback-page"><div className="fallback-icon" aria-hidden="true">!</div><h1>We couldn't check that link</h1><p>{scanError}</p><button className="button button-primary" type="button" onClick={() => window.location.assign('/')}>Try again</button></main><Footer /></div>
  if (!result && !scanning) return <div className="app-shell result-shell"><Navbar /><main className="fallback-page"><p>Loading result...</p></main><Footer /></div>
  return <div className="app-shell result-shell"><Navbar /><main>{scanning ? <ScanningView url={url} completedChecks={completedChecks} /> : <div className="result-page"><div className="result-container"><VerdictBanner result={result} /><div className="charts-grid"><RiskGauge score={100 - result.riskScore} trusted={result.trusted} /><DonutChart checks={result.checks} /></div><CheckBars checks={result.checks} /><FindingsList checks={result.checks} /><Recommendations result={result} saved={Boolean(id)} /><p className="result-disclaimer">No tool is 100% accurate. If you are unsure, do not enter passwords or payment details.</p></div></div>}</main><Footer /></div>
}
export default ResultPage
