import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

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
                        <span className={`status-badge ${listing.status || 'active'}`}>
                          {listing.status || 'Active'}
                        </span>
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
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="action-btn delete">
                            <i className="fas fa-trash"></i>
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
                        <span className={`status-badge ${listing.status || 'active'}`}>
                          {listing.status || 'Active'}
                        </span>
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
                          <button className="action-btn edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="action-btn delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default HostListings
