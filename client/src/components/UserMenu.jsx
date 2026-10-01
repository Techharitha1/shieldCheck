import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import './UserMenu.css'

function UserMenu({ user, closeMenu }) { const [open, setOpen] = useState(false); const { logout } = useAuth(); const navigate = useNavigate(); const initials = user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(); const signOut = () => { logout(); setOpen(false); closeMenu(); navigate('/') }; return <div className="user-menu"><button className="avatar-button" type="button" aria-label="Open account menu" aria-expanded={open} onClick={() => setOpen(!open)}>{initials}</button>{open && <div className="user-dropdown"><div className="user-dropdown-heading"><strong>{user.name}</strong><span>{user.email}</span></div><Link to="/dashboard" onClick={() => { setOpen(false); closeMenu() }}>Dashboard</Link><Link to="/history" onClick={() => { setOpen(false); closeMenu() }}>History</Link><button type="button" onClick={signOut}>Log out</button></div>}</div> }
export default UserMenu
