import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScamCard from '../components/ScamCard'
import RedFlagSpotter from '../components/RedFlagSpotter'
import HabitChecklist from '../components/HabitChecklist'
import Quiz from '../components/Quiz'
import scamTypes from '../data/scamTypes'
import './LearnPage.css'

function LearnPage() { const [openScam, setOpenScam] = useState(null); return <div className="app-shell learn-shell"><Navbar /><main className="learn-page"><div className="learn-container"><header className="learn-hero"><div><p className="eyebrow">ShieldCheck guide</p><h1>Learn to spot<br /><span>online scams.</span></h1><p>Build a sharper eye for suspicious links, messages, and requests before they cause trouble.</p></div><div className="learn-hero-shield" aria-hidden="true"><div className="learn-shield-ring" /><svg viewBox="0 0 120 138"><path d="M60 7 109 24v36c0 34-20 55-49 69C31 115 11 94 11 60V24L60 7Z" /><path d="m33 68 18 18 38-41" /></svg></div></header><section className="learn-section scam-section"><div className="learn-section-heading"><p className="eyebrow">Know the patterns</p><h2>Six scams worth recognizing.</h2><p>Open one card at a time to see how the trick works and what you can do.</p></div><div className="scam-grid">{scamTypes.map((scam) => <ScamCard scam={scam} open={openScam === scam.id} onToggle={() => setOpenScam(openScam === scam.id ? null : scam.id)} key={scam.id} />)}</div></section><RedFlagSpotter /><HabitChecklist /><Quiz /><section className="learn-cta"><div><p className="eyebrow">Still unsure?</p><h2>Not sure about a link? Check it now.</h2><p>Get a clear result before you trust it.</p></div><Link className="button button-primary" to="/">Check a link <span aria-hidden="true">?</span></Link></section></div></main><Footer /></div> }
export default LearnPage
