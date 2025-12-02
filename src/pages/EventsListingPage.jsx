import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const EventsListingPage = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  // Fetch events from API - ALL events (not limited to 10)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Fetching ALL events from API...')
        const response = await axios.get(`${API_BASE_URL}/events`)
        console.log('Events API response:', response.data)
        
        if (response.data && response.data.length > 0) {
          // Transform API events to match the expected format
          const apiEvents = response.data.map(event => ({
            id: event._id || event.id,
            title: event.title,
            location: event.location?.venue || event.location || 'Location TBD',
            price: event.price || 0,
            rating: 4.5, // Default rating
            date: new Date(event.dateTime?.start || event.date).toLocaleDateString(),
            image: event.images?.[0] ? `http://localhost:5000/${event.images[0]}` : "https://img.freepik.com/free-vector/music-event-poster-template-with-abstract-shapes_1361-1316.jpg?semt=ais_hybrid&w=740",
            description: event.description,
            category: event.category || event.eventType
          }))
          
          console.log('All API events loaded:', apiEvents.length)
          setEvents(apiEvents)
          setFilteredEvents(apiEvents)
        } else {
          console.log('No events in API response, using landing page data')
          // Use exact same data as landing page
          const landingPageEvents = [
            {
              id: 1,
              title: "Anybody Can Dandiya 5.0",
              location: "Palace Grounds",
              date: "From 27 Sep",
              time: "Sat 06:00 PM onwards",
              price: 500,
              rating: 4.8,
              image: "https://img.freepik.com/free-vector/music-event-poster-template-with-abstract-shapes_1361-1316.jpg?semt=ais_hybrid&w=740",
              description: "Amazing music festival with top artists",
              category: "Music"
            },
            {
              id: 2,
              title: "Coffee & Conversations",
              location: "Small World • Koramangala • Bangalore",
              date: "From 25 Aug",
              time: "Mon 04:00 PM onwards",
              price: 300,
              rating: 4.6,
              image: "https://www.robertscentre.com/wp-content/uploads/2021/10/Music-Blog-People-on-stage-michaelgabbardphotography.jpeg",
              description: "Culinary delights and wine tasting",
              category: "Food"
            },
            {
              id: 3,
              title: "Tech Innovation Summit",
              location: "Tech Hub • Electronic City • Bangalore",
              date: "From 30 Aug",
              time: "Fri 07:00 PM onwards",
              price: 1200,
              rating: 4.9,
              image: "https://thumbs.dreamstime.com/b/paper-events-confetti-sign-white-over-background-vector-holiday-illustration-57529933.jpg",
              description: "Latest technology trends and innovations",
              category: "Technology"
            },
            {
              id: 4,
              title: "Sunrise Yoga Session",
              location: "Nandi Hills • Devanahalli • Bangalore",
              date: "From 2 Sep",
              time: "Sat 06:00 AM onwards",
              price: 800,
              rating: 4.4,
              image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              description: "Contemporary art from local artists",
              category: "Art"
            },
            {
              id: 5,
              title: "Cultural Evening",
              location: "Culture Center • Malleshwaram • Bangalore",
              date: "From 5 Sep",
              time: "Tue 10:00 AM onwards",
              price: 600,
              rating: 4.7,
              image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              description: "Exciting outdoor activities and sports",
              category: "Sports"
            }
          ]
          setEvents(landingPageEvents)
          setFilteredEvents(landingPageEvents)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        console.log('Using landing page event data')
        // Use exact same data as landing page
        const landingPageEvents = [
          {
            id: 1,
            title: "Anybody Can Dandiya 5.0",
            location: "Palace Grounds",
            date: "From 27 Sep",
            time: "Sat 06:00 PM onwards",
            price: 500,
            rating: 4.8,
            image: "https://img.freepik.com/free-vector/music-event-poster-template-with-abstract-shapes_1361-1316.jpg?semt=ais_hybrid&w=740",
            description: "Amazing music festival with top artists",
            category: "Music"
          },
          {
            id: 2,
            title: "Coffee & Conversations",
            location: "Small World • Koramangala • Bangalore",
            date: "From 25 Aug",
            time: "Mon 04:00 PM onwards",
            price: 300,
            rating: 4.6,
            image: "https://www.robertscentre.com/wp-content/uploads/2021/10/Music-Blog-People-on-stage-michaelgabbardphotography.jpeg",
            description: "Culinary delights and wine tasting",
            category: "Food"
          },
          {
            id: 3,
            title: "Tech Innovation Summit",
            location: "Tech Hub • Electronic City • Bangalore",
            date: "From 30 Aug",
            time: "Fri 07:00 PM onwards",
            price: 1200,
            rating: 4.9,
            image: "https://thumbs.dreamstime.com/b/paper-events-confetti-sign-white-over-background-vector-holiday-illustration-57529933.jpg",
            description: "Latest technology trends and innovations",
            category: "Technology"
          },
          {
            id: 4,
            title: "Sunrise Yoga Session",
            location: "Nandi Hills • Devanahalli • Bangalore",
            date: "From 2 Sep",
            time: "Sat 06:00 AM onwards",
            price: 800,
            rating: 4.4,
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Contemporary art from local artists",
            category: "Art"
          },
          {
            id: 5,
            title: "Cultural Evening",
            location: "Culture Center • Malleshwaram • Bangalore",
            date: "From 5 Sep",
            time: "Tue 10:00 AM onwards",
            price: 600,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Exciting outdoor activities and sports",
            category: "Sports"
          }
        ]
        setEvents(landingPageEvents)
        setFilteredEvents(landingPageEvents)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [])

  // Filter events based on selected filters
  useEffect(() => {
    let filtered = events

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(event => event.price >= min && event.price <= max)
    }

    if (filters.rating) {
      const minRating = Number(filters.rating)
      filtered = filtered.filter(event => event.rating >= minRating)
    }

    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }, [filters, events])

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
            <h1 className="listing-title">Events</h1>
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
                <option value="0-500">Under ₹500</option>
                <option value="500-1500">₹500 - ₹1,500</option>
                <option value="1500-3000">₹1,500 - ₹3,000</option>
                <option value="3000-999999">Above ₹3,000</option>
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
              {filteredEvents.length} events found
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="items-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="item-card">
              <div className="card-image-container">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="card-image"
                />
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  {event.rating}
                </div>
                <div className="category-badge">
                  {new Date(event.date).toLocaleDateString()}
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{event.title}</h3>
                <p className="card-info">
                  <i className="fas fa-map-marker-alt"></i>
                  {event.location}
                </p>
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(event.rating) ? '' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                  <span className="rating-text">{event.rating} rating</span>
                </div>
                <div className="price-section">
                  <div>
                    <span className="price">₹{event.price.toLocaleString()}</span>
                    <span className="price-unit">per ticket</span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="action-btn primary-btn">
                    <i className="fas fa-ticket-alt"></i>
                    Book Tickets
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <i className="fas fa-search empty-icon"></i>
              <h3 className="empty-title">No events found</h3>
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

export default EventsListingPage
