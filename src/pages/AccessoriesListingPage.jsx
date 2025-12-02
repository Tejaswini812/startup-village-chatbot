import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const AccessoriesListingPage = () => {
  const navigate = useNavigate()
  const [accessories, setAccessories] = useState([])
  const [filteredAccessories, setFilteredAccessories] = useState([])
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  // Fetch accessories from API - ALL accessories (not limited to 10)
  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        console.log('Fetching ALL accessories from API...')
        // Try both accessories and products APIs
        const [accessoriesResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/accessories`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE_URL}/products`, { timeout: 5000 }).catch(() => ({ data: [] }))
        ])
        
        console.log('Accessories API response:', accessoriesResponse.data)
        console.log('Products API response:', productsResponse.data)
        
        // Handle both array and object response formats
        const accessoriesData = accessoriesResponse.data.data || accessoriesResponse.data
        
        // Transform accessories data
        const transformedAccessories = (accessoriesData && Array.isArray(accessoriesData)) ? accessoriesData.map(accessory => ({
          id: accessory._id,
          name: accessory.name,
          location: 'Online Store',
          price: accessory.price,
          rating: 4.5, // Default rating
          category: accessory.category || 'Accessories',
          image: accessory.image || 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          description: accessory.description || 'High quality product'
        })) : []
        
        // Transform products data
        const transformedProducts = productsResponse.data?.map(product => ({
          id: `product_${product._id}`,
          name: product.name,
          location: 'Online Store',
          price: product.price,
          rating: 4.5, // Default rating
          category: product.category || 'Products',
          image: product.images?.[0] || 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          description: product.description || 'High quality product'
        })) || []
        
        // Combine both types - ALL accessories (no limit)
        const allAccessories = [...transformedAccessories, ...transformedProducts]
        
        if (allAccessories.length > 0) {
        console.log('All accessories loaded:', allAccessories.length)
        setAccessories(allAccessories)
        setFilteredAccessories(allAccessories)
        } else {
          console.log('No accessories found, using landing page data')
          // Use exact same data as landing page
          const landingPageAccessories = [
            {
              id: 1,
              name: "Shakti Technology High Pressure Washer",
              location: "Online Store",
              price: 199,
              rating: 4.8,
              category: "Electronics",
              image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Best seller - High pressure car washer with accessories"
            },
            {
              id: 2,
              name: "Shrida Naturals Lemon & Orange Air Freshener",
              location: "Online Store",
              price: 199,
              rating: 4.6,
              category: "Wearables",
              image: "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Fresh scent lasting up to 45 days, 60g net content"
            },
            {
              id: 3,
              name: "Premium Car Phone Mount",
              location: "Online Store",
              price: 450,
              rating: 4.4,
              category: "Accessories",
              image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Universal dashboard phone holder with suction cup"
            },
            {
              id: 4,
              name: "LED Headlight Bulbs Set",
              location: "Online Store",
              price: 1200,
              rating: 4.7,
              category: "Audio",
              image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Bright white LED bulbs for better night visibility"
            },
            {
              id: 5,
              name: "Leather Steering Wheel Cover",
              location: "Online Store",
              price: 650,
              rating: 4.5,
              category: "Electronics",
              image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Comfortable leather grip cover with anti-slip design"
            },
            {
              id: 6,
              name: "Premium Car Floor Mats",
              location: "Online Store",
              price: 1500,
              rating: 4.6,
              category: "Wearables",
              image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Heavy-duty rubber floor protection with anti-slip"
            },
            {
              id: 7,
              name: "Portable Bluetooth Speaker",
              location: "Online Store",
              price: 2200,
              rating: 4.8,
              category: "Audio",
              image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Waterproof wireless speaker with 20W output"
            },
            {
              id: 8,
              name: "Cordless Car Vacuum Cleaner",
              location: "Online Store",
              price: 1800,
              rating: 4.7,
              category: "Electronics",
              image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Powerful 12V car vacuum with HEPA filter"
            },
            {
              id: 9,
              name: "Digital Tire Pressure Gauge",
              location: "Online Store",
              price: 350,
              rating: 4.5,
              category: "Accessories",
              image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Precision digital tire pressure monitor"
            },
            {
              id: 10,
              name: "Multi-Compartment Car Organizer",
              location: "Online Store",
              price: 950,
              rating: 4.4,
              category: "Wearables",
              image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Expandable storage organizer for trunk and backseat"
            }
          ]
          setAccessories(landingPageAccessories)
          setFilteredAccessories(landingPageAccessories)
        }
      } catch (error) {
        console.error('Error fetching accessories:', error)
        console.log('Using landing page accessories data')
        // Use exact same data as landing page
        const landingPageAccessories = [
          {
            id: 1,
            name: "Shakti Technology High Pressure Washer",
            location: "Online Store",
            price: 199,
            rating: 4.8,
            category: "Electronics",
            image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Best seller - High pressure car washer with accessories"
          },
          {
            id: 2,
            name: "Shrida Naturals Lemon & Orange Air Freshener",
            location: "Online Store",
            price: 199,
            rating: 4.6,
            category: "Wearables",
            image: "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Fresh scent lasting up to 45 days, 60g net content"
          },
          {
            id: 3,
            name: "Premium Car Phone Mount",
            location: "Online Store",
            price: 450,
            rating: 4.4,
            category: "Accessories",
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Universal dashboard phone holder with suction cup"
          },
          {
            id: 4,
            name: "LED Headlight Bulbs Set",
            location: "Online Store",
            price: 1200,
            rating: 4.7,
            category: "Audio",
            image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Bright white LED bulbs for better night visibility"
          },
          {
            id: 5,
            name: "Leather Steering Wheel Cover",
            location: "Online Store",
            price: 650,
            rating: 4.5,
            category: "Electronics",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Comfortable leather grip cover with anti-slip design"
          },
          {
            id: 6,
            name: "Premium Car Floor Mats",
            location: "Online Store",
            price: 1500,
            rating: 4.6,
            category: "Wearables",
            image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Heavy-duty rubber floor protection with anti-slip"
          },
          {
            id: 7,
            name: "Portable Bluetooth Speaker",
            location: "Online Store",
            price: 2200,
            rating: 4.8,
            category: "Audio",
            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Waterproof wireless speaker with 20W output"
          },
          {
            id: 8,
            name: "Cordless Car Vacuum Cleaner",
            location: "Online Store",
            price: 1800,
            rating: 4.7,
            category: "Electronics",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Powerful 12V car vacuum with HEPA filter"
          },
          {
            id: 9,
            name: "Digital Tire Pressure Gauge",
            location: "Online Store",
            price: 350,
            rating: 4.5,
            category: "Accessories",
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Precision digital tire pressure monitor"
          },
          {
            id: 10,
            name: "Multi-Compartment Car Organizer",
            location: "Online Store",
            price: 950,
            rating: 4.4,
            category: "Wearables",
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Expandable storage organizer for trunk and backseat"
          }
        ]
        setAccessories(landingPageAccessories)
        setFilteredAccessories(landingPageAccessories)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccessories()
  }, [])

  // Filter accessories based on selected filters
  useEffect(() => {
    let filtered = accessories

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(accessory => accessory.price >= min && accessory.price <= max)
    }

    if (filters.rating) {
      const minRating = Number(filters.rating)
      filtered = filtered.filter(accessory => accessory.rating >= minRating)
    }

    if (filters.location) {
      filtered = filtered.filter(accessory => 
        accessory.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredAccessories(filtered)
  }, [filters, accessories])

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
            <h1 className="listing-title">Source From Our Online Resources</h1>
            <p className="listing-subtitle">Discover amazing products and accessories</p>
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
                <option value="0-10000">Under ₹10,000</option>
                <option value="10000-50000">₹10,000 - ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000-999999">Above ₹1,00,000</option>
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
              {filteredAccessories.length} products found
            </div>
          </div>
        </div>

        {/* Accessories Grid */}
        <div className="items-grid">
          {filteredAccessories.map(accessory => (
            <div key={accessory.id} className="item-card">
              <div className="card-image-container">
                <img 
                  src={accessory.image} 
                  alt={accessory.name}
                  className="card-image"
                />
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  {accessory.rating}
                </div>
                <div className="category-badge">
                  {accessory.category}
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{accessory.name}</h3>
                <p className="card-info">
                  <i className="fas fa-map-marker-alt"></i>
                  {accessory.location}
                </p>
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(accessory.rating) ? '' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                  <span className="rating-text">{accessory.rating} rating</span>
                </div>
                <div className="price-section">
                  <div>
                    <span className="price">₹{accessory.price.toLocaleString()}</span>
                    <span className="price-unit">available</span>
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

        {filteredAccessories.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <i className="fas fa-search empty-icon"></i>
              <h3 className="empty-title">No products found</h3>
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

export default AccessoriesListingPage
