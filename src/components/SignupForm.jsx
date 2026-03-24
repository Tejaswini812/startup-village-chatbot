import React, { useState } from 'react'
import apiClient from '../config/axios'
import { compressImageIfNeeded } from '../services/formSubmissionService'

const SIGNUP_ROLES = [
  { id: 'user', label: 'User', desc: 'Book hotels, stays & events', icon: 'fa-calendar-check' },
  { id: 'host', label: 'Host', desc: 'List your property', icon: 'fa-home' }
]

const SignupForm = ({ onClose, onSuccess, hostSignupDirect = false }) => {
  /** When true (Become a host /dashboard), skip User vs Host choice — show host signup form immediately */
  const [signupAs, setSignupAs] = useState(hostSignupDirect ? 'host' : null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    governmentProofType: 'Aadhaar',
    governmentProofNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  })
  const [document, setDocument] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          document: 'File size must be less than 5MB'
        }))
        return
      }
      setDocument(file)
      setErrors(prev => ({
        ...prev,
        document: ''
      }))
    }
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    console.log('Profile picture file selected:', file)
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type)
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select an image file'
        }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size)
        setErrors(prev => ({
          ...prev,
          profilePicture: 'File size must be less than 5MB'
        }))
        return
      }
      
      // Store the actual file and create preview URL
      console.log('Setting profile picture file:', file.name, file.size, file.type)
      setProfilePictureFile(file)
      const previewUrl = URL.createObjectURL(file)
      setProfilePicture(previewUrl)
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }))
      console.log('Profile picture state updated')
    } else {
      console.log('No file selected')
    }
  }

  const removeProfilePicture = () => {
    if (profilePicture) {
      URL.revokeObjectURL(profilePicture)
    }
    setProfilePicture(null)
    setProfilePictureFile(null)
  }

  const validateForm = () => {
    const newErrors = {}

    console.log('Validating form data:', formData)
    console.log('Document file:', document)
    console.log('Profile picture file:', profilePictureFile)
    console.log('Profile picture preview:', profilePicture)

    // Check each field individually with detailed logging
    if (!formData.name || !formData.name.trim()) {
      console.log('Name validation failed:', formData.name)
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email || !formData.email.trim()) {
      console.log('Email validation failed:', formData.email)
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      console.log('Email format validation failed:', formData.email)
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone || !formData.phone.trim()) {
      console.log('Phone validation failed:', formData.phone)
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      console.log('Phone format validation failed:', formData.phone)
      newErrors.phone = 'Phone number must be 10 digits'
    }
    
    if (!formData.password) {
      console.log('Password validation failed:', formData.password)
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      console.log('Password length validation failed:', formData.password.length)
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      console.log('Password match validation failed:', formData.password, formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.governmentProofNumber || !formData.governmentProofNumber.trim()) {
      console.log('Government proof number validation failed:', formData.governmentProofNumber)
      newErrors.governmentProofNumber = 'Government proof number is required'
    }
    
    if (!document) {
      console.log('Document validation failed:', document)
      newErrors.document = 'Government proof document is required'
    }
    
    // Profile picture is optional, so no validation needed
    
    if (!formData.address.street || !formData.address.street.trim()) {
      console.log('Street validation failed:', formData.address.street)
      newErrors.street = 'Street address is required'
    }
    
    if (!formData.address.city || !formData.address.city.trim()) {
      console.log('City validation failed:', formData.address.city)
      newErrors.city = 'City is required'
    }
    
    if (!formData.address.state || !formData.address.state.trim()) {
      console.log('State validation failed:', formData.address.state)
      newErrors.state = 'State is required'
    }
    
    if (!formData.address.pincode || !formData.address.pincode.trim()) {
      console.log('Pincode validation failed:', formData.address.pincode)
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      console.log('Pincode format validation failed:', formData.address.pincode)
      newErrors.pincode = 'Pincode must be 6 digits'
    }

    console.log('Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('phone', formData.phone)
      submitData.append('password', formData.password)
      submitData.append('governmentProofType', formData.governmentProofType)
      submitData.append('governmentProofNumber', formData.governmentProofNumber)
      submitData.append('address', JSON.stringify(formData.address))
      submitData.append('document', document)
      console.log('Profile picture file for submission:', profilePictureFile)
      if (profilePictureFile) {
        const compressedProfile = await compressImageIfNeeded(profilePictureFile)
        console.log('Appending profile picture file:', compressedProfile.name, compressedProfile.size)
        submitData.append('profilePicture', compressedProfile)
      } else {
        console.log('No profile picture provided, skipping...')
      }

      // Debug: Log what we're sending
      console.log('Form data being sent:')
      for (let [key, value] of submitData.entries()) {
        console.log(key, value)
      }

      const response = await apiClient.post('/auth/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onSuccess(response.data.user, response.data.token)
      onClose()
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    console.log('Signup close button clicked')
    onClose && onClose()
  }

          return (
    <div>
      <style>{`
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
      <div style={{
        backgroundColor: 'white',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        animation: 'slideInScale 0.4s ease-out',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '2rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Create Account
            </h2>
            <p style={{
              fontSize: '1rem',
              margin: 0,
              opacity: 0.9
            }}>
              Join our community and start your journey
            </p>
            <p style={{ fontSize: '0.8rem', margin: '0.35rem 0 0', opacity: 0.85 }}>
              {hostSignupDirect
                ? 'Host account — list your property. Admin: website owner — use /admin-properties'
                : 'Sign up as User (book stays & events) or Host (list your property). Admin: website owner — use /admin-properties'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              zIndex: 2
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              e.target.style.transform = 'scale(1.1)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ×
          </button>
        </div>

        {/* Role selection or Form Content */}
        <div style={{
          padding: '2rem',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {!signupAs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9375rem' }}>I want to sign up as:</p>
            {SIGNUP_ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSignupAs(role.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  border: '2px solid #22c55e',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem'
                }}
              >
                <i className={`fas ${role.icon}`} style={{ color: '#16a34a', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{role.label}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{role.desc}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Picture Section */}
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#1e293b',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#22c55e',
                borderRadius: '50%'
              }}></span>
              Profile Picture
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '3px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: '#f1f5f9',
                position: 'relative'
              }}>
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: '#64748b'
                  }}>
                    <i className="fas fa-user" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                    <span style={{ fontSize: '0.75rem' }}>No Image</span>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={(e) => {
                  console.log('File input onChange triggered:', e.target.files[0])
                  handleProfilePictureChange(e)
                }}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="profilePicture"
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  display: 'inline-block',
                  width: 'auto',
                  minWidth: '160px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#16a34a'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#22c55e'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                <i className="fas fa-camera" style={{ marginRight: '0.5rem' }}></i>
                Choose Profile Picture
              </label>
              
              {profilePicture && (
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    width: 'auto',
                    minWidth: '80px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#dc2626'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ef4444'
                  }}
                >
                  <i className="fas fa-trash" style={{ marginRight: '0.25rem' }}></i>
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#1e293b',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#22c55e',
                borderRadius: '50%'
              }}></span>
              Personal Information
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${errors.name ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                placeholder="Enter your full name"
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#22c55e'
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }
                }}
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter your email"
              />
              {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.phone ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phone}</span>}
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1rem' }}>Password</h3>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.password ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                placeholder="Create a password"
              />
              {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.password}</span>}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Government Proof */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1rem' }}>Government Proof</h3>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Document Type *
              </label>
              <select
                name="governmentProofType"
                value={formData.governmentProofType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Document Number *
              </label>
              <input
                type="text"
                name="governmentProofNumber"
                value={formData.governmentProofNumber}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.governmentProofNumber ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter document number"
              />
              {errors.governmentProofNumber && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.governmentProofNumber}</span>}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Upload Document *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.document ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              />
              {errors.document && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.document}</span>}
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Upload image or PDF (max 5MB)
              </p>
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1rem' }}>Address</h3>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Street Address *
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${errors.street ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter street address"
              />
              {errors.street && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.street}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.city ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="City"
                />
                {errors.city && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.city}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.state ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="State"
                />
                {errors.state && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.state}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Pincode *
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${errors.pincode ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Pincode"
                />
                {errors.pincode && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.pincode}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Country"
                />
              </div>
            </div>
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

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
            marginTop: '1rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.875rem 1.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                width: 'auto',
                minWidth: '100px'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#cbd5e1'
                e.target.style.color = '#475569'
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.color = '#64748b'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.875rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.3)',
                width: 'auto',
                minWidth: '140px'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)'
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)'
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default SignupForm
