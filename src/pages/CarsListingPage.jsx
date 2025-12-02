import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const CarsListingPage = () => {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  // Fetch cars from API - ALL cars (not limited to 10)
  useEffect(() => {
    const fetchCars = async () => {
      try {
        console.log('Fetching ALL cars from API...')
        const response = await axios.get(`${API_BASE_URL}/cars`)
        console.log('Cars API response:', response.data)
        
        if (response.data && response.data.length > 0) {
          // Transform API cars to match the expected format
          const apiCars = response.data.map(car => ({
            id: car._id || car.id,
            name: `${car.make} ${car.model}`,
            location: car.location || 'Location',
            price: car.price,
            rating: 4.5, // Default rating
            year: car.year,
            mileage: car.mileage || 'N/A',
            image: car.images?.[0] ? `http://localhost:5000/${car.images[0]}` : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: car.description,
            fuelType: car.fuelType || 'N/A'
          }))
          
          console.log('All API cars loaded:', apiCars.length)
          setCars(apiCars)
          setFilteredCars(apiCars)
        } else {
          console.log('No cars in API response, using landing page data')
          // Use exact same data as landing page
          const landingPageCars = [
            {
              id: 1,
              name: "Toyota Innova Crysta",
              location: "Bangalore",
              price: 1250000,
              rating: 4.8,
              year: 2019,
              mileage: "15,000 km",
              image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Premium sedan with advanced features",
              fuelType: "Hybrid"
            },
            {
              id: 2,
              name: "Mahindra XUV700",
              location: "Mysore",
              price: 1820000,
              rating: 4.6,
              year: 2021,
              mileage: "25,000 km",
              image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Reliable and fuel-efficient car",
              fuelType: "Petrol"
            },
            {
              id: 3,
              name: "Tata Safari",
              location: "Coorg",
              price: 1580000,
              rating: 4.9,
              year: 2020,
              mileage: "8,000 km",
              image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Luxury SUV with premium features",
              fuelType: "Diesel"
            },
            {
              id: 4,
              name: "Hyundai Creta",
              location: "Hassan",
              price: 1450000,
              rating: 4.4,
              year: 2022,
              mileage: "35,000 km",
              image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Compact and economical hatchback",
              fuelType: "Petrol"
            },
            {
              id: 5,
              name: "Kia Seltos",
              location: "Shivana Samudra",
              price: 1390000,
              rating: 4.7,
              year: 2021,
              mileage: "20,000 km",
              image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              description: "Executive sedan with luxury features",
              fuelType: "Diesel"
            }
          ]
          setCars(landingPageCars)
          setFilteredCars(landingPageCars)
        }
      } catch (error) {
        console.error('Error fetching cars:', error)
        console.log('Using landing page car data')
        // Use exact same data as landing page
        const landingPageCars = [
          {
            id: 1,
            name: "Toyota Innova Crysta",
            location: "Bangalore",
            price: 1250000,
            rating: 4.8,
            year: 2019,
            mileage: "15,000 km",
            image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Premium sedan with advanced features",
            fuelType: "Hybrid"
          },
          {
            id: 2,
            name: "Mahindra XUV700",
            location: "Mysore",
            price: 1820000,
            rating: 4.6,
            year: 2021,
            mileage: "25,000 km",
            image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Reliable and fuel-efficient car",
            fuelType: "Petrol"
          },
          {
            id: 3,
            name: "Tata Safari",
            location: "Coorg",
            price: 1580000,
            rating: 4.9,
            year: 2020,
            mileage: "8,000 km",
            image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Luxury SUV with premium features",
            fuelType: "Diesel"
          },
          {
            id: 4,
            name: "Hyundai Creta",
            location: "Hassan",
            price: 1450000,
            rating: 4.4,
            year: 2022,
            mileage: "35,000 km",
            image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Compact and economical hatchback",
            fuelType: "Petrol"
          },
          {
            id: 5,
            name: "Kia Seltos",
            location: "Shivana Samudra",
            price: 1390000,
            rating: 4.7,
            year: 2021,
            mileage: "20,000 km",
            image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: "Executive sedan with luxury features",
            fuelType: "Diesel"
          }
        ]
        setCars(landingPageCars)
        setFilteredCars(landingPageCars)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCars()
  }, [])

  // Filter cars based on selected filters
  useEffect(() => {
    let filtered = cars

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(car => car.price >= min && car.price <= max)
    }

    if (filters.rating) {
      const minRating = Number(filters.rating)
      filtered = filtered.filter(car => car.rating >= minRating)
    }

    if (filters.location) {
      filtered = filtered.filter(car => 
        car.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredCars(filtered)
  }, [filters, cars])

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
            <h1 className="listing-title">Zoom Car</h1>
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
                <option value="0-2000000">Under ₹20 Lakh</option>
                <option value="2000000-5000000">₹20 Lakh - ₹50 Lakh</option>
                <option value="5000000-8000000">₹50 Lakh - ₹80 Lakh</option>
                <option value="8000000-999999999">Above ₹80 Lakh</option>
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
              {filteredCars.length} cars found
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="items-grid">
          {filteredCars.map(car => (
            <div key={car.id} className="item-card">
              <div className="card-image-container">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="card-image"
                />
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  {car.rating}
                </div>
                <div className="category-badge">
                  {car.year}
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{car.name}</h3>
                <p className="card-info">
                  <i className="fas fa-map-marker-alt"></i>
                  {car.location}
                </p>
                <p className="card-info">
                  <i className="fas fa-tachometer-alt"></i>
                  {car.mileage}
                </p>
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(car.rating) ? '' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                  <span className="rating-text">{car.rating} rating</span>
                </div>
                <div className="price-section">
                  <div>
                    <span className="price">₹{(car.price / 100000).toFixed(1)} L</span>
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

        {filteredCars.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <i className="fas fa-search empty-icon"></i>
              <h3 className="empty-title">No cars found</h3>
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

export default CarsListingPage
