import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthIllustration from '../components/AuthIllustration'
import AuthCard from '../components/AuthCard'
import './AuthPage.css'

function AuthPage() { return <div className="app-shell auth-shell"><Navbar /><main className="auth-page"><div className="auth-container"><AuthIllustration /><AuthCard /></div><p className="auth-back"><Link to="/">? Back to home</Link></p></main><Footer /></div> }
export default AuthPage
