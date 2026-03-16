import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import HostProperty from '../components/HostProperty'
import LaunchEvents from '../components/LaunchEvents'
import HostLandProperty from '../components/HostLandProperty'
import AddProducts from '../components/AddProducts'
import ListPackage from '../components/ListPackage'
import CarReselling from '../components/CarReselling'
import MultiStepPropertyForm from '../components/MultiStepPropertyForm'
import MultiStepEventForm from '../components/MultiStepEventForm'
import MultiStepLandPropertyForm from '../components/MultiStepLandPropertyForm'
import MultiStepProductForm from '../components/MultiStepProductForm'
import MultiStepPackageForm from '../components/MultiStepPackageForm'
import MultiStepCarForm from '../components/MultiStepCarForm'
import HostListings from '../components/HostListings'

const Dashboard = () => {
  const { user, login, logout, isAuthenticated, loading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showHostProperty, setShowHostProperty] = useState(false)
  const [showLaunchEvents, setShowLaunchEvents] = useState(false)
  const [showHostLandProperty, setShowHostLandProperty] = useState(false)
  const [showAddProducts, setShowAddProducts] = useState(false)
  const [showListPackage, setShowListPackage] = useState(false)
  const [showCarReselling, setShowCarReselling] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [activeForm, setActiveForm] = useState(null)
  const [currentStep, setCurrentStep] = useState('')
  const [formData, setFormData] = useState({})

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Debug mobile modal state
  useEffect(() => {
    if (isMobile && activeForm) {
      console.log('🔧 Mobile modal should be visible for:', activeForm)
    }
  }, [isMobile, activeForm])

  const handleAuthRequired = (action) => {
    setSelectedAction(action)
    setShowAuthRequiredModal(true)
  }

  const handleActionClick = (action) => {
    console.log('🔧 Action clicked:', action)
    console.log('🔧 Is mobile:', isMobile)
    
    // Set the active form to show inline instead of modal
    setActiveForm(action)
    
    // For Host a Property, start with multi-step form
    if (action === 'Host a Property') {
      setCurrentStep('property-name')
      setFormData({})
    } else {
      setCurrentStep('')
    }
    
    // Also set the individual form states for backward compatibility
    if (action === 'Host a Property') {
      setShowHostProperty(true)
    } else if (action === 'Launch Events') {
      setShowLaunchEvents(true)
    } else if (action === 'Host a Land Property') {
      setShowHostLandProperty(true)
    } else if (action === 'Add Products') {
      setShowAddProducts(true)
    } else if (action === 'List Package/Trip') {
      setShowListPackage(true)
    } else if (action === 'Car Reselling') {
      setShowCarReselling(true)
    }
    
    console.log('🔧 Active form set to:', action)
  }

  const handleStepClick = (step) => {
    setCurrentStep(step)
  }

  const handleFormDataChange = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }))
  }

  const handleCloseForm = () => {
    setActiveForm(null)
    setShowHostProperty(false)
    setShowLaunchEvents(false)
    setShowHostLandProperty(false)
    setShowAddProducts(false)
    setShowListPackage(false)
    setShowCarReselling(false)
  }

  const handleLoginSuccess = (userData, token) => {
    login(userData, token)
    setShowLoginModal(false)
    // After successful login, show the appropriate form
    if (selectedAction === 'Host a Property') {
      setShowHostProperty(true)
    } else if (selectedAction === 'Launch Events') {
      setShowLaunchEvents(true)
    } else if (selectedAction === 'Host a Land Property') {
      setShowHostLandProperty(true)
    } else if (selectedAction === 'Add Products') {
      setShowAddProducts(true)
    } else if (selectedAction === 'List Package/Trip') {
      setShowListPackage(true)
    } else if (selectedAction === 'Car Reselling') {
      setShowCarReselling(true)
    }
    setSelectedAction('')
  }

  const handleSignupSuccess = (userData, token) => {
    login(userData, token)
    setShowSignupModal(false)
    // After successful signup, show the appropriate form
    if (selectedAction === 'Host a Property') {
      setShowHostProperty(true)
    } else if (selectedAction === 'Launch Events') {
      setShowLaunchEvents(true)
    } else if (selectedAction === 'Host a Land Property') {
      setShowHostLandProperty(true)
    } else if (selectedAction === 'Add Products') {
      setShowAddProducts(true)
    } else if (selectedAction === 'List Package/Trip') {
      setShowListPackage(true)
    } else if (selectedAction === 'Car Reselling') {
      setShowCarReselling(true)
    }
    setSelectedAction('')
  }

  // Show loading spinner while AuthContext is initializing
  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#22c55e'
        }}>
          <div>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
            Loading Dashboard...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <img src="/image.jpg.jpg" alt="Startup Village County Logo" className="header-logo" />
          <h1 className="header-title">Dashboard</h1>
        </div>
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-info">
              <span className="user-name">Welcome, {user?.name}</span>
              <button className="header-logout-btn" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          ) : (
            <>
              <button className="header-login-btn" onClick={() => setShowLoginModal(true)}>
                <i className="fas fa-sign-in-alt"></i>
                Login
              </button>
              <button className="header-signup-btn" onClick={() => setShowSignupModal(true)}>
                <i className="fas fa-user-plus"></i>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="profile-picture">
              {isAuthenticated && user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile Picture" 
                  className="profile-image"
                />
              ) : (
                <div className="profile-logo">STARTUP VILLAGE COUNTY</div>
              )}
            </div>
            
            <div className="user-details">
              <h3>{isAuthenticated ? (user?.name || 'User') : 'John Doe'}</h3>
              <p>{isAuthenticated ? (user?.email || 'user@example.com') : 'john.doe@example.com'}</p>
              <p>{isAuthenticated ? (user?.phone || '+91 00000 00000') : '+91 98765 43210'}</p>
            </div>
            
            <div className="status-indicators">
              <div className="status-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{isAuthenticated ? (user?.location || 'Location not set') : 'Bangalore, Karnataka'}</span>
              </div>
              <div className="status-item">
                <i className="fas fa-calendar"></i>
                <span>{isAuthenticated ? `Member since ${user?.joinDate || 'Recently'}` : 'Member since Jan 2024'}</span>
              </div>
              <div className="status-item">
                <i className="fas fa-star"></i>
                <span>{isAuthenticated ? (user?.rating || 'New User') : '4.8 Rating'}</span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={() => setShowEditProfileModal(true)}>
                <i className="fas fa-pencil-alt"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-main-layout">
          {/* Full Width Content */}
          <div className="right-column" style={{ width: '100%' }}>
            {!activeForm || isMobile ? (
              <div className="dashboard-main">
                <div className="action-cards">
                  <div className="action-card" onClick={() => handleActionClick('Host a Property')}>
                    <div className="action-icon">
                      <i className="fas fa-home"></i>
                    </div>
                    <div className="action-content">
                      <h3>Host a Property</h3>
                    </div>
                    <button className="action-btn">Get Started</button>
                  </div>

                  <div className="action-card" onClick={() => handleActionClick('Launch Events')}>
                    <div className="action-icon">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div className="action-content">
                      <h3>Launch Events</h3>
                    </div>
                    <button className="action-btn">Create Event</button>
                  </div>

                  <div className="action-card" onClick={() => handleActionClick('Host a Land Property')}>
                    <div className="action-icon">
                      <i className="fas fa-map-marked-alt"></i>
                    </div>
                    <div className="action-content">
                      <h3>Host a Land Property</h3>
                    </div>
                    <button className="action-btn">List Land</button>
                  </div>

                  <div className="action-card" onClick={() => handleActionClick('Add Products')}>
                    <div className="action-icon">
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    <div className="action-content">
                      <h3>Create a Cart</h3>
                    </div>
                  </div>

                  <div className="action-card" onClick={() => handleActionClick('List Package/Trip')}>
                    <div className="action-icon">
                      <i className="fas fa-suitcase"></i>
                    </div>
                    <div className="action-content">
                      <h3>List Package/Trip</h3>
                    </div>
                  </div>

                  <div className="action-card" onClick={() => handleActionClick('Car Reselling')}>
                    <div className="action-icon">
                      <i className="fas fa-car"></i>
                    </div>
                    <div className="action-content">
                      <h3>Car Reselling</h3>
                    </div>
                  </div>
                </div>
                
                {/* Host Listings Section */}
                <HostListings user={user} isAuthenticated={isAuthenticated} />
              </div>
            ) : (
              <div className="form-container">
                <div className="form-header">
                  <h2>{activeForm}</h2>
                  <button className="close-form-btn" onClick={handleCloseForm}>
                    <i className="fas fa-times"></i>
                    Close
                  </button>
                </div>
                
                <div className="form-content">
                  {activeForm === 'Host a Property' && (
                    <MultiStepPropertyForm 
                      onClose={handleCloseForm} 
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                  
                  {activeForm === 'Launch Events' && (
                    <MultiStepEventForm 
                      onClose={handleCloseForm} 
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                  
                  {activeForm === 'Host a Land Property' && (
                    <MultiStepLandPropertyForm 
                      onClose={handleCloseForm} 
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                  
                  {activeForm === 'Add Products' && (
                    <MultiStepProductForm 
                      onClose={handleCloseForm} 
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                  
                  {activeForm === 'List Package/Trip' && (
                    <MultiStepPackageForm 
                      onClose={handleCloseForm} 
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                  
                  {activeForm === 'Car Reselling' && (
                    <MultiStepCarForm 
                      onClose={handleCloseForm} 
                      onAuthRequired={handleAuthRequired}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginForm
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          onShowSignup={() => { setShowLoginModal(false); setShowSignupModal(true) }}
        />
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupForm
          onClose={() => setShowSignupModal(false)}
          onSuccess={handleSignupSuccess}
        />
      )}

      {/* Authentication Required Modal */}
      {showAuthRequiredModal && (
        <div className="modal-overlay">
          <div className="auth-required-modal">
            <div className="modal-header">
              <h2>Authentication Required</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowAuthRequiredModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="auth-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h3>Login Required</h3>
              <p>You need to be logged in to {selectedAction.toLowerCase()}.</p>
              <p>Please sign up or login to continue.</p>
              <div className="modal-actions">
                <button 
                  className="login-btn"
                  onClick={() => {
                    setShowAuthRequiredModal(false)
                    setShowLoginModal(true)
                  }}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </button>
                <button 
                  className="signup-btn-modal"
                  onClick={() => {
                    setShowAuthRequiredModal(false)
                    setShowSignupModal(true)
                  }}
                >
                  <i className="fas fa-user-plus"></i>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowEditProfileModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <form className="edit-profile-form">
                <div className="form-group">
                  <label htmlFor="profilePicture">Profile Picture</label>
                  <input 
                    type="file" 
                    id="profilePicture" 
                    accept="image/*"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    defaultValue={isAuthenticated ? (user?.name || '') : 'John Doe'}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    defaultValue={isAuthenticated ? (user?.email || '') : 'john.doe@example.com'}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    defaultValue={isAuthenticated ? (user?.phone || '') : '+91 98765 43210'}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input 
                    type="text" 
                    id="location" 
                    defaultValue={isAuthenticated ? (user?.location || '') : 'Bangalore, Karnataka'}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea 
                    id="bio" 
                    rows="3"
                    placeholder="Tell us about yourself..."
                    className="form-textarea"
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowEditProfileModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      const formData = {
                        name: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        location: document.getElementById('location').value,
                        bio: document.getElementById('bio').value
                      }
                      
                      // Update user data in context
                      if (isAuthenticated) {
                        // Here you would typically make an API call to update the user profile
                        // For now, we'll just show a success message
                        alert('Profile updated successfully!')
                        setShowEditProfileModal(false)
                      }
                    }}
                  >
                    <i className="fas fa-save"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Form Modals */}
      {isMobile && activeForm && (
        <div className="form-container" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="multistep-form" style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            margin: '1rem'
          }}>
            <button className="close-form-btn" onClick={handleCloseForm} style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 1001
            }}>
              <i className="fas fa-times"></i>
            </button>
            
            {activeForm === 'Host a Property' && (
              <MultiStepPropertyForm 
                onClose={handleCloseForm} 
                onAuthRequired={handleAuthRequired}
              />
            )}
            
            {activeForm === 'Launch Events' && (
              <MultiStepEventForm 
                onClose={handleCloseForm} 
                onAuthRequired={handleAuthRequired}
              />
            )}
            
            {activeForm === 'Host a Land Property' && (
              <MultiStepLandPropertyForm 
                onClose={handleCloseForm} 
                onAuthRequired={handleAuthRequired}
              />
            )}
            
            {activeForm === 'Add Products' && (
              <MultiStepProductForm 
                onClose={handleCloseForm} 
                onAuthRequired={handleAuthRequired}
              />
            )}
            
            {activeForm === 'List Package/Trip' && (
              <MultiStepPackageForm 
                onClose={handleCloseForm} 
                onAuthRequired={handleAuthRequired}
              />
            )}
            
            {activeForm === 'Car Reselling' && (
              <MultiStepCarForm 
                onClose={handleCloseForm} 
                onAuthRequired={handleAuthRequired}
              />
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard