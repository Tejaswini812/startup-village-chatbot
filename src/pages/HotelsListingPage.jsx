import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import '../styles/listing-pages.css'

const HotelsListingPage = () => {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [filteredHotels, setFilteredHotels] = useState([])
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      // Fetch stays, hotels and hosted properties in parallel so all show in Find Your Stay
      const [staysResult, hotelsResult, propertiesResult] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/stays`),
        axios.get(`${API_BASE_URL}/hotels`).catch(() => null),
        axios.get(`${API_BASE_URL}/properties`)
      ])
      const staysResponse = staysResult.status === 'fulfilled' ? staysResult.value : null
      const hotelsResponse = hotelsResult.status === 'fulfilled' ? hotelsResult.value : null
      let propertiesResponse = propertiesResult.status === 'fulfilled' ? propertiesResult.value : null

      const staysData = (Array.isArray(staysResponse?.data?.stays) ? staysResponse.data.stays : Array.isArray(staysResponse?.data?.data) ? staysResponse.data.data : Array.isArray(staysResponse?.data) ? staysResponse.data : []).map(s => ({ ...s, _source: 'stays' }))
      const hotelsData = (Array.isArray(hotelsResponse?.data?.data) ? hotelsResponse.data.data : Array.isArray(hotelsResponse?.data) ? hotelsResponse.data : []).map(h => ({ ...h, _source: 'hotels' }))
      let propertiesRaw = Array.isArray(propertiesResponse?.data) ? propertiesResponse.data : []

      if (propertiesRaw.length === 0) {
        try {
          const res = await axios.get(`${API_BASE_URL}/properties`)
          propertiesRaw = Array.isArray(res?.data) ? res.data : []
        } catch (_) {}
      }

      // Map hosted properties to same format as stays/hotels so they show in the list
      const propertiesAsStays = Array.isArray(propertiesRaw)
        ? propertiesRaw.map(property => {
            let imageUrl = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop'
            if (property.images?.[0]) {
              const imagePath = property.images[0]
              if (typeof imagePath === 'string') {
                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                  imageUrl = imagePath
                } else {
                  const baseUrl = API_BASE_URL.replace(/\/api$/, '')
                  imageUrl = `${baseUrl}/${imagePath.replace(/\\/g, '/')}`
                }
              }
            }
            return {
              _id: property._id,
              name: property.title,
              location: property.location,
              type: property.propertyType || 'Homestay',
              pricePerNight: property.price,
              image: imageUrl,
              description: property.description || '',
              amenities: property.amenities || '',
              contactInfo: property.contactInfo || {},
              _source: 'properties'
            }
          })
        : []

      const allAccommodations = [...staysData, ...hotelsData, ...propertiesAsStays]

      if (allAccommodations && Array.isArray(allAccommodations) && allAccommodations.length > 0) {
        // Transform API accommodations to match the expected format
        const apiHotels = allAccommodations.map(hotel => {
          // Extract city name from full address
          const extractCity = (address) => {
            if (!address) return 'Location TBD'
            // Split by comma and get the last part (usually city, state)
            const parts = address.split(',').map(part => part.trim())
            // Look for common city patterns
            for (let i = parts.length - 1; i >= 0; i--) {
              const part = parts[i]
              // Check if it contains common city names
              if (part.includes('Bangalore') || part.includes('Bengaluru') || 
                  part.includes('Mysore') || part.includes('Hassan') || 
                  part.includes('Mangalore') || part.includes('Hubli') ||
                  part.includes('Belgaum') || part.includes('Gulbarga') ||
                  part.includes('Dharwad') || part.includes('Bellary') ||
                  part.includes('Tumkur') || part.includes('Shimoga') ||
                  part.includes('Bidar') || part.includes('Raichur') ||
                  part.includes('Hampi') || part.includes('Udupi') ||
                  part.includes('Chikmagalur') || part.includes('Coorg') ||
                  part.includes('Madikeri') || part.includes('Chitradurga') ||
                  part.includes('Kolar') || part.includes('Mandya') ||
                  part.includes('Haveri') || part.includes('Gadag') ||
                  part.includes('Koppal') || part.includes('Bagalkot') ||
                  part.includes('Bijapur') || part.includes('Yadgir') ||
                  part.includes('Chamrajanagar') || part.includes('Dakshina Kannada') ||
                  part.includes('Uttara Kannada') || part.includes('Kodagu') ||
                  part.includes('Chikkaballapur') || part.includes('Chitradurga') ||
                  part.includes('Davangere') || part.includes('Hassan') ||
                  part.includes('Haveri') || part.includes('Koppal') ||
                  part.includes('Mandya') || part.includes('Mysore') ||
                  part.includes('Raichur') || part.includes('Shimoga') ||
                  part.includes('Tumkur') || part.includes('Udupi') ||
                  part.includes('Vijayapura') || part.includes('Yadgir')) {
                return part
              }
            }
            // If no city found, return the last part
            return parts[parts.length - 1] || 'Location TBD'
          }

          // Debug price handling
          console.log('Hotel price from API:', hotel.price, 'pricePerNight:', hotel.pricePerNight, 'Type:', typeof hotel.price)
          
          // Handle price extraction - prioritize pricePerNight (numeric), then parse price string, then default
          let price = 1000 // Default price
          
          if (hotel.pricePerNight && !isNaN(hotel.pricePerNight)) {
            // Use pricePerNight if available and valid
            price = parseInt(hotel.pricePerNight)
          } else if (hotel.price) {
            // If price is a string like "₹3,500/night", extract the number
            if (typeof hotel.price === 'string') {
              // Remove currency symbols, commas, and text, then extract number
              const priceMatch = hotel.price.replace(/[₹,]/g, '').match(/\d+/)
              if (priceMatch) {
                price = parseInt(priceMatch[0])
              }
            } else if (!isNaN(hotel.price)) {
              // If it's already a number
              price = parseInt(hotel.price)
            }
          }
          
          // Ensure price is valid
          if (isNaN(price) || price <= 0) {
            price = 1000
          }
          
          // Handle both Stay and Hotel models
          const name = hotel.name || hotel.title
          const location = extractCity(hotel.location || hotel.destination)
          const type = hotel.type || 'Homestay'
          const rating = hotel.rating || parseFloat((4.5 + Math.random() * 0.5).toFixed(1))
          
          return {
            id: hotel._id || hotel.id,
            source: hotel._source || 'stays',
            name: name,
            location: location,
            type: type,
            price: price,
            rating: rating,
            image: (() => {
              if (hotel.image) {
                // If image starts with http or https, use it directly
                if (hotel.image.startsWith('http://') || hotel.image.startsWith('https://')) {
                  return hotel.image;
                }
                // Otherwise, prepend localhost
                return `http://localhost:5000/${hotel.image}`;
              }
              // Fallback to default image
              return "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop";
            })(),
            description: hotel.description || '',
            amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : hotel.amenities || '',
            contactInfo: hotel.contactInfo || {}
          }
        })
        
        console.log('Transformed API hotels:', apiHotels)
        setHotels(apiHotels)
        setFilteredHotels(apiHotels)
      } else {
        // Fallback: fetch only properties so hosted listings still show
        try {
          const res = await axios.get(`${API_BASE_URL}/properties`)
          const raw = Array.isArray(res?.data) ? res.data : []
          if (raw.length > 0) {
            const propertiesAsStaysOnly = raw.map(property => {
              let imageUrl = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop'
              if (property.images?.[0]) {
                const imagePath = property.images[0]
                if (typeof imagePath === 'string') {
                  imageUrl = (imagePath.startsWith('http') ? imagePath : `${API_BASE_URL.replace(/\/api$/, '')}/${imagePath.replace(/\\/g, '/')}`)
                }
              }
              return {
                _id: property._id,
                name: property.title,
                location: property.location || 'Location not specified',
                type: property.propertyType || 'Homestay',
                pricePerNight: property.price,
                image: imageUrl,
                _source: 'properties'
              }
            })
            const apiHotels = propertiesAsStaysOnly.map(h => ({
              id: h._id || h.id,
              source: 'properties',
              name: h.name || h.title,
              location: typeof h.location === 'string' ? h.location : 'Location not specified',
              type: h.type || 'Homestay',
              price: !isNaN(Number(h.pricePerNight)) ? Number(h.pricePerNight) : 1000,
              rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
              image: h.image || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop',
              description: h.description || '',
              amenities: Array.isArray(h.amenities) ? h.amenities.join(', ') : h.amenities || '',
              contactInfo: h.contactInfo || {}
            }))
            setHotels(apiHotels)
            setFilteredHotels(apiHotels)
            setLoading(false)
            return
          }
        } catch (_) {}
        throw new Error('No hotels in API response')
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
      console.log('Using fallback hotel data')
      // Fallback to static data (same as landing page)
      const fallbackHotels = [
        {
          id: 1,
          source: 'stays',
          name: "Sunset Retreat",
          location: "Goa",
          type: "Cottage",
          price: 2500,
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop"
        },
        {
          id: 2,
          source: 'stays',
          name: "Ocean Breeze",
          location: "Goa",
          type: "Tent",
          price: 1500,
          rating: 4.6,
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop"
        },
        {
          id: 3,
          source: 'stays',
          name: "Mountain Escape",
          location: "Coorg",
          type: "Luxury Room",
          price: 5000,
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
        },
        {
          id: 4,
          source: 'stays',
          name: "Green Valley Stay",
          location: "Coorg",
          type: "Hostel Bed",
          price: 900,
          rating: 4.4,
          image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&h=300&fit=crop"
        },
        {
          id: 5,
          source: 'stays',
          name: "City Comfort Inn",
          location: "Bangalore",
          type: "Normal Room",
          price: 2200,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&h=300&fit=crop"
        },
        {
          id: 6,
          source: 'stays',
          name: "Riverside Resort",
          location: "Mysore",
          type: "Villa",
          price: 4500,
          rating: 4.7,
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop"
        }
      ]
      setHotels(fallbackHotels)
      setFilteredHotels(fallbackHotels)
    }
    setLoading(false)
  }

  // Filter hotels based on selected filters
  useEffect(() => {
    let filtered = hotels

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(hotel => hotel.price >= min && hotel.price <= max)
    }

    if (filters.rating) {
      const minRating = Number(filters.rating)
      filtered = filtered.filter(hotel => hotel.rating >= minRating)
    }

    if (filters.location) {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredHotels(filtered)
  }, [filters, hotels])

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
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
            <h1 className="listing-title">Find Your Stay</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-header">
            <i className="fas fa-filter filter-icon"></i>
            <h2 className="filter-title">Filters</h2>
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
                <option value="0-10000">Under ₹10,000</option>
                <option value="10000-15000">₹10,000 - ₹15,000</option>
                <option value="15000-20000">₹15,000 - ₹20,000</option>
                <option value="20000-999999">Above ₹20,000</option>
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
              {filteredHotels.length} hotels found
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="items-grid">
          {filteredHotels.map(hotel => (
            <div key={hotel.id} className="item-card">
              <div className="card-image-container">
                <img 
                  src={hotel.image || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop"} 
                  alt={hotel.name}
                  className="card-image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop"
                  }}
                />
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  {hotel.rating}
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{hotel.name}</h3>
                <p className="card-info">
                  <i className="fas fa-map-marker-alt"></i>
                  {hotel.location}
                </p>
                <div className="price-section">
                  <div>
                    <span className="price">₹{hotel.price.toLocaleString()}</span>
                    <span className="price-unit">per night</span>
                  </div>
                </div>
                <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="action-btn primary-btn"
                    onClick={() => {
                    const rawSource = hotel.source || hotel._source || 'stays'
                    const source = ['stays', 'hotels', 'properties'].includes(rawSource) ? rawSource : 'stays'
                    navigate(`/stay/${source}/${hotel.id}`, { state: { stayCard: hotel } })
                  }}
                  >
                    <i className="fas fa-info-circle"></i>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <i className="fas fa-search empty-icon"></i>
              <h3 className="empty-title">No hotels found</h3>
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

export default HotelsListingPage
