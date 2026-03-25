import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'
import '../styles/event-detail.css'
import '../styles/detail-enhancements.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'

function toFullImageUrl(path) {
  if (!path || typeof path !== 'string') return FALLBACK_IMAGE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${base}/${path.replace(/\\/g, '/')}`
}

function eventCardToDetail(card) {
  if (!card) return null
  return {
    _id: card.id,
    title: card.title,
    description: card.description || '',
    category: card.category || '',
    location: typeof card.location === 'string' ? { venue: card.location, address: '', city: '', state: '' } : card.location,
    date: card.date,
    time: card.time,
    price: typeof card.price === 'number' ? card.price : (parseInt(String(card.price || '0').replace(/\D/g, ''), 10) || 0),
    image: card.image,
    images: card.image ? [card.image] : (card.images || [])
  }
}

export default function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const eventCard = location.state?.eventCard
  const [data, setData] = useState(() => eventCard ? eventCardToDetail(eventCard) : null)
  const [loading, setLoading] = useState(!eventCard)
  const [error, setError] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState('form') // 'form' | 'payment' | 'done'
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', tickets: 1 })
  const [paymentForm, setPaymentForm] = useState({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' })

  useEffect(() => {
    if (!id) {
      setError('Invalid event')
      setLoading(false)
      return
    }
    if (eventCard) setLoading(false)
    let cancelled = false
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/events/${id}`)
        if (cancelled) return
        if (res.data) setData(res.data)
      } catch (err) {
        if (!cancelled && !eventCard) {
          setError(err.response?.status === 404 ? 'Event not found' : 'Failed to load event')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [id, eventCard])

  if (loading) {
    return (
      <div className="listing-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="listing-page">
        <div className="listing-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error || 'Event not found'}</p>
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Back
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const title = data.title || 'Event'
  const locationStr = typeof data.location === 'string' ? data.location : (data.location?.venue || data.location?.address || '')
  const description = data.description || ''
  const category = data.category || ''
  const price = typeof data.price === 'number' ? data.price : (parseInt(String(data.price || '0').replace(/\D/g, ''), 10) || 0)
  const capacity = data.capacity != null ? data.capacity : ''
  const contactInfo = data.contactInfo || {}
  const dateTimeStart = data.dateTime?.start ? new Date(data.dateTime.start) : null
  const dateTimeEnd = data.dateTime?.end ? new Date(data.dateTime.end) : null
  const dateStr = data.date || (dateTimeStart ? dateTimeStart.toLocaleDateString(undefined, { dateStyle: 'medium' }) : '')
  const timeStr = data.time || (dateTimeStart ? dateTimeStart.toLocaleTimeString(undefined, { timeStyle: 'short' }) : '')

  let images = []
  if (data.images && data.images.length > 0) {
    images = data.images.map(toFullImageUrl)
  } else if (data.image) {
    const img = typeof data.image === 'string' ? (data.image.startsWith('http') ? data.image : toFullImageUrl(data.image)) : FALLBACK_IMAGE
    images = [img]
  }
  if (images.length === 0) images = [FALLBACK_IMAGE]

  return (
    <div className="listing-page stay-detail-page event-detail-root enhanced-detail-root">
      <div className="listing-container stay-detail-layout">
        <button type="button" className="back-button stay-detail-back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left" /> Back
        </button>

        <div className="stay-detail-gallery">
          <div className="event-detail-gallery-wrap">
            <div className="event-detail-gallery-main">
              <img
                src={images[galleryIndex]}
                alt={`${title} - ${galleryIndex + 1}`}
                onError={(e) => { e.target.src = FALLBACK_IMAGE }}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="event-detail-gallery-nav"
                    onClick={() => setGalleryIndex(i => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                  >
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button
                    type="button"
                    className="event-detail-gallery-nav event-detail-gallery-nav--next"
                    onClick={() => setGalleryIndex(i => (i + 1) % images.length)}
                    aria-label="Next image"
                  >
                    <i className="fas fa-chevron-right" />
                  </button>
                  <div className="event-detail-gallery-counter">
                    {galleryIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="event-detail-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`event-detail-thumb${galleryIndex === i ? ' is-active' : ''}`}
                    onClick={() => setGalleryIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img src={img} alt="" onError={(e) => { e.target.src = FALLBACK_IMAGE }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stay-detail-content">
          <h1 className="event-detail-hero-title">{title}</h1>
          <div className="event-detail-meta-row">
            {locationStr && (
              <span className="event-detail-meta-pill">
                <i className="fas fa-map-marker-alt" aria-hidden />{locationStr}
              </span>
            )}
            {(dateStr || timeStr) && (
              <span className="event-detail-meta-pill">
                <i className="fas fa-calendar-alt" aria-hidden />
                {dateStr}{timeStr ? ` • ${timeStr}` : ''}
              </span>
            )}
          </div>
          {category && (
            <span className="event-detail-category-chip">{category}</span>
          )}

          <section className="event-detail-section">
            <h2>
              <span className="event-detail-section-icon" aria-hidden><i className="fas fa-align-left" /></span>
              About this event
            </h2>
            {description ? (
              <p className="event-detail-about-body">{description}</p>
            ) : (
              <p className="event-detail-about-empty">No description provided yet — check back later for updates.</p>
            )}
          </section>

          <section className="event-detail-section event-detail-pricing">
            <h2>
              <span className="event-detail-section-icon" aria-hidden><i className="fas fa-tag" /></span>
              Pricing
            </h2>
            <p className="event-detail-price-value">
              {price > 0 ? `₹${price.toLocaleString()} per ticket` : 'Free entry'}
            </p>
            {capacity !== '' && (
              <p className="event-detail-capacity">Capacity: {capacity} attendees</p>
            )}
          </section>

          {(contactInfo.phone || contactInfo.email) && (
            <section className="event-detail-section">
              <h2>
                <span className="event-detail-section-icon" aria-hidden><i className="fas fa-address-book" /></span>
                Contact
              </h2>
              {contactInfo.phone && <p className="event-detail-about-body" style={{ margin: '0.35rem 0' }}><i className="fas fa-phone" style={{ marginRight: 8, color: 'var(--ed-accent)' }} />{contactInfo.phone}</p>}
              {contactInfo.email && <p className="event-detail-about-body" style={{ margin: '0.35rem 0' }}><i className="fas fa-envelope" style={{ marginRight: 8, color: 'var(--ed-accent)' }} />{contactInfo.email}</p>}
            </section>
          )}

          {!showBooking ? (
            <div className="event-detail-cta-row">
              <button
                type="button"
                className="event-detail-btn-primary"
                onClick={() => setShowBooking(true)}
              >
                <i className="fas fa-ticket-alt" /> Book tickets
              </button>
              <button type="button" className="event-detail-btn-secondary" onClick={() => navigate(-1)}>
                Back to list
              </button>
            </div>
          ) : bookingStep === 'done' ? (
            <div className="event-detail-success">
              <p style={{ fontWeight: 700, color: '#166534', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Booking confirmed!</p>
              <p style={{ color: '#15803d', fontSize: '0.9375rem', marginBottom: '1rem', lineHeight: 1.5 }}>The organizer will contact you at {bookingForm.email} for further details.</p>
              <div className="event-detail-form-actions">
                <button type="button" className="event-detail-btn-secondary" onClick={() => { setShowBooking(false); setBookingStep('form'); setBookingForm({ name: '', email: '', phone: '', tickets: 1 }); setPaymentForm({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' }); }}>Book more tickets</button>
                <button type="button" className="event-detail-btn-primary" onClick={() => navigate(-1)}>Back to list</button>
              </div>
            </div>
          ) : (
            <div className="event-detail-booking-panel">
              <h2>
                <span className="event-detail-section-icon" aria-hidden><i className={bookingStep === 'form' ? 'fas fa-user-edit' : 'fas fa-credit-card'} /></span>
                {bookingStep === 'form' ? 'Booking details' : 'Payment details'}
              </h2>
              {bookingStep === 'form' ? (
                <form onSubmit={(e) => { e.preventDefault(); if (bookingForm.name && bookingForm.email && bookingForm.phone && bookingForm.tickets >= 1) setBookingStep('payment'); }}>
                  <div className="event-detail-form-grid">
                    <div className="event-detail-field">
                      <label htmlFor="event-tickets">Number of persons / tickets *</label>
                      <div className="event-detail-stepper">
                        <button
                          type="button"
                          aria-label="Decrease tickets"
                          onClick={() => setBookingForm(f => ({ ...f, tickets: Math.max(1, f.tickets - 1) }))}
                        >
                          −
                        </button>
                        <input
                          id="event-tickets"
                          type="number"
                          min={1}
                          max={50}
                          value={bookingForm.tickets}
                          onChange={(e) => setBookingForm(f => ({ ...f, tickets: Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)) }))}
                          required
                          aria-label="Ticket count"
                        />
                        <button
                          type="button"
                          aria-label="Increase tickets"
                          onClick={() => setBookingForm(f => ({ ...f, tickets: Math.min(50, f.tickets + 1) }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="event-detail-field">
                      <label htmlFor="event-name">Full name *</label>
                      <input id="event-name" className="event-detail-input" type="text" value={bookingForm.name} onChange={(e) => setBookingForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your name" required autoComplete="name" />
                    </div>
                    <div className="event-detail-field">
                      <label htmlFor="event-email">Email *</label>
                      <input id="event-email" className="event-detail-input" type="email" value={bookingForm.email} onChange={(e) => setBookingForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter your email" required autoComplete="email" />
                    </div>
                    <div className="event-detail-field">
                      <label htmlFor="event-phone">Phone *</label>
                      <input id="event-phone" className="event-detail-input" type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))} placeholder="Enter your phone" required autoComplete="tel" />
                    </div>
                    <div className="event-detail-summary">
                      <i className="fas fa-receipt" aria-hidden />
                      <span>
                        Price: ₹{price.toLocaleString()} × {bookingForm.tickets} = <strong>₹{(price * bookingForm.tickets).toLocaleString()}</strong> total
                      </span>
                    </div>
                    <div className="event-detail-form-actions">
                      <button type="button" className="event-detail-btn-secondary" onClick={() => setShowBooking(false)}>Cancel</button>
                      <button type="submit" className="event-detail-btn-submit">Continue to payment</button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBookingStep('done'); }}>
                  <div className="event-detail-payment-box">
                    <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 6 }}><strong>Event:</strong> {title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}><strong>Tickets:</strong> {bookingForm.tickets} × ₹{price.toLocaleString()} = <strong>₹{(price * bookingForm.tickets).toLocaleString()}</strong></div>
                  </div>
                  <div className="event-detail-field" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="pay-method">Payment method *</label>
                    <select id="pay-method" className="event-detail-select" value={paymentForm.method} onChange={(e) => setPaymentForm(f => ({ ...f, method: e.target.value }))}>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank">Bank transfer</option>
                    </select>
                  </div>
                  {paymentForm.method === 'upi' && (
                    <div className="event-detail-field" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="pay-upi">UPI ID *</label>
                      <input id="pay-upi" className="event-detail-input" type="text" value={paymentForm.upiId} onChange={(e) => setPaymentForm(f => ({ ...f, upiId: e.target.value }))} placeholder="e.g. name@paytm" />
                    </div>
                  )}
                  {paymentForm.method === 'card' && (
                    <>
                      <div className="event-detail-field" style={{ marginBottom: '0.75rem' }}>
                        <label htmlFor="pay-card-name">Name on card</label>
                        <input id="pay-card-name" className="event-detail-input" type="text" value={paymentForm.cardName} onChange={(e) => setPaymentForm(f => ({ ...f, cardName: e.target.value }))} />
                      </div>
                      <div className="event-detail-field" style={{ marginBottom: '0.75rem' }}>
                        <label htmlFor="pay-card-num">Card number</label>
                        <input id="pay-card-num" className="event-detail-input" type="text" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="16 digits" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div className="event-detail-field" style={{ flex: 1, minWidth: '120px' }}>
                          <label htmlFor="pay-exp">Expiry</label>
                          <input id="pay-exp" className="event-detail-input" type="text" value={paymentForm.cardExpiry} onChange={(e) => setPaymentForm(f => ({ ...f, cardExpiry: e.target.value }))} placeholder="MM/YY" />
                        </div>
                        <div className="event-detail-field" style={{ flex: 1, minWidth: '120px' }}>
                          <label htmlFor="pay-cvv">CVV</label>
                          <input id="pay-cvv" className="event-detail-input" type="text" value={paymentForm.cardCvv} onChange={(e) => setPaymentForm(f => ({ ...f, cardCvv: e.target.value }))} placeholder="3 digits" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="event-detail-form-actions" style={{ marginTop: '1rem' }}>
                    <button type="button" className="event-detail-btn-secondary" onClick={() => setBookingStep('form')}>Back</button>
                    <button type="submit" className="event-detail-btn-submit"><i className="fas fa-lock" style={{ marginRight: 6 }} />Confirm booking</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
