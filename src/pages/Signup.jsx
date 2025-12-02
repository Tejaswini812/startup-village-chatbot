import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import '../styles/Signup.css'

const Signup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    carNumber: '',
    referral: '',
    companyLink: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const showStatusMessage = (message, type) => {
    setStatusMessage({ text: message, type })
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage({ text: '', type: '' })

    try {
      // Check if user already exists in CSV data
      const response = await fetch(`${API_BASE_URL}/user`)
      const users = await response.json()
      
      // Find user by name or email
      const existingUser = users.find(user => 
        user.data.name.toLowerCase() === formData.name.toLowerCase() ||
        user.data.email.toLowerCase() === formData.email.toLowerCase()
      )

      if (existingUser) {
        showStatusMessage(`Welcome back! Your UserID ${existingUser.data.id} is already activated.`, 'success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          carNumber: '',
          referral: '',
          companyLink: ''
        })
        setTimeout(() => navigate('/'), 2000)
      } else {
        // User not found in CSV - show available UserIDs
        const availableUserIds = users.slice(0, 5).map(user => user.data.id).join(', ')
        showStatusMessage(`User not found in our records. Available UserIDs: ${availableUserIds}. Please contact admin to add your details.`, 'error')
      }
    } catch (error) {
      showStatusMessage('Error connecting to server. Please try again.', 'error')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="header-section">
        <img src="/image.jpg.jpg" alt="Startup Village Club Logo" className="logo" />
        <h1 className="club-title">Startup Village Club</h1>
      </div>

      <div className="auth-container">
        <h2 className="form-title">Activate Your User ID</h2>
        <p className="form-description">Enter your details to activate your existing User ID</p>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Name <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          {/* Car Number */}
          <div className="form-group">
            <label htmlFor="carNumber">Car Number <span className="required">*</span></label>
            <input
              type="text"
              id="carNumber"
              name="carNumber"
              value={formData.carNumber}
              onChange={handleChange}
              required
              placeholder="Enter your car number"
            />
          </div>

          {/* Referral ID */}
          <div className="form-group">
            <label htmlFor="referral">Referral ID</label>
            <input
              type="text"
              id="referral"
              name="referral"
              value={formData.referral}
              onChange={handleChange}
              placeholder="Enter referral ID (optional)"
            />
          </div>

          {/* Company/LinkedIn Link */}
          <div className="form-group">
            <label htmlFor="companyLink">Company/LinkedIn Link</label>
            <input
              type="url"
              id="companyLink"
              name="companyLink"
              value={formData.companyLink}
              onChange={handleChange}
              placeholder="Enter company or LinkedIn link (optional)"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Activating...' : 'Activate User ID'}
          </button>
        </form>

        <div className="links">
          <a href="/dashboard">Go to Dashboard</a>
        </div>
        
        {/* Status message container */}
        {statusMessage.text && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default Signup