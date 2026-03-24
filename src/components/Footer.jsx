import React, { useEffect, useMemo, useState } from 'react'

const Footer = () => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })

  const bookingUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('booking_user_session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [showProfileModal])

  const displayName = bookingUser?.name || 'Guest User'
  const displayEmail = bookingUser?.email || 'Login to view details'
  const displayPhone = bookingUser?.phone || 'Phone not available'

  useEffect(() => {
    if (showProfileModal) {
      setEditForm({
        name: bookingUser?.name || '',
        email: bookingUser?.email || '',
        phone: bookingUser?.phone || ''
      })
      setIsEditing(false)
    }
  }, [showProfileModal, bookingUser?.name, bookingUser?.email, bookingUser?.phone])

  const handleSave = () => {
    const next = {
      name: (editForm.name || '').trim(),
      email: (editForm.email || '').trim(),
      phone: (editForm.phone || '').trim()
    }
    localStorage.setItem('booking_user_session', JSON.stringify(next))
    setIsEditing(false)
  }

  return (
    <React.Fragment>
    <footer className="footer-section" style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '8px 0',
      zIndex: '1000'
    }}>
      <div className="footer-navigation" style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '100%'
      }}>
        <div className="nav-item" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 8px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>🏠</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Home</div>
        </div>
        <div className="nav-item" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 8px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>📋</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Menu</div>
        </div>
        <div className="nav-item" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 8px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>🛒</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Cart</div>
        </div>
        <div className="nav-item" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 8px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>💬</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Message</div>
        </div>
        <div
          className="nav-item"
          onClick={() => setShowProfileModal(true)}
          style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 8px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>👤</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Profile</div>
        </div>
      </div>
    </footer>
    {showProfileModal && (
      <div
        onClick={() => setShowProfileModal(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.5)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '380px',
            background: '#fff',
            borderRadius: '14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>User Profile</div>
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              style={{ background: 'transparent', color: '#fff', border: 0, fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: '1rem 1.2rem' }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Name</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{displayName}</div>
              )}
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email</div>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ color: '#0f172a' }}>{displayEmail}</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone</div>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ color: '#0f172a' }}>{displayPhone}</div>
              )}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    border: 0,
                    borderRadius: '8px',
                    background: '#22c55e',
                    color: '#fff',
                    padding: '0.5rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Edit
                </button>
              ) : (
                <React.Fragment>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      background: '#fff',
                      color: '#334155',
                      padding: '0.5rem 0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    style={{
                      border: 0,
                      borderRadius: '8px',
                      background: '#16a34a',
                      color: '#fff',
                      padding: '0.5rem 0.9rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Save
                  </button>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </React.Fragment>
  )
}

export default Footer
