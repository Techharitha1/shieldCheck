import { useState } from 'react'
import './TipCard.css'

const tips = ['Check the sender before opening unexpected links.', 'Look for HTTPS before entering sensitive information.', 'Never share a one-time code with a stranger.', 'Hover over links to inspect their real destination.', 'Use a unique password for every important account.', 'Urgent messages deserve a slower, closer look.', 'Keep your browser updated to block newer threats.', 'A familiar logo does not prove a page is real.', 'Avoid downloading files from unknown senders.', 'When in doubt, visit the official site directly.']
function TipCard() { const [day] = useState(() => new Date().getDate()); const tip = tips[day % tips.length]; return <article className="tip-card dashboard-card"><div className="tip-shield" aria-hidden="true"><svg viewBox="0 0 32 36"><path d="M16 2 28 6v9c0 8.4-5.1 15.2-12 18C9.1 30.2 4 23.4 4 15V6l12-4Z" /><path d="m10.5 17 3.4 3.4 7.7-8" /></svg></div><div><p className="eyebrow">Security tip of the day</p><p className="tip-text">{tip}</p></div></article> }
export default TipCard
