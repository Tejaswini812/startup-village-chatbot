import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const EventsSection = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Default events as fallback
  const defaultEvents = [
    {
      id: 1,
      title: "Anybody Can Dandiya 5.0",
      location: "Palace Grounds",
      date: "From 27 Sep",
      time: "Sat 06:00 PM onwards",
      image: "https://img.freepik.com/free-vector/music-event-poster-template-with-abstract-shapes_1361-1316.jpg?semt=ais_hybrid&w=740"
    },
    {
      id: 2,
      title: "Coffee & Conversations",
      location: "Small World • Koramangala • Bangalore",
      date: "From 25 Aug",
      time: "Mon 04:00 PM onwards",
      image: "https://www.robertscentre.com/wp-content/uploads/2021/10/Music-Blog-People-on-stage-michaelgabbardphotography.jpeg"
    },
    {
      id: 3,
      title: "Tech Innovation Summit",
      location: "Tech Hub • Electronic City • Bangalore",
      date: "From 30 Aug",
      time: "Fri 07:00 PM onwards",
      image: "https://thumbs.dreamstime.com/b/paper-events-confetti-sign-white-over-background-vector-holiday-illustration-57529933.jpg"
    },
    {
      id: 4,
      title: "Sunrise Yoga Session",
      location: "Nandi Hills • Devanahalli • Bangalore",
      date: "From 2 Sep",
      time: "Sat 06:00 AM onwards",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      title: "Cultural Evening",
      location: "Culture Center • Malleshwaram • Bangalore",
      date: "From 5 Sep",
      time: "Tue 10:00 AM onwards",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ]

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`)
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const baseUrl = (typeof API_BASE_URL === 'string') ? API_BASE_URL.replace(/\/api\/?$/, '') : ''
        const apiEvents = response.data.map(event => {
          const loc = event.location
          const locationStr = (typeof loc === 'string') ? loc : (loc?.venue || loc?.address || loc?.city || 'Location TBD')
          const dateVal = event.dateTime?.start || event.dateTime?.date || event.date
          const dateObj = dateVal ? new Date(dateVal) : new Date()
          const dateStr = isNaN(dateObj.getTime()) ? 'TBD' : dateObj.toLocaleDateString()
          const timeStr = event.time || (isNaN(dateObj.getTime()) ? 'TBD' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          const imgPath = event.images?.[0]
          const imageUrl = imgPath ? (imgPath.startsWith('http') ? imgPath : `${baseUrl}/${imgPath}`) : "https://img.freepik.com/free-vector/music-event-poster-template-with-abstract-shapes_1361-1316.jpg?semt=ais_hybrid&w=740"
          return {
            id: event._id || event.id,
            title: event.title || 'Event',
            location: locationStr,
            date: dateStr,
            time: timeStr,
            image: imageUrl,
            description: event.description || '',
            price: event.price ?? 0,
            category: event.category || event.eventType || ''
          }
        })
        
        const combinedEvents = [...apiEvents, ...defaultEvents].slice(0, 10)
        setEvents(combinedEvents)
      } else {
        setEvents(defaultEvents.slice(0, 10))
      }
    } catch (error) {
      setEvents(defaultEvents.slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    
    // Listen for event creation
    const handleEventCreated = () => {
      setLoading(true)
      fetchEvents()
    }
    
    window.addEventListener('eventCreated', handleEventCreated)
    
    return () => {
      window.removeEventListener('eventCreated', handleEventCreated)
    }
  }, [])


  useEffect(() => {
    const autoScroll = setInterval(() => {
      const eventsScroll = document.getElementById('events-scroll')
      if (eventsScroll) {
        const cardWidth = eventsScroll.querySelector('.event-card')?.offsetWidth || 0
        const scrollAmount = cardWidth + 0 // No gap between cards
        
        eventsScroll.scrollLeft += scrollAmount
        
        // Reset to beginning if we've scrolled past all cards
        if (eventsScroll.scrollLeft >= eventsScroll.scrollWidth - eventsScroll.clientWidth) {
          eventsScroll.scrollLeft = 0
        }
      }
    }, 5000)

    return () => clearInterval(autoScroll)
  }, [])

  return (
    <div className="events-section">
      <div className="events-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="events-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Events</h2>
        <a href="#" className="view-all-link" onClick={(e) => {
          e.preventDefault()
          navigate('/events')
        }}>View All →</a>
      </div>
      
      <div className="events-container">
        <div className="events-scroll" id="events-scroll">
          {events.map((event) => (
            <div key={event.id} className="event-card" style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', background: 'white' }}>
              <div className="event-image">
                <img
                  src={event.image}
                  alt={event.title}
                  className="event-img"
                  onError={(e) => {
                    e.target.src = 'https://dummyimage.com/400x300/28a745/ffffff&text=Event+Image'
                  }}
                />
              </div>
              <div className="event-details" style={{ padding: '6px', marginTop: '4px' }}>
                <span className="event-date">{event.date}</span>
                <span className="event-time">{event.time}</span>
                <div className="event-location">{event.location}</div>
                <button
                  type="button"
                  className="event-view-details-btn"
                  onClick={() => navigate(`/event/${event.id}`, { state: { eventCard: event } })}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventsSection
