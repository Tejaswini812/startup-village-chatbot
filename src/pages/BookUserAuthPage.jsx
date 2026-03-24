import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import '../styles/Signup.css'

const SESSION_KEY = 'booking_user_session'
const BOOKING_TOKEN_KEY = 'booking_user_token'

/**
 * Home page only — booking users (stays, events, etc.).
 * Host signup/login stays on Become a host (/dashboard).
 */
export default function BookUserAuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [signup, setSignup] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  })
  const [login, setLogin] = useState({ email: '', password: '' })

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const handleSignupChange = (e) => {
    setSignup((s) => ({ ...s, [e.target.name]: e.target.value }))
  }
  const handleLoginChange = (e) => {
    setLogin((l) => ({ ...l, [e.target.name]: e.target.value }))
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    const name = signup.name.trim()
    const phone = signup.phone.trim()
    const email = signup.email.trim().toLowerCase()
    const password = signup.password

    if (!name || !phone || !email || !password) {
      showMessage('Please fill in name, phone, email and password.', 'error')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showMessage('Please enter a valid email.', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = { name, phone, email, password }
      const res = await fetch(`${API_BASE_URL}/booking-excel-auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showMessage(
          data.message || 'Signup failed. Please ensure backend is running and restart server once.',
          'error'
        )
        setLoading(false)
        return
      }
      showMessage(data.message || 'Account created. You can log in now.', 'success')
      setSignup({ name: '', phone: '', email: '', password: '' })
      setMode('login')
    } catch {
      showMessage('Server unreachable. Please run backend and try again.', 'error')
    }
    setLoading(false)
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const email = login.email.trim().toLowerCase()
    const password = login.password

    if (!email || !password) {
      showMessage('Please enter email and password.', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = { email, password }
      const res = await fetch(`${API_BASE_URL}/booking-excel-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showMessage(data.message || 'Invalid email or password.', 'error')
        setLoading(false)
        return
      }
      const session = {
        name: data.user?.name,
        email: data.user?.email,
        phone: data.user?.phone
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      if (data.token) localStorage.setItem(BOOKING_TOKEN_KEY, data.token)
      showMessage('Welcome! Redirecting…', 'success')
      setTimeout(() => navigate('/'), 800)
    } catch {
      showMessage('Server unreachable. Please run backend and try again.', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="header-section">
        <img src="/image.jpg.jpg" alt="Startup Village County" className="logo" />
        <h1 className="club-title">Book & explore</h1>
      </div>

      <div className="auth-container">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <button
            type="button"
            className={mode === 'login' ? 'btn-primary' : ''}
            style={
              mode === 'login'
                ? { width: 'auto', flex: 1, padding: '0.5rem 1rem', fontSize: '14px' }
                : { background: '#e5e7eb', color: '#374151', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', width: 'auto', flex: 1, fontSize: '14px' }
            }
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'btn-primary' : ''}
            style={
              mode === 'signup'
                ? { width: 'auto', flex: 1, padding: '0.5rem 1rem', fontSize: '14px' }
                : { background: '#e5e7eb', color: '#374151', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', width: 'auto', flex: 1, fontSize: '14px' }
            }
            onClick={() => setMode('signup')}
          >
            Signup
          </button>
        </div>

        {mode === 'signup' ? (
          <>
            <h2 className="form-title">Create account</h2>
            <p className="form-description">For guests booking stays, events and more.</p>
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label htmlFor="su-name">Name <span className="required">*</span></label>
                <input
                  id="su-name"
                  name="name"
                  type="text"
                  value={signup.name}
                  onChange={handleSignupChange}
                  required
                  autoComplete="name"
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="su-phone">Phone number <span className="required">*</span></label>
                <input
                  id="su-phone"
                  name="phone"
                  type="tel"
                  value={signup.phone}
                  onChange={handleSignupChange}
                  required
                  autoComplete="tel"
                  placeholder="Phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="su-email">Email <span className="required">*</span></label>
                <input
                  id="su-email"
                  name="email"
                  type="email"
                  value={signup.email}
                  onChange={handleSignupChange}
                  required
                  autoComplete="email"
                  placeholder="Email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="su-password">Password <span className="required">*</span></label>
                <input
                  id="su-password"
                  name="password"
                  type="password"
                  value={signup.password}
                  onChange={handleSignupChange}
                  required
                  autoComplete="new-password"
                  placeholder="Password"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Please wait…' : 'Sign up'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="form-title">Login</h2>
            <p className="form-description">Email and password to continue booking.</p>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="li-email">Email <span className="required">*</span></label>
                <input
                  id="li-email"
                  name="email"
                  type="email"
                  value={login.email}
                  onChange={handleLoginChange}
                  required
                  autoComplete="email"
                  placeholder="Email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="li-password">Password <span className="required">*</span></label>
                <input
                  id="li-password"
                  name="password"
                  type="password"
                  value={login.password}
                  onChange={handleLoginChange}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Please wait…' : 'Login'}
              </button>
            </form>
          </>
        )}

        <div className="links" style={{ marginTop: '1rem' }}>
          <a href="/">Back to Home</a>
        </div>

        {message.text && (
          <div className={`status-message ${message.type}`} style={{ marginTop: '1rem' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
