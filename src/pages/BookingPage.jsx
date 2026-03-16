import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import '../styles/booking-page.css'

const BookingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const hotel = location.state?.hotel

  const [step, setStep] = useState('guest') // 'guest' | 'payment'
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    checkIn: '',
    checkOut: ''
  })
  const [paymentForm, setPaymentForm] = useState({
    method: 'upi',
    upiId: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    bankDetails: ''
  })
  const [bookingSummary, setBookingSummary] = useState(null)

  useEffect(() => {
    if (!hotel) {
      navigate('/hotels')
    }
  }, [hotel, navigate])

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target
    const parsed = (name === 'guests') ? parseInt(value, 10) || 1 : value
    setBookingForm(prev => ({ ...prev, [name]: parsed }))
  }

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target
    setPaymentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.checkIn || !bookingForm.checkOut) {
      return
    }
    const checkInDate = new Date(bookingForm.checkIn)
    const checkOutDate = new Date(bookingForm.checkOut)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    const totalPrice = hotel.price * nights * bookingForm.guests
    setBookingSummary({ nights, totalPrice, checkIn: bookingForm.checkIn, checkOut: bookingForm.checkOut })
    setStep('payment')
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (paymentForm.method === 'upi' && !paymentForm.upiId.trim()) {
      return
    }
    const message = `Booking confirmed! Total: ₹${bookingSummary.totalPrice.toLocaleString()}. The host will contact you at ${bookingForm.email} for payment completion.`
    alert(message)
    setStep('guest')
    setBookingForm({ name: '', email: '', phone: '', guests: 1, checkIn: '', checkOut: '' })
    setPaymentForm({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '', bankDetails: '' })
    setBookingSummary(null)
    navigate('/hotels')
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

          {/* Step: Guest Information or Payment Details */}
          <div className="booking-form-section">
            {step === 'guest' ? (
              <>
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
              </>
            ) : (
              <>
                <h2 className="form-section-title">Payment Details</h2>
                <div className="booking-summary-card" style={{ marginBottom: '1.5rem' }}>
                  <h3 className="summary-title">Booking Summary</h3>
                  <div className="summary-content">
                    <div className="summary-row">
                      <span className="summary-label">Stay:</span>
                      <span className="summary-value">{hotel.name}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Guest:</span>
                      <span className="summary-value">{bookingForm.name}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Check-in → Check-out:</span>
                      <span className="summary-value">{bookingForm.checkIn} → {bookingForm.checkOut}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Nights:</span>
                      <span className="summary-value">{bookingSummary.nights}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Guests:</span>
                      <span className="summary-value">{bookingForm.guests}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total-row">
                      <span className="summary-label">Total Amount:</span>
                      <span className="summary-value total-price">₹{bookingSummary.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handlePaymentSubmit} className="booking-form">
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-section-title" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Payment Method *</label>
                    <select
                      name="method"
                      value={paymentForm.method}
                      onChange={handlePaymentFormChange}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9375rem' }}
                    >
                      <option value="upi">UPI</option>
                      <option value="card">Card (Debit/Credit)</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  {paymentForm.method === 'upi' && (
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="upiId">UPI ID *</label>
                      <input
                        type="text"
                        id="upiId"
                        name="upiId"
                        value={paymentForm.upiId}
                        onChange={handlePaymentFormChange}
                        placeholder="e.g. name@paytm"
                        required={paymentForm.method === 'upi'}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                      />
                    </div>
                  )}
                  {paymentForm.method === 'card' && (
                    <>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="cardName">Name on Card *</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={paymentForm.cardName}
                          onChange={handlePaymentFormChange}
                          placeholder="As on card"
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="cardNumber">Card Number *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentForm.cardNumber}
                          onChange={handlePaymentFormChange}
                          placeholder="16-digit number"
                          maxLength="19"
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label htmlFor="cardExpiry">Expiry (MM/YY) *</label>
                          <input
                            type="text"
                            id="cardExpiry"
                            name="cardExpiry"
                            value={paymentForm.cardExpiry}
                            onChange={handlePaymentFormChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label htmlFor="cardCvv">CVV *</label>
                          <input
                            type="text"
                            id="cardCvv"
                            name="cardCvv"
                            value={paymentForm.cardCvv}
                            onChange={handlePaymentFormChange}
                            placeholder="3 digits"
                            maxLength="4"
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {paymentForm.method === 'bank' && (
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="bankDetails">Account / Transfer details</label>
                      <textarea
                        id="bankDetails"
                        name="bankDetails"
                        value={paymentForm.bankDetails}
                        onChange={handlePaymentFormChange}
                        placeholder="You will receive bank details from the host after confirming."
                        rows={3}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical' }}
                      />
                    </div>
                  )}
                  <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                    <button type="button" className="cancel-button" onClick={() => setStep('guest')}>
                      Back
                    </button>
                    <button type="submit" className="submit-button">
                      <i className="fas fa-lock"></i>
                      Complete Booking
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookingPage

