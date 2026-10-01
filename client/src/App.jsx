import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import ResultPage from './pages/ResultPage'
import HistoryPage from './pages/HistoryPage'
import DashboardPage from './pages/DashboardPage'
import LearnPage from './pages/LearnPage'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/AuthPage'
import NotFoundPage from './pages/NotFoundPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function LandingPage() {
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
    }), { threshold: 0.12 })
    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])
  return <div className="app-shell"><Navbar /><main><Hero /><Features /><HowItWorks /></main><Footer /></div>
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) { window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 0) }
    else window.scrollTo(0, 0)
  }, [pathname, search, hash])
  return null
}

function App() {
  return <BrowserRouter><ErrorBoundary><ScrollToTop /><Routes><Route path="/" element={<LandingPage />} /><Route path="/result" element={<ResultPage />} /><Route path="/result/:id" element={<ResultPage />} /><Route path="/history" element={<HistoryPage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/learn" element={<LearnPage />} /><Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<Navigate replace to="/about#contact" />} /><Route path="/auth" element={<AuthPage />} /><Route path="/login" element={<Navigate replace to="/auth?tab=login" />} /><Route path="/signup" element={<Navigate replace to="/auth?tab=signup" />} /><Route path="*" element={<NotFoundPage />} /><Route path="/result/*" element={<Navigate replace to="/" />} /></Routes></ErrorBoundary></BrowserRouter>
}

export default App
