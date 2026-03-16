import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

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
    <div className="listing-page stay-detail-page">
      <div className="listing-container stay-detail-layout">
        <button type="button" className="back-button stay-detail-back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left" /> Back
        </button>

        <div className="stay-detail-gallery">
          <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
            <div style={{ position: 'relative', aspectRatio: '16/10', width: '100%' }}>
              <img
                src={images[galleryIndex]}
                alt={`${title} - ${galleryIndex + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.src = FALLBACK_IMAGE }}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex(i => (i - 1 + images.length) % images.length)}
                    style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer', fontSize: '1.25rem', color: '#166534'
                    }}
                    aria-label="Previous image"
                  >
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex(i => (i + 1) % images.length)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer', fontSize: '1.25rem', color: '#166534'
                    }}
                    aria-label="Next image"
                  >
                    <i className="fas fa-chevron-right" />
                  </button>
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '0.875rem', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 20 }}>
                    {galleryIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, padding: 10, overflowX: 'auto', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    style={{
                      width: 72, height: 72, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: galleryIndex === i ? '3px solid #16a34a' : '2px solid #e2e8f0',
                      padding: 0, cursor: 'pointer', background: '#e2e8f0'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK_IMAGE }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stay-detail-content">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{title}</h1>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            <i className="fas fa-map-marker-alt" style={{ marginRight: 6 }} />{locationStr}
          </p>
          {(dateStr || timeStr) && (
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              <i className="fas fa-calendar-alt" style={{ marginRight: 6 }} />{dateStr}{timeStr ? ` • ${timeStr}` : ''}
            </p>
          )}
          {category && (
            <p style={{ marginBottom: '1rem' }}>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontSize: '0.875rem' }}>{category}</span>
            </p>
          )}

          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>About this event</h2>
            <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{description || 'No description provided.'}</p>
          </section>

          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>Pricing</h2>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
              {price > 0 ? `₹${price.toLocaleString()} per ticket` : 'Free entry'}
            </p>
            {capacity !== '' && (
              <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>Capacity: {capacity} attendees</p>
            )}
          </section>

          {(contactInfo.phone || contactInfo.email) && (
            <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>Contact</h2>
              {contactInfo.phone && <p style={{ margin: '0.25rem 0', color: '#475569' }}><i className="fas fa-phone" style={{ marginRight: 8 }} />{contactInfo.phone}</p>}
              {contactInfo.email && <p style={{ margin: '0.25rem 0', color: '#475569' }}><i className="fas fa-envelope" style={{ marginRight: 8 }} />{contactInfo.email}</p>}
            </section>
          )}

          {!showBooking ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowBooking(true)}
                style={{
                  padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: 8,
                  fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
                }}
              >
                <i className="fas fa-ticket-alt" style={{ marginRight: 8 }} /> Book tickets
              </button>
              <button type="button" className="back-button" onClick={() => navigate(-1)}>
                Back to list
              </button>
            </div>
          ) : bookingStep === 'done' ? (
            <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
              <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>Booking confirmed!</p>
              <p style={{ color: '#15803d', fontSize: '0.9375rem', marginBottom: '1rem' }}>The organizer will contact you at {bookingForm.email} for further details.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="back-button" onClick={() => { setShowBooking(false); setBookingStep('form'); setBookingForm({ name: '', email: '', phone: '', tickets: 1 }); setPaymentForm({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' }); }}>Book more tickets</button>
                <button type="button" className="back-button" onClick={() => navigate(-1)}>Back to list</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>{bookingStep === 'form' ? 'Booking details' : 'Payment details'}</h2>
              {bookingStep === 'form' ? (
                <form onSubmit={(e) => { e.preventDefault(); if (bookingForm.name && bookingForm.email && bookingForm.phone && bookingForm.tickets >= 1) setBookingStep('payment'); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Number of persons / tickets *</label>
                      <input type="number" min="1" max="50" value={bookingForm.tickets} onChange={(e) => setBookingForm(f => ({ ...f, tickets: parseInt(e.target.value, 10) || 1 }))} required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Full name *</label>
                      <input type="text" value={bookingForm.name} onChange={(e) => setBookingForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your name" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email *</label>
                      <input type="email" value={bookingForm.email} onChange={(e) => setBookingForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter your email" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Phone *</label>
                      <input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))} placeholder="Enter your phone" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                      <span style={{ color: '#166534' }}>Price: ₹{price.toLocaleString()} × {bookingForm.tickets} = ₹{(price * bookingForm.tickets).toLocaleString()} total</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button type="button" className="back-button" onClick={() => setShowBooking(false)}>Cancel</button>
                      <button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Continue to payment</button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBookingStep('done'); }}>
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}><strong>Event:</strong> {title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}><strong>Tickets:</strong> {bookingForm.tickets} × ₹{price.toLocaleString()} = <strong>₹{(price * bookingForm.tickets).toLocaleString()}</strong></div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Payment method *</label>
                    <select value={paymentForm.method} onChange={(e) => setPaymentForm(f => ({ ...f, method: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank">Bank transfer</option>
                    </select>
                  </div>
                  {paymentForm.method === 'upi' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>UPI ID *</label>
                      <input type="text" value={paymentForm.upiId} onChange={(e) => setPaymentForm(f => ({ ...f, upiId: e.target.value }))} placeholder="e.g. name@paytm" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                  )}
                  {paymentForm.method === 'card' && (
                    <>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Name on card</label>
                        <input type="text" value={paymentForm.cardName} onChange={(e) => setPaymentForm(f => ({ ...f, cardName: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Card number</label>
                        <input type="text" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="16 digits" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Expiry</label><input type="text" value={paymentForm.cardExpiry} onChange={(e) => setPaymentForm(f => ({ ...f, cardExpiry: e.target.value }))} placeholder="MM/YY" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>CVV</label><input type="text" value={paymentForm.cardCvv} onChange={(e) => setPaymentForm(f => ({ ...f, cardCvv: e.target.value }))} placeholder="3 digits" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button type="button" className="back-button" onClick={() => setBookingStep('form')}>Back</button>
                    <button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}><i className="fas fa-lock" style={{ marginRight: 6 }} />Confirm booking</button>
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
