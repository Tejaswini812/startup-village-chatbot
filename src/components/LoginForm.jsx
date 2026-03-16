import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'

const ROLES = [
  { id: 'user', label: 'User', desc: 'Book hotels, stays & events', icon: 'fa-calendar-check' },
  { id: 'host', label: 'Host', desc: 'List your property', icon: 'fa-home' },
  { id: 'admin', label: 'Admin', desc: 'Approve & edit (website owner)', icon: 'fa-user-shield' }
]

const LoginForm = ({ onClose, onSuccess, onShowSignup, onForgotPassword }) => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = { ...formData }
      if (selectedRole === 'admin') payload.role = 'admin'
      const response = await apiClient.post('/auth/login', payload)
      
      // If logging in as Admin, only the admin account is allowed (backend also checks)
      const adminEmail = 'villagecounty2025@gmail.com'
      if (selectedRole === 'admin' && (response.data.user?.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
        setErrors({ submit: 'Wrong credentials' })
        setLoading(false)
        return
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      onSuccess(response.data.user, response.data.token)
      if (selectedRole === 'admin') {
        onClose()
        navigate('/admin-properties')
      } else {
        onClose()
      }
    } catch (error) {
      console.error('Login error:', error)
      let message
      if (!error.response) {
        message = 'Unable to connect. Check that the backend is running on port 5000 and CORS allows this origin.'
      } else if (selectedRole === 'admin' && error.response.status === 401) {
        message = 'Wrong credentials'
      } else {
        message = error.response?.data?.message || 'Wrong credentials'
      }
      setErrors({ submit: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="login-form" style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b' }}>Welcome Back</h2>
            {selectedRole ? (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#16a34a', fontWeight: 500 }}>
                Logging in as: {ROLES.find(r => r.id === selectedRole)?.label}
                <button type="button" onClick={() => setSelectedRole(null)} style={{ marginLeft: 8, background: 'none', border: 'none', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>
              </p>
            ) : (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Choose who you are:</p>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {!selectedRole ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9375rem'
                }}
              >
                <i className={`fas ${role.icon}`} style={{ color: '#16a34a', width: 20 }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{role.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{role.desc}</div>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: selectedRole ? 'block' : 'none' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              placeholder="Enter your email"
            />
            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.email}</span>}
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.password ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              placeholder="Enter your password"
            />
            {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.password}</span>}
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => onForgotPassword ? onForgotPassword() : alert('Please contact support for password reset.')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.875rem',
                color: '#22c55e',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Forgot password?
            </button>
          </div>

          {errors.submit && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '0.75rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: loading ? '#9ca3af' : '#22c55e',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                if (onShowSignup) {
                  onShowSignup()
                  onClose()
                } else {
                  window.location.href = '/signup'
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.875rem',
                color: '#22c55e',
                cursor: 'pointer',
                textDecoration: 'underline',
                font: 'inherit'
              }}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
