import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const UserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [properties, setProperties] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProperties(response.data.properties || [])
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // If user is not authenticated, show login/signup options
  if (!user) {
    return (
      <div className="user-dashboard" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Header */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h1 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Welcome to Startup Village County</h1>
            <p style={{ margin: '0 0 2rem 0', color: '#6b7280', fontSize: '1.1rem' }}>
              Access your dashboard to manage properties, events, and more
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLoginModal(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: 'transparent',
                  color: '#22c55e',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#22c55e'
                  e.target.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#22c55e'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => setShowSignupModal(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#16a34a'
                  e.target.style.borderColor = '#16a34a'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#22c55e'
                  e.target.style.borderColor = '#22c55e'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Features Preview */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', textAlign: 'center' }}>Dashboard Features</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '8px',
                border: '1px solid #0ea5e9'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>🏠 Property Management</h3>
                <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
                  Host and manage your properties with detailed listings, pricing, and availability tracking.
                </p>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '8px',
                border: '1px solid #22c55e'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#14532d' }}>🎉 Event Management</h3>
                <p style={{ margin: 0, color: '#16a34a', fontSize: '0.9rem' }}>
                  Create and manage events with booking management, capacity tracking, and attendee details.
                </p>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px',
                border: '1px solid #f59e0b'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>👤 Profile Management</h3>
                <p style={{ margin: 0, color: '#d97706', fontSize: '0.9rem' }}>
                  Update your profile information, manage contact details, and track your activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginForm
            onClose={() => setShowLoginModal(false)}
            onSuccess={(userData) => {
              // Handle successful login
              setShowLoginModal(false)
              window.location.reload() // Refresh to show authenticated state
            }}
            onShowSignup={() => { setShowLoginModal(false); setShowSignupModal(true) }}
          />
        )}

        {/* Signup Modal */}
        {showSignupModal && (
          <SignupForm
            onClose={() => setShowSignupModal(false)}
            onSuccess={(message) => {
              alert(message)
              setShowSignupModal(false)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="user-dashboard" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Welcome back, {user.name}!</h1>
              <p style={{ margin: 0, color: '#6b7280' }}>Manage your properties and events</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'properties', label: 'My Properties' },
              { id: 'events', label: 'My Events' },
              { id: 'profile', label: 'Profile' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#22c55e' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderBottom: activeTab === tab.id ? '2px solid #16a34a' : '2px solid transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Dashboard Overview</h2>
              

              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Recent Activity</h3>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {properties.length === 0 && events.length === 0 
                      ? 'No recent activity. Start by adding a property or creating an event!'
                      : `You have ${properties.length} properties and ${events.length} events in your account.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1e293b' }}>My Properties</h2>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Add Property
                </button>
              </div>

              {properties.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem', 
                  color: '#6b7280' 
                }}>
                  <p>No properties found. Add your first property to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {properties.map(property => (
                    <div key={property._id} style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{property.title}</h3>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>{property.type}</p>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>{property.location.city}, {property.location.state}</p>
                          <p style={{ margin: 0, color: '#22c55e', fontWeight: 'bold' }}>₹{property.price.toLocaleString()}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1e293b' }}>My Events</h2>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Create Event
                </button>
              </div>

              {events.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem', 
                  color: '#6b7280' 
                }}>
                  <p>No events found. Create your first event to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {events.map(event => (
                    <div key={event._id} style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{event.title}</h3>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>{event.category}</p>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>{event.location.venue}, {event.location.city}</p>
                          <p style={{ margin: 0, color: '#22c55e', fontWeight: 'bold' }}>
                            {event.price === 0 ? 'Free' : `₹${event.price}`}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Profile Settings</h2>
              
              <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue={user.phone}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginTop: '1rem'
                  }}
                >
                  Update Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
