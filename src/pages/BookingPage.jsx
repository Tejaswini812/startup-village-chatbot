import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import '../styles/booking-page.css'

const BookingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const hotel = location.state?.hotel

  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    checkIn: '',
    checkOut: ''
  })

  useEffect(() => {
    if (!hotel) {
      // If no hotel data, redirect back to hotels page
      navigate('/hotels')
    }
  }, [hotel, navigate])

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.checkIn || !bookingForm.checkOut) {
      alert('Please fill in all required fields')
      return
    }

    // Calculate total price
    const checkInDate = new Date(bookingForm.checkIn)
    const checkOutDate = new Date(bookingForm.checkOut)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    const totalPrice = hotel.price * nights * bookingForm.guests

    // Create booking summary
    const bookingSummary = `
Booking Confirmation

Hotel Details:
- Name: ${hotel.name}
- Location: ${hotel.location}
- Type: ${hotel.type}
- Rating: ${hotel.rating} stars
- Price per night: ₹${hotel.price}

Guest Details:
- Name: ${bookingForm.name}
- Email: ${bookingForm.email}
- Phone: ${bookingForm.phone}
- Number of Guests: ${bookingForm.guests}

Booking Details:
- Check-in: ${bookingForm.checkIn}
- Check-out: ${bookingForm.checkOut}
- Number of Nights: ${nights}
- Total Price: ₹${totalPrice.toLocaleString()}

Thank you for your booking! We will contact you shortly to confirm.
    `

    alert(bookingSummary)
    
    // Reset form
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      guests: 1,
      checkIn: '',
      checkOut: ''
    })
  }

  if (!hotel) {
    return null
  }

  const nights = bookingForm.checkIn && bookingForm.checkOut 
    ? Math.ceil((new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) / (1000 * 60 * 60 * 24))
    : 0
  const totalPrice = hotel.price * nights * bookingForm.guests

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <div className="booking-header">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <h1 className="booking-page-title">Book Your Stay</h1>
        </div>

        <div className="booking-content">
          {/* Hotel Details Section */}
          <div className="booking-hotel-section">
            <div className="hotel-image-wrapper">
              <img src={hotel.image} alt={hotel.name} className="booking-hotel-image" />
              <div className="hotel-rating-badge">
                <i className="fas fa-star"></i>
                <span>{hotel.rating}</span>
              </div>
            </div>
            <div className="hotel-info-section">
              <h2 className="hotel-name">{hotel.name}</h2>
              <div className="hotel-details-list">
                <div className="hotel-detail-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{hotel.location}</span>
                </div>
                <div className="hotel-detail-item">
                  <i className="fas fa-home"></i>
                  <span>{hotel.type}</span>
                </div>
                <div className="hotel-detail-item">
                  <i className="fas fa-star"></i>
                  <span>{hotel.rating} rating</span>
                </div>
              </div>
              <div className="hotel-price-display">
                <span className="price-label">Price per night</span>
                <span className="price-value">₹{hotel.price.toLocaleString()}</span>
              </div>
              {hotel.description && (
                <p className="hotel-description">{hotel.description}</p>
              )}
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="booking-form-section">
            <h2 className="form-section-title">Guest Information</h2>
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={bookingForm.name}
                    onChange={handleBookingFormChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={bookingForm.email}
                    onChange={handleBookingFormChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleBookingFormChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guests">Number of Guests *</label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    value={bookingForm.guests}
                    onChange={handleBookingFormChange}
                    required
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">Check-in Date *</label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={bookingForm.checkIn}
                    onChange={handleBookingFormChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOut">Check-out Date *</label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={bookingForm.checkOut}
                    onChange={handleBookingFormChange}
                    required
                    min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Booking Summary */}
              {bookingForm.checkIn && bookingForm.checkOut && (
                <div className="booking-summary-card">
                  <h3 className="summary-title">Booking Summary</h3>
                  <div className="summary-content">
                    <div className="summary-row">
                      <span className="summary-label">Number of Nights:</span>
                      <span className="summary-value">{nights}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Price per night:</span>
                      <span className="summary-value">₹{hotel.price.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Number of Guests:</span>
                      <span className="summary-value">{bookingForm.guests}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total-row">
                      <span className="summary-label">Total Price:</span>
                      <span className="summary-value total-price">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  <i className="fas fa-calendar-check"></i>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookingPage

