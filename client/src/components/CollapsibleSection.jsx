import { useState } from 'react'
import './CollapsibleSection.css'

function CollapsibleSection({ title, children, className = '', openByDefault = true }) { const [open, setOpen] = useState(openByDefault); return <section className={`collapsible-section ${open ? 'is-open' : ''} ${className}`}><button className="collapse-trigger" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><span>{title}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" /></svg></button><div className="collapse-body"><div>{children}</div></div></section> }
export default CollapsibleSection
