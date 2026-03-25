import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const PackagesListingPage = () => {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [filteredPackages, setFilteredPackages] = useState([])
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  // Fetch packages from API - ALL packages (not limited to 10)
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log('Fetching ALL packages from API...')
        const response = await axios.get(`${API_BASE_URL}/packages`)
        console.log('Packages API response:', response.data)
        
        if (response.data && response.data.length > 0) {
          // Transform API packages to match the expected format
          const apiPackages = response.data.map(pkg => ({
            id: pkg._id || pkg.id,
            title: pkg.title,
            location: pkg.destination,
            price: pkg.price,
            rating: 4.5, // Default rating
            duration: pkg.duration,
            image: pkg.images?.[0] ? `http://localhost:5000/${pkg.images[0]}` : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: pkg.description || '',
            includes: pkg.includes || '',
            packageType: pkg.packageType || ''
          }))
          
          console.log('All API packages loaded:', apiPackages.length)
          setPackages(apiPackages)
          setFilteredPackages(apiPackages)
        } else {
          console.log('No packages in API response, using landing page data')
          // Use exact same data as landing page
          const landingPagePackages = [
            {
              id: 1,
              title: "Goa Beach Package",
              location: "Goa, India",
              price: 15000,
              rating: 4.8,
              duration: "3 Days / 2 Nights",
              image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Amazing beach package with water sports",
              includes: "Hotel, Meals, Activities",
              packageType: "Beach"
            },
            {
              id: 2,
              title: "Kerala Backwaters",
              location: "Kerala, India",
              price: 18500,
              rating: 4.6,
              duration: "4 Days / 3 Nights",
              image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Peaceful backwater cruise experience",
              includes: "Houseboat, Meals, Sightseeing",
              packageType: "Backwater"
            },
            {
              id: 3,
              title: "Himachal Adventure",
              location: "Manali, India",
              price: 22000,
              rating: 4.9,
              duration: "5 Days / 4 Nights",
              image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Adventure sports and mountain views",
              includes: "Hotel, Meals, Adventure Activities",
              packageType: "Adventure"
            }
          ]
          setPackages(landingPagePackages)
          setFilteredPackages(landingPagePackages)
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
        console.log('Using landing page package data')
        // Use exact same data as landing page
        const landingPagePackages = [
          {
            id: 1,
            title: "Goa Beach Package",
            location: "Goa, India",
            price: 15000,
            rating: 4.8,
            duration: "3 Days / 2 Nights",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Amazing beach package with water sports",
            includes: "Hotel, Meals, Activities",
            packageType: "Beach"
          },
          {
            id: 2,
            title: "Kerala Backwaters",
            location: "Kerala, India",
            price: 18500,
            rating: 4.6,
            duration: "4 Days / 3 Nights",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Peaceful backwater cruise experience",
            includes: "Houseboat, Meals, Sightseeing",
            packageType: "Backwater"
          },
          {
            id: 3,
            title: "Himachal Adventure",
            location: "Manali, India",
            price: 22000,
            rating: 4.9,
            duration: "5 Days / 4 Nights",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Adventure sports and mountain views",
            includes: "Hotel, Meals, Adventure Activities",
            packageType: "Adventure"
          }
        ]
        setPackages(landingPagePackages)
        setFilteredPackages(landingPagePackages)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPackages()
  }, [])

  // Filter packages based on selected filters
  useEffect(() => {
    let filtered = packages

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(pkg => pkg.price >= min && pkg.price <= max)
    }

    if (filters.rating) {
      const minRating = Number(filters.rating)
      filtered = filtered.filter(pkg => pkg.rating >= minRating)
    }

    if (filters.location) {
      filtered = filtered.filter(pkg => 
        pkg.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredPackages(filtered)
  }, [filters, packages])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: '',
      rating: '',
      location: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="listing-page">
      <div className="listing-container">
        {/* Header */}
        <div className="listing-header">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <div className="header-content">
            <h1 className="listing-title">Travel Packages</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-header">
            <i className="fas fa-filter filter-icon"></i>
            <h2 className="filter-title">Filter Options</h2>
          </div>
          <div className="filter-grid">
            {/* Price Range Filter */}
            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="filter-select"
              >
                <option value="">All Prices</option>
                <option value="0-15000">Under ₹15,000</option>
                <option value="15000-25000">₹15,000 - ₹25,000</option>
                <option value="25000-35000">₹25,000 - ₹35,000</option>
                <option value="35000-999999">Above ₹35,000</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="filter-label">Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="filter-select"
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <input
                type="text"
                placeholder="Enter destination"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
            <div className="results-count">
              <i className="fas fa-search"></i>
              {filteredPackages.length} packages found
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="items-grid">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="item-card">
              <div className="card-image-container">
                <img 
                  src={pkg.image} 
                  alt={pkg.title}
                  className="card-image"
                />
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  {pkg.rating}
                </div>
                <div className="category-badge">
                  {pkg.duration}
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{pkg.title}</h3>
                <p className="card-info">
                  <i className="fas fa-map-marker-alt"></i>
                  {pkg.location}
                </p>
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(pkg.rating) ? '' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                  <span className="rating-text">{pkg.rating} rating</span>
                </div>
                <div className="price-section">
                  <div>
                    <span className="price">₹{pkg.price.toLocaleString()}</span>
                    <span className="price-unit">per person</span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button
                    type="button"
                    className="action-btn primary-btn"
                    onClick={() => navigate(`/package/${pkg.id}`, {
                      state: { packageCard: { ...pkg, destination: pkg.destination || pkg.location } }
                    })}
                  >
                    <i className="fas fa-calendar-check"></i>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <i className="fas fa-search empty-icon"></i>
              <h3 className="empty-title">No packages found</h3>
              <p className="empty-description">Try adjusting your filters to see more results</p>
              <button
                onClick={clearFilters}
                className="empty-action-btn"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default PackagesListingPage
