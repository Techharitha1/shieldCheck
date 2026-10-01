import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AboutHero from '../components/AboutHero'
import StepsLine from '../components/StepsLine'
import CheckCards from '../components/CheckCards'
import StatsStrip from '../components/StatsStrip'
import FaqAccordion from '../components/FaqAccordion'
import ContactForm from '../components/ContactForm'
import CollapsibleSection from '../components/CollapsibleSection'
import './AboutPage.css'

function AboutPage() { return <div className="app-shell about-shell"><Navbar /><main className="about-page"><div className="about-container"><AboutHero /><CollapsibleSection title="Our story" className="about-band"><section className="story-card"><div><p className="eyebrow">Our story</p><h2>Safer clicks start with a pause.</h2></div><div className="story-copy"><p className="story-quote">“A student project built to make scam signals easier to understand.”</p><p>We help people check first and trust with more confidence.</p></div></section></CollapsibleSection><CollapsibleSection title="How it works" className="about-band"><StepsLine /></CollapsibleSection><CollapsibleSection title="What we check" className="about-band"><CheckCards /></CollapsibleSection><CollapsibleSection title="Your numbers" className="about-band"><StatsStrip /></CollapsibleSection><CollapsibleSection title="Tech stack" className="about-band"><section className="tech-section"><div><p className="eyebrow">Built with care</p><h2>Learning in public.</h2></div><div className="tech-content"><div className="tech-chips"><span>React</span><span>Node.js</span><span>Express</span><span>Neon</span><span>Upstash</span></div><p>Built as a student project.</p></div></section></CollapsibleSection><CollapsibleSection title="FAQ" className="about-band"><FaqAccordion /></CollapsibleSection><CollapsibleSection title="Contact" className="about-band"><ContactForm /></CollapsibleSection><section className="about-cta"><div><p className="eyebrow">Ready when you are</p><h2>Not sure about a link? Check it now.</h2></div><Link className="button button-primary" to="/">Check a link <span aria-hidden="true">&#8594;</span></Link></section></div></main><Footer /></div> }
export default AboutPage
