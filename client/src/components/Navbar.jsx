import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useHistory from '../hooks/useHistory'
import useAuth from '../hooks/useAuth'
import UserMenu from './UserMenu'
import './Navbar.css'

function ShieldMark() {
  return <svg className="brand-mark" viewBox="0 0 32 36" aria-hidden="true"><path d="M16 2 28 6v9c0 8.4-5.1 15.2-12 18C9.1 30.2 4 23.4 4 15V6l12-4Z" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="m10.5 17 3.4 3.4 7.7-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { history } = useHistory()
  const { user } = useAuth()
  const { pathname, hash } = useLocation()
  const closeMenu = () => setMenuOpen(false)
  const active = (path, targetHash = '') => pathname === path && hash === targetHash ? 'nav-active' : ''
  return <header className="navbar"><div className="container nav-inner">
    <Link className="brand" to="/" onClick={closeMenu}><ShieldMark /><span>ShieldCheck</span></Link>
    <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
    <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation"><a href="/#home" onClick={closeMenu}>Home</a><a href="/#features" onClick={closeMenu}>Features</a><a href="/#how-it-works" onClick={closeMenu}>How it works</a><Link className={active('/learn')} to="/learn" onClick={closeMenu}>Learn</Link><Link className={active('/dashboard')} to="/dashboard" onClick={closeMenu}>Dashboard</Link><Link className={active('/history')} to="/history" onClick={closeMenu}>History {history.length > 0 && <span className="history-count">{history.length}</span>}</Link><Link className={active('/about')} to="/about" onClick={closeMenu}>About</Link><Link className={active('/about', '#contact')} to="/about#contact" onClick={closeMenu}>Contact</Link></nav>
    <div className={`nav-actions ${menuOpen ? 'is-open' : ''}`}>{user ? <UserMenu user={user} closeMenu={closeMenu} /> : <><Link to="/auth?tab=login" className="login-link" onClick={closeMenu}>Log in</Link><Link to="/auth?tab=signup" className="button button-primary" onClick={closeMenu}>Get started <span aria-hidden="true">&#8594;</span></Link></>}</div>
  </div></header>
}
export default Navbar
