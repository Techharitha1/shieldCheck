import './HowItWorks.css'

const steps = [{ number: '01', title: 'Paste', text: 'Drop in a link, file, or account name.' }, { number: '02', title: 'Scan', text: 'We check for signals of risk in seconds.' }, { number: '03', title: 'Get result', text: 'See a clear result and know what to do next.' }]

function HowItWorks() { return <section className="how-section" id="how-it-works"><div className="container"><div className="section-heading reveal"><p className="eyebrow">Three easy steps</p><h2>Clarity before you click.</h2></div><div className="steps-grid">{steps.map((step, index) => <article className="step reveal" style={{ transitionDelay: `${index * 120}ms` }} key={step.number}><div className="step-top"><span className="step-number">{step.number}</span>{index < steps.length - 1 && <span className="step-line" />}</div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div></section> }
export default HowItWorks
