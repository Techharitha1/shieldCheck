import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './NotFoundPage.css'

function NotFoundPage() { return <div className="app-shell"><Navbar /><main className="fallback-page"><div className="fallback-icon" aria-hidden="true">?</div><p className="eyebrow">404</p><h1>That page is not protected.</h1><p>We could not find the page you were looking for.</p><Link className="button button-primary" to="/">Go home <span aria-hidden="true">&#8594;</span></Link></main><Footer /></div> }
export default NotFoundPage
