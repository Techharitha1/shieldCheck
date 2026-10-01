import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AboutHero from '../components/AboutHero'
import StepsLine from '../components/StepsLine'
import CheckCards from '../components/CheckCards'
import StatsStrip from '../components/StatsStrip'
import FaqAccordion from '../components/FaqAccordion'
import ContactForm from '../components/ContactForm'
import './AboutPage.css'

function AboutPage() { return <div className="app-shell about-shell"><Navbar /><main className="about-page"><div className="about-container"><AboutHero /><section className="story-card"><div><p className="eyebrow">Our story</p><h2>A small project for a very real problem.</h2></div><div className="story-copy"><p>ShieldCheck began as a student project after seeing how easy it is for a convincing message or familiar-looking page to catch someone off guard.</p><p>We wanted to make the first step simple: paste what you are unsure about, understand the signals, and make a calmer decision.</p></div></section><StepsLine /><CheckCards /><StatsStrip /><section className="tech-section"><div><p className="eyebrow">Behind the shield</p><h2>Built to keep learning.</h2></div><div className="tech-content"><div className="tech-chips"><span>React</span><span>Node.js</span><span>Express</span><span>Neon</span><span>Upstash</span></div><p>Built as a student project.</p></div></section><FaqAccordion /><ContactForm /><section className="about-cta"><div><p className="eyebrow">Ready when you are</p><h2>Not sure about a link? Check it now.</h2></div><Link className="button button-primary" to="/">Check a link <span aria-hidden="true">&#8594;</span></Link></section></div></main><Footer /></div> }
export default AboutPage
