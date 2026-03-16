import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'studio', 'pg']

function imageUrl(path) {
  if (!path || typeof path !== 'string') return ''
  if (path.startsWith('http')) return path
  const base = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}

export default function AdminPropertiesPage() {
  const navigate = useNavigate()
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const fetchPending = () => {
    setLoading(true)
    apiClient.get(`${API_BASE_URL}/admin/pending-properties`)
      .then(res => {
        setPending(res.data || [])
        setError(null)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load pending properties')
        setPending([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPending() }, [])

  const handleApprove = (id) => {
    setActionLoading(id)
    apiClient.put(`${API_BASE_URL}/admin/approve-property/${id}`)
      .then(() => fetchPending())
      .catch(() => setActionLoading(null))
      .finally(() => setActionLoading(null))
  }

  const handleReject = (id) => {
    if (!window.confirm('Reject this property? It will not be shown on the site.')) return
    setActionLoading(id)
    apiClient.put(`${API_BASE_URL}/admin/reject-property/${id}`)
      .then(() => fetchPending())
      .catch(() => setActionLoading(null))
      .finally(() => setActionLoading(null))
  }

  const openEdit = (p) => {
    setEditId(p._id)
    setEditForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      location: p.location || '',
      propertyType: p.propertyType || 'apartment',
      bedrooms: p.bedrooms ?? '',
      bathrooms: p.bathrooms ?? '',
      area: p.area ?? '',
      amenities: p.amenities || '',
      contactInfo: p.contactInfo || ''
    })
  }

  const closeEdit = () => {
    setEditId(null)
    setEditForm({})
  }

  const saveEdit = () => {
    if (!editId) return
    const payload = {
      title: editForm.title,
      description: editForm.description,
      price: Number(editForm.price) || 0,
      location: editForm.location,
      propertyType: editForm.propertyType,
      bedrooms: Number(editForm.bedrooms) || 0,
      bathrooms: Number(editForm.bathrooms) || 0,
      area: Number(editForm.area) || 0,
      amenities: editForm.amenities,
      contactInfo: editForm.contactInfo
    }
    setActionLoading(editId)
    apiClient.put(`${API_BASE_URL}/admin/edit-property/${editId}`, payload)
      .then(() => { closeEdit(); fetchPending() })
      .catch(() => setActionLoading(null))
      .finally(() => setActionLoading(null))
  }

  return (
    <div className="listing-page" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="listing-container" style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="back-button" onClick={() => navigate(-1)} style={{ marginBottom: 0 }}>
            <i className="fas fa-arrow-left" /> Back
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Admin – Pending properties</h1>
        </div>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Only the website owner can approve, reject, or edit properties. Approved properties appear on the site.
        </p>

        {loading && <div className="loading-spinner" style={{ margin: '2rem auto' }} />}
        {error && <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>}

        {!loading && pending.length === 0 && !error && (
          <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>No pending properties.</p>
        )}

        {!loading && pending.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pending.map((p) => (
              <li
                key={p._id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '1rem',
                  marginBottom: '1rem',
                  background: '#fff'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    {p.images && p.images[0] && (
                      <img
                        src={imageUrl(p.images[0])}
                        alt=""
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{p.location} · ₹{Number(p.price).toLocaleString()}</div>
                      {p.contactInfo && <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: 4 }}>Contact: {p.contactInfo}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="back-button"
                      style={{ margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(p._id)}
                      disabled={actionLoading === p._id}
                      style={{ padding: '0.4rem 0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: actionLoading === p._id ? 'wait' : 'pointer', fontSize: '0.875rem' }}
                    >
                      {actionLoading === p._id ? '...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(p._id)}
                      disabled={actionLoading === p._id}
                      style={{ padding: '0.4rem 0.75rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: actionLoading === p._id ? 'wait' : 'pointer', fontSize: '0.875rem' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {editId && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, maxWidth: 480, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Edit property</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Title</label><input type="text" value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Location</label><input type="text" value={editForm.location} onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Price</label><input type="number" value={editForm.price} onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Property type</label><select value={editForm.propertyType} onChange={(e) => setEditForm(f => ({ ...f, propertyType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>{PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div style={{ display: 'flex', gap: '0.5rem' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Bedrooms</label><input type="number" min="0" value={editForm.bedrooms} onChange={(e) => setEditForm(f => ({ ...f, bedrooms: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Bathrooms</label><input type="number" min="0" value={editForm.bathrooms} onChange={(e) => setEditForm(f => ({ ...f, bathrooms: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Area</label><input type="number" min="0" value={editForm.area} onChange={(e) => setEditForm(f => ({ ...f, area: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Amenities</label><input type="text" value={editForm.amenities} onChange={(e) => setEditForm(f => ({ ...f, amenities: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Description</label><textarea value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Contact info</label><input type="text" value={editForm.contactInfo} onChange={(e) => setEditForm(f => ({ ...f, contactInfo: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={saveEdit} disabled={actionLoading === editId} style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: actionLoading === editId ? 'wait' : 'pointer' }}>Save</button>
                <button type="button" onClick={closeEdit} className="back-button">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
