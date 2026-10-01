import './AboutHero.css'

function AboutHero() { return <header className="about-hero"><div><p className="eyebrow">About ShieldCheck</p><h1>Making the web safer,<br /><span>one link at a time.</span></h1><p>ShieldCheck started as a student project with a simple mission: help people pause, check, and avoid scams before they become a problem.</p></div><div className="about-hero-shield" aria-hidden="true"><div className="about-orbit" /><svg viewBox="0 0 120 138"><path d="M60 7 109 24v36c0 34-20 55-49 69C31 115 11 94 11 60V24L60 7Z" /><path d="m33 68 18 18 38-41" /></svg><i /><i /><i /></div></header> }
export default AboutHero
