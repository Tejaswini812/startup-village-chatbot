import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import apiClient from '../config/axios'

const HostListings = ({ user, isAuthenticated }) => {
  const [listings, setListings] = useState({
    properties: [],
    events: [],
    cars: [],
    packages: [],
    landProperties: [],
    products: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [editListing, setEditListing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [actionLoading, setActionLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserListings()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchUserListings = async () => {
    try {
      // For now, we'll fetch all listings since user-specific endpoints don't exist yet
      // TODO: Implement user-specific API endpoints (my-properties, my-events, etc.)
      const [propertiesRes, eventsRes, carsRes, packagesRes, landPropertiesRes, productsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/properties`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/cars`),
        axios.get(`${API_BASE_URL}/packages`),
        axios.get(`${API_BASE_URL}/land-properties`),
        axios.get(`${API_BASE_URL}/products`)
      ])

      setListings({
        properties: propertiesRes.status === 'fulfilled' ? propertiesRes.value.data : [],
        events: eventsRes.status === 'fulfilled' ? eventsRes.value.data : [],
        cars: carsRes.status === 'fulfilled' ? carsRes.value.data : [],
        packages: packagesRes.status === 'fulfilled' ? packagesRes.value.data : [],
        landProperties: landPropertiesRes.status === 'fulfilled' ? landPropertiesRes.value.data : [],
        products: productsRes.status === 'fulfilled' ? productsRes.value.data : []
      })
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalListings = () => {
    return Object.values(listings).reduce((total, category) => total + category.length, 0)
  }

  const getAllListings = () => {
    const allListings = []
    Object.entries(listings).forEach(([category, items]) => {
      items.forEach(item => {
        allListings.push({ ...item, category })
      })
    })
    return allListings.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
  }

  const getListingsByCategory = (category) => {
    return listings[category] || []
  }

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `₹${price.toLocaleString()}`
  }

  const getCategoryIcon = (category) => {
    const icons = {
      properties: 'fas fa-home',
      events: 'fas fa-calendar-alt',
      cars: 'fas fa-car',
      packages: 'fas fa-suitcase',
      landProperties: 'fas fa-map-marked-alt',
      products: 'fas fa-box'
    }
    return icons[category] || 'fas fa-circle'
  }

  const getCategoryName = (category) => {
    const names = {
      properties: 'Properties',
      events: 'Events',
      cars: 'Cars',
      packages: 'Packages',
      landProperties: 'Land Properties',
      products: 'Products'
    }
    return names[category] || category
  }

  // API path for each listing category (for PUT/DELETE) - must match backend routes
  const getApiPath = (category) => {
    const key = typeof category === 'string' ? category.trim().toLowerCase() : ''
    const paths = {
      properties: 'properties',
      events: 'events',
      cars: 'cars',
      packages: 'packages',
      landproperties: 'land-properties',
      'land-properties': 'land-properties',
      landProperties: 'land-properties',
      products: 'products'
    }
    return paths[key] || paths[category] || null
  }

  const handleDelete = async (listing, categoryOverride) => {
    const id = listing._id || listing.id
    if (!id) return
    const name = listing.title || listing.name || 'this item'
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    const category = categoryOverride != null ? categoryOverride : listing.category
    const path = getApiPath(category)
    if (!path) {
      alert('Cannot delete: unknown listing type.')
      return
    }
    const idStr = String(id).trim()
    setDeletingId(idStr)
    try {
      await apiClient.delete(`/${path}/${idStr}`)
      await fetchUserListings()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to delete'
      alert(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (listing, categoryOverride) => {
    const listingWithCategory = { ...listing, category: categoryOverride != null ? categoryOverride : listing.category }
    setEditListing(listingWithCategory)
    setEditForm({
      title: listing.title || listing.name || '',
      description: listing.description || '',
      location: typeof listing.location === 'string' ? listing.location : (listing.location?.venue || listing.location?.address || listing.location?.city || ''),
      price: listing.price ?? ''
    })
  }

  const saveEdit = async () => {
    const id = editListing?._id || editListing?.id
    if (!editListing || !id) return
    const path = getApiPath(editListing.category)
    if (!path) return
    setActionLoading(true)
    try {
      const payload = { ...editForm, price: Number(editForm.price) || editListing.price }
      await apiClient.put(`/${path}/${String(id)}`, payload)
      setEditListing(null)
      await fetchUserListings()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update'
      alert(msg)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="host-listings-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading your listings...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="host-listings-guest">
        <div className="guest-message">
          <i className="fas fa-info-circle"></i>
          <h3>Sign in to view your listings</h3>
          <p>Create an account or sign in to see your hosted properties, events, and more.</p>
        </div>
      </div>
    )
  }

  const totalListings = getTotalListings()
  const allListings = getAllListings()

  return (
    <div className="host-listings">
      <div className="listings-header">
        <h2>Available Listings</h2>
        <div className="listings-stats">
          <span className="total-count">{totalListings} Total Listings</span>
        </div>
      </div>

      {totalListings === 0 ? (
        <div className="no-listings">
          <div className="no-listings-icon">
            <i className="fas fa-plus-circle"></i>
          </div>
          <h3>No listings available</h3>
          <p>There are currently no listings available. Check back later or create new listings using the action cards above.</p>
        </div>
      ) : (
        <>
          <div className="listings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <i className="fas fa-th-large"></i>
              All ({totalListings})
            </button>
            {Object.entries(listings).map(([category, items]) => (
              items.length > 0 && (
                <button 
                  key={category}
                  className={`tab-btn ${activeTab === category ? 'active' : ''}`}
                  onClick={() => setActiveTab(category)}
                >
                  <i className={getCategoryIcon(category)}></i>
                  {getCategoryName(category)} ({items.length})
                </button>
              )
            ))}
          </div>

          <div className="listings-content">
            {activeTab === 'all' ? (
              <div className="listings-grid">
                {allListings.map((listing, index) => (
                  <div key={`${listing.category}-${listing._id || index}`} className="listing-card">
                    <div className="listing-header">
                      <div className="listing-category">
                        <i className={getCategoryIcon(listing.category)}></i>
                        <span>{getCategoryName(listing.category)}</span>
                      </div>
                      <div className="listing-status">
                        <span className="status-badge active">Live</span>
                      </div>
                    </div>
                    
                    <div className="listing-content">
                      <h3 className="listing-title">{listing.title || listing.name}</h3>
                      <p className="listing-description">
                        {listing.description || listing.shortDescription || 'No description available'}
                      </p>
                      
                      {listing.location && (
                        <div className="listing-location">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>
                            {listing.location.city && listing.location.state 
                              ? `${listing.location.city}, ${listing.location.state}`
                              : listing.location.venue || listing.location.address || 'Location not specified'
                            }
                          </span>
                        </div>
                      )}
                      
                      <div className="listing-footer">
                        <div className="listing-price">
                          {listing.price !== undefined && (
                            <span className="price">{formatPrice(listing.price)}</span>
                          )}
                        </div>
                        <div className="listing-actions">
                          <button type="button" className="action-btn edit" onClick={() => openEdit(listing)} title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button type="button" className="action-btn delete" onClick={() => handleDelete(listing)} disabled={deletingId === (listing._id || listing.id)} title="Delete">
                            {deletingId === (listing._id || listing.id) ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="listings-grid">
                {getListingsByCategory(activeTab).map((listing, index) => (
                  <div key={listing._id || index} className="listing-card">
                    <div className="listing-header">
                      <div className="listing-category">
                        <i className={getCategoryIcon(activeTab)}></i>
                        <span>{getCategoryName(activeTab)}</span>
                      </div>
                      <div className="listing-status">
                        <span className="status-badge active">Live</span>
                      </div>
                    </div>
                    
                    <div className="listing-content">
                      <h3 className="listing-title">{listing.title || listing.name}</h3>
                      <p className="listing-description">
                        {listing.description || listing.shortDescription || 'No description available'}
                      </p>
                      
                      {listing.location && (
                        <div className="listing-location">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>
                            {listing.location.city && listing.location.state 
                              ? `${listing.location.city}, ${listing.location.state}`
                              : listing.location.venue || listing.location.address || 'Location not specified'
                            }
                          </span>
                        </div>
                      )}
                      
                      <div className="listing-footer">
                        <div className="listing-price">
                          {listing.price !== undefined && (
                            <span className="price">{formatPrice(listing.price)}</span>
                          )}
                        </div>
                        <div className="listing-actions">
                          <button type="button" className="action-btn edit" onClick={() => openEdit(listing, activeTab)} title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button type="button" className="action-btn delete" onClick={() => handleDelete(listing, activeTab)} disabled={deletingId === (listing._id || listing.id)} title="Delete">
                            {deletingId === (listing._id || listing.id) ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editListing && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => !actionLoading && setEditListing(null)}>
              <div className="edit-listing-modal" style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', minWidth: 320, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Edit listing</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 4 }}>Title</label>
                    <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 4 }}>Description</label>
                    <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 4 }}>Location</label>
                    <input type="text" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: 4 }}>Price</label>
                    <input type="number" min={0} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="button" onClick={saveEdit} disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer' }}>
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditListing(null)} disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HostListings
