import React from 'react'

const FormProfileCard = ({ user }) => {
  const name = user?.name || 'John Doe'
  const email = user?.email || 'john.doe@example.com'
  const phone = user?.phone || '+91 98765 43210'

  return (
    <div style={{
      marginTop: '0.9rem',
      padding: '0.8rem',
      borderRadius: '12px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.75rem'
        }}>
          SVC
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{phone}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.45rem' }}>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.45rem 0.55rem', color: '#0f172a', fontSize: '0.78rem' }}>
          <i className="fas fa-map-marker-alt" style={{ color: '#22c55e', marginRight: '0.4rem' }} />
          Bangalore, Karnataka
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.45rem 0.55rem', color: '#0f172a', fontSize: '0.78rem' }}>
          <i className="fas fa-calendar-alt" style={{ color: '#22c55e', marginRight: '0.4rem' }} />
          Member since Jan 2024
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.45rem 0.55rem', color: '#0f172a', fontSize: '0.78rem' }}>
          <i className="fas fa-star" style={{ color: '#22c55e', marginRight: '0.4rem' }} />
          4.8 Rating
        </div>
      </div>
    </div>
  )
}

export default FormProfileCard
