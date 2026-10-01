import { Component } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <div className="app-shell fallback-shell"><Navbar /><main className="fallback-page"><div className="fallback-icon" aria-hidden="true">!</div><h1>Something went wrong</h1><p>ShieldCheck could not load this page.</p><button className="button button-primary" type="button" onClick={() => window.location.reload()}>Reload</button></main><Footer /></div>
    return this.props.children
  }
}
export default ErrorBoundary
