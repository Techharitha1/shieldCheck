import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useHistory from '../hooks/useHistory'
import useAuth from '../hooks/useAuth'
import UserMenu from './UserMenu'
import './Navbar.css'

const ICONS = {
  home: ['M3 11l9-8 9 8', 'M5 9.5V20h14V9.5'],
  steps: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  book: ['M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h14'],
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3 2'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v5', 'M12 8h.01'],
  mail: ['M3 5h18v14H3z', 'M3 6l9 7 9-7'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
}

function Icon({ name }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  )
}

function ShieldMark() {
  return <svg className="brand-mark" viewBox="0 0 32 36" aria-hidden="true"><path d="M16 2 28 6v9c0 8.4-5.1 15.2-12 18C9.1 30.2 4 23.4 4 15V6l12-4Z" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="m10.5 17 3.4 3.4 7.7-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

const LINKS = [
  { href: '/#home', label: 'Home', icon: 'home' },
  { href: '/#how-it-works', label: 'How it works', icon: 'steps' },
  { to: '/learn', label: 'Learn', icon: 'book', path: '/learn' },
  { to: '/dashboard', label: 'Dashboard', icon: 'grid', path: '/dashboard' },
  { to: '/history', label: 'History', icon: 'clock', path: '/history', badge: true },
  { to: '/about', label: 'About', icon: 'info', path: '/about' },
  { to: '/about#contact', label: 'Contact', icon: 'mail', path: '/about', hash: '#contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { history } = useHistory()
  const { user } = useAuth()
  const { pathname, hash } = useLocation()
  const closeMenu = () => setMenuOpen(false)
  const active = (path, targetHash = '') => (pathname === path && hash === targetHash ? 'nav-active' : '')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link className="brand" to="/" onClick={closeMenu}><ShieldMark /><span>ShieldCheck</span></Link>
          <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            {LINKS.map((l) => {
              const content = (
                <>
                  <Icon name={l.icon} />
                  <span>{l.label}</span>
                  {l.badge && history.length > 0 && <span className="history-count">{history.length}</span>}
                </>
              )
              return l.href
                ? <a key={l.label} href={l.href} onClick={closeMenu}>{content}</a>
                : <Link key={l.label} className={active(l.path, l.hash || '')} to={l.to} onClick={closeMenu}>{content}</Link>
            })}
          </nav>
          <div className={`nav-actions ${menuOpen ? 'is-open' : ''}`}>
            {user
              ? <UserMenu user={user} closeMenu={closeMenu} />
              : <Link to="/auth?tab=login" className="button button-primary login-btn" onClick={closeMenu}><Icon name="user" /><span>Log in</span></Link>}
          </div>
        </div>
      </header>
      <div className="nav-spacer" aria-hidden="true" />
    </>
  )
}
export default Navbar