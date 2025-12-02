import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const PropertiesListingPage = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  // Fetch properties from API - ALL properties (not limited to 10)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching ALL properties from API...')
        // Fetch both properties and land properties
        const [propertiesResponse, landPropertiesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/properties`),
          axios.get(`${API_BASE_URL}/land-properties`)
        ])
        
        console.log('Properties API response:', propertiesResponse.data)
        console.log('Land Properties API response:', landPropertiesResponse.data)
        
        // Transform properties data
        const transformedProperties = propertiesResponse.data?.map(property => ({
          id: property._id,
          name: property.title,
          location: property.location || 'Location',
          price: property.price,
          rating: 4.5, // Default rating
          type: property.propertyType,
          image: property.images?.[0] ? 
            (property.images[0].startsWith('http') ? 
              property.images[0] : 
              `http://localhost:5000/${property.images[0].replace(/\\/g, '/')}`) : 
            'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop',
          area: property.area,
          description: property.description
        })) || []
        
        // Transform land properties data
        const transformedLandProperties = landPropertiesResponse.data?.map(landProperty => ({
          id: `land_${landProperty._id}`,
          name: landProperty.title,
          location: landProperty.location || 'Location',
          price: landProperty.price,
          rating: 4.5, // Default rating
          type: landProperty.landType,
          image: landProperty.images?.[0] ? 
            (landProperty.images[0].startsWith('http') ? 
              landProperty.images[0] : 
              `http://localhost:5000/${landProperty.images[0].replace(/\\/g, '/')}`) : 
            'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop',
          area: landProperty.area,
          description: landProperty.description
        })) || []
        
        // Combine both types of properties - ALL properties (no limit)
        const allProperties = [...transformedProperties, ...transformedLandProperties]
        
        if (allProperties.length > 0) {
          console.log('All properties loaded:', allProperties.length)
          setProperties(allProperties)
          setFilteredProperties(allProperties)
        } else {
          console.log('No properties from API, using landing page data')
          // Use exact same data as landing page
          const landingPageProperties = [
            {
              id: 1,
              name: "Luxury Villa",
              location: "Bangalore",
              price: 11500000,
              rating: 4.8,
              type: "Villa",
              image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
              area: "1,500 sqft",
              description: "Beautiful luxury villa with modern amenities"
            },
            {
              id: 2,
              name: "Modern Apartment",
              location: "Mysore",
              price: 11500000,
              rating: 4.6,
              type: "Apartment",
              image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
              area: "1,500 sqft",
              description: "Contemporary apartment in prime location"
            },
            {
              id: 3,
              name: "Premium House",
              location: "Coorg",
              price: 18000000,
              rating: 4.9,
              type: "House",
              image: "https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
              area: "2,000 sqft",
              description: "Premium house with luxury features"
            },
            {
              id: 4,
              name: "Executive Villa",
              location: "Hassan",
              price: 25000000,
              rating: 4.4,
              type: "Villa",
              image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
              area: "2,200 sqft",
              description: "Executive villa with premium amenities"
            },
            {
              id: 5,
              name: "Cozy Home",
              location: "Shivana Samudra",
              price: 8500000,
              rating: 4.7,
              type: "Home",
              image: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
              area: "1,800 sqft",
              description: "Cozy and comfortable home"
            }
          ]
          setProperties(landingPageProperties)
          setFilteredProperties(landingPageProperties)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        console.log('Using landing page property data')
        // Use exact same data as landing page
        const landingPageProperties = [
          {
            id: 1,
            name: "Luxury Villa",
            location: "Bangalore",
            price: 11500000,
            rating: 4.8,
            type: "Villa",
            image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
            area: "1,500 sqft",
            description: "Beautiful luxury villa with modern amenities"
          },
          {
            id: 2,
            name: "Modern Apartment",
            location: "Mysore",
            price: 11500000,
            rating: 4.6,
            type: "Apartment",
            image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
            area: "1,500 sqft",
            description: "Contemporary apartment in prime location"
          },
          {
            id: 3,
            name: "Premium House",
            location: "Coorg",
            price: 18000000,
            rating: 4.9,
            type: "House",
            image: "https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
            area: "2,000 sqft",
            description: "Premium house with luxury features"
          },
          {
            id: 4,
            name: "Executive Villa",
            location: "Hassan",
            price: 25000000,
            rating: 4.4,
            type: "Villa",
            image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
            area: "2,200 sqft",
            description: "Executive villa with premium amenities"
          },
          {
            id: 5,
            name: "Cozy Home",
            location: "Shivana Samudra",
            price: 8500000,
            rating: 4.7,
            type: "Home",
            image: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop",
            area: "1,800 sqft",
            description: "Cozy and comfortable home"
          }
        ]
        setProperties(landingPageProperties)
        setFilteredProperties(landingPageProperties)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProperties()
  }, [])

  // Filter properties based on selected filters
  useEffect(() => {
    let filtered = properties

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(property => property.price >= min && property.price <= max)
    }

    if (filters.rating) {
      const minRating = Number(filters.rating)
      filtered = filtered.filter(property => property.rating >= minRating)
    }

    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredProperties(filtered)
  }, [filters, properties])

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
            <h1 className="listing-title">Buy & Sell / Lease → Property</h1>
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
                <option value="0-10000000">Under ₹1 Cr</option>
                <option value="10000000-25000000">₹1 Cr - ₹2.5 Cr</option>
                <option value="25000000-50000000">₹2.5 Cr - ₹5 Cr</option>
                <option value="50000000-999999999">Above ₹5 Cr</option>
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
                placeholder="Enter city name"
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
              {filteredProperties.length} properties found
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="items-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="item-card">
              <div className="card-image-container">
                <img 
                  src={property.image} 
                  alt={property.name}
                  className="card-image"
                />
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  {property.rating}
                </div>
                <div className="category-badge">
                  {property.type}
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{property.name}</h3>
                <p className="card-info">
                  <i className="fas fa-map-marker-alt"></i>
                  {property.location}
                </p>
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(property.rating) ? '' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                  <span className="rating-text">{property.rating} rating</span>
                </div>
                <div className="price-section">
                  <div>
                    <span className="price">₹{(property.price / 10000000).toFixed(1)} Cr</span>
                    <span className="price-unit">for sale</span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="action-btn primary-btn">
                    <i className="fas fa-shopping-cart"></i>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <i className="fas fa-search empty-icon"></i>
              <h3 className="empty-title">No properties found</h3>
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

export default PropertiesListingPage
