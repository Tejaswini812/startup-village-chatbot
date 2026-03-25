import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'
import '../styles/detail-enhancements.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'

function toFullImageUrl(path) {
  if (!path || typeof path !== 'string') return FALLBACK_IMAGE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${base}/${path.replace(/\\/g, '/')}`
}

/** Normalize list card object to detail-page shape (name, location, image/images, price, etc.) */
function cardToDetail(card) {
  if (!card) return null
  const price = typeof card.price === 'number' ? card.price : (parseInt(String(card.price || '0').replace(/\D/g, ''), 10) || 0)
  return {
    _id: card.id,
    name: card.name,
    title: card.name,
    location: card.location,
    destination: card.location,
    type: card.type,
    propertyType: card.type,
    description: card.description || '',
    amenities: Array.isArray(card.amenities) ? card.amenities : (card.amenities ? String(card.amenities).split(',').map(a => a.trim()).filter(Boolean) : []),
    price,
    pricePerNight: price,
    image: card.image,
    images: card.image ? [card.image] : [],
    contactInfo: card.contactInfo || {},
    reviews: card.reviews || [],
    rating: card.rating
  }
}

export default function StayDetailPage() {
  const { source, id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const stayCard = location.state?.stayCard
  const [data, setData] = useState(() => stayCard ? cardToDetail(stayCard) : null)
  const [loading, setLoading] = useState(!stayCard)
  const [error, setError] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState('form')
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', guests: 1, checkIn: '', checkOut: '' })
  const [paymentForm, setPaymentForm] = useState({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' })

  const validStaySources = ['stays', 'hotels', 'properties']
  const isValidSource = source && validStaySources.includes(source)

  useEffect(() => {
    if (!source || !id) {
      setError('Invalid stay')
      setLoading(false)
      return
    }
    if (stayCard) {
      setLoading(false)
    }
    // Never call API for "other" or unknown source - backend has no /api/other route (404)
    if (!isValidSource) {
      if (stayCard) {
        setData(cardToDetail(stayCard))
      } else {
        setError('Invalid stay type')
        setData(null)
      }
      setLoading(false)
      return
    }
    let cancelled = false
    const fetchDetail = async () => {
      try {
        // Double-check: never request /api/other or unknown paths
        if (!validStaySources.includes(source)) return
        const res = await axios.get(`${API_BASE_URL}/${source}/${id}`)
        if (cancelled) return
        let raw = null
        if (source === 'stays') raw = res.data?.stay ?? null
        else if (source === 'hotels') raw = res.data?.data ?? null
        else if (source === 'properties') raw = res.data ?? null
        if (raw) setData(raw)
      } catch (err) {
        if (!cancelled && !stayCard) {
          setError(err.response?.status === 404 ? 'Stay not found' : 'Failed to load stay')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [source, id, stayCard, isValidSource])

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
          <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error || 'Stay not found'}</p>
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Back
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const name = data.name || data.title || 'Stay'
  const stayLocation = data.location || data.destination || ''
  const type = data.type || data.propertyType || 'Homestay'
  const description = data.description || ''
  const amenities = Array.isArray(data.amenities)
    ? data.amenities
    : (data.amenities ? String(data.amenities).split(',').map(a => a.trim()).filter(Boolean) : [])
  const priceNum = data.pricePerNight ?? data.price
  const price = typeof priceNum === 'number' ? priceNum : (typeof priceNum === 'string' ? parseInt(priceNum.replace(/\D/g, ''), 10) || 0 : 0)
  const contactInfo = data.contactInfo || {}
  const reviews = Array.isArray(data.reviews) ? data.reviews : []

  // Collect all photos: images array + single image so gallery shows every photo (e.g. 1–10+)
  let images = []
  if (Array.isArray(data.images) && data.images.length > 0) {
    data.images.forEach(img => {
      const url = typeof img === 'string' ? toFullImageUrl(img) : (img?.url ? toFullImageUrl(img.url) : null)
      if (url) images.push(url)
    })
  }
  if (data.image) {
    const singleUrl = toFullImageUrl(data.image)
    if (singleUrl && !images.some(u => u === singleUrl)) images = [singleUrl, ...images]
  }
  if (images.length === 0) images = [FALLBACK_IMAGE]

  return (
    <div className="listing-page stay-detail-page enhanced-detail-root">
      <div className="listing-container stay-detail-layout">
        <button type="button" className="back-button stay-detail-back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left" /> Back
        </button>

        {/* Left column: Image gallery (laptop) / first on mobile */}
        <div className="stay-detail-gallery">
        <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
          <div style={{ position: 'relative', aspectRatio: '16/10', width: '100%' }}>
            <img
              src={images[galleryIndex]}
              alt={`${name} - ${galleryIndex + 1}`}
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
                />
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

        {/* Right column: details and booking (laptop) / below gallery on mobile */}
        <div className="stay-detail-content">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{name}</h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          <i className="fas fa-map-marker-alt" style={{ marginRight: 6 }} />{stayLocation} • {type}
        </p>

        {/* Details */}
        <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>About this stay</h2>
          <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{description || 'No description provided.'}</p>
          {amenities.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Amenities</h3>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                {amenities.map((a, i) => (
                  <li key={i} style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontSize: '0.875rem', color: '#475569' }}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Payment / Price */}
        <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>Pricing & payment</h2>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
            ₹{price > 0 ? price.toLocaleString() : '—'} <span style={{ fontWeight: 500, fontSize: '1rem' }}>per night</span>
          </p>
          <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>
            Payment options: UPI, debit/credit card, or bank transfer. Total = price per night × number of nights × guests. You can choose your payment method when you book.
          </p>
        </section>

        {/* Booking procedure */}
        <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#92400e', marginBottom: '0.75rem' }}>Booking procedure</h2>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#78350f', lineHeight: 1.8, fontSize: '0.9375rem' }}>
            <li>Click <strong>Book now</strong> below to open the booking form.</li>
            <li>Enter your details (name, email, phone), number of guests, and check-in / check-out dates.</li>
            <li>Review the total (price per night × nights × guests). Submit the form.</li>
            <li>The host will confirm availability and share payment options (e.g. bank transfer, UPI) and any house rules.</li>
            <li>Complete payment as agreed; keep the confirmation message or email as your booking receipt.</li>
          </ol>
        </section>

        {/* Contact */}
        {(contactInfo.phone || contactInfo.email || (typeof data.contactInfo === 'string' && data.contactInfo)) && (
          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>Contact</h2>
            {contactInfo.phone && <p style={{ margin: '0.25rem 0', color: '#475569' }}><i className="fas fa-phone" style={{ marginRight: 8 }} />{contactInfo.phone}</p>}
            {contactInfo.email && <p style={{ margin: '0.25rem 0', color: '#475569' }}><i className="fas fa-envelope" style={{ marginRight: 8 }} />{contactInfo.email}</p>}
            {typeof data.contactInfo === 'string' && <p style={{ margin: '0.25rem 0', color: '#475569' }}>{data.contactInfo}</p>}
          </section>
        )}

        {/* Reviews */}
        <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
            Reviews {reviews.length > 0 && <span style={{ fontWeight: 500, color: '#64748b' }}>({reviews.length})</span>}
          </h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No reviews yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {reviews.map((r, i) => (
                <li key={i} style={{ padding: '0.75rem 0', borderBottom: i < reviews.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.min(5, r.rating || 0))}{'☆'.repeat(5 - Math.min(5, r.rating || 0))}</span>
                    {r.user?.name && <span style={{ fontWeight: 500, color: '#334155' }}>{r.user.name}</span>}
                  </div>
                  {r.comment && <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem' }}>{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

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
              <i className="fas fa-calendar-check" style={{ marginRight: 8 }} /> Book now
            </button>
            <button type="button" className="back-button" onClick={() => navigate(-1)}>
              Back to list
            </button>
          </div>
        ) : bookingStep === 'done' ? (
          <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>Booking confirmed!</p>
            <p style={{ color: '#15803d', fontSize: '0.9375rem', marginBottom: '1rem' }}>The host will contact you at {bookingForm.email} for payment and check-in details.</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="back-button" onClick={() => { setShowBooking(false); setBookingStep('form'); setBookingForm({ name: '', email: '', phone: '', guests: 1, checkIn: '', checkOut: '' }); setPaymentForm({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' }); }}>Book again</button>
              <button type="button" className="back-button" onClick={() => navigate(-1)}>Back to list</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>{bookingStep === 'form' ? 'Booking details' : 'Payment details'}</h2>
            {bookingStep === 'form' ? (
              <form onSubmit={(e) => { e.preventDefault(); if (bookingForm.name && bookingForm.email && bookingForm.phone && bookingForm.checkIn && bookingForm.checkOut && bookingForm.guests >= 1) setBookingStep('payment'); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Number of guests *</label>
                    <input type="number" min="1" max="50" value={bookingForm.guests} onChange={(e) => setBookingForm(f => ({ ...f, guests: parseInt(e.target.value, 10) || 1 }))} required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Check-in date *</label>
                    <input type="date" value={bookingForm.checkIn} onChange={(e) => setBookingForm(f => ({ ...f, checkIn: e.target.value }))} min={new Date().toISOString().split('T')[0]} required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Check-out date *</label>
                    <input type="date" value={bookingForm.checkOut} onChange={(e) => setBookingForm(f => ({ ...f, checkOut: e.target.value }))} min={bookingForm.checkIn || new Date().toISOString().split('T')[0]} required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                  </div>
                  {bookingForm.checkIn && bookingForm.checkOut && (
                    <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                      {(() => {
                        const nights = Math.ceil((new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) / (1000 * 60 * 60 * 24)) || 0
                        const total = price * nights * bookingForm.guests
                        return <span style={{ color: '#166534' }}>₹{price.toLocaleString()}/night × {nights} nights × {bookingForm.guests} guests = <strong>₹{total.toLocaleString()} total</strong></span>
                      })()}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" className="back-button" onClick={() => setShowBooking(false)}>Cancel</button>
                    <button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Continue to payment</button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setBookingStep('done'); }}>
                {(() => {
                  const nights = Math.max(0, Math.ceil((new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) / (1000 * 60 * 60 * 24)))
                  const total = price * nights * (bookingForm.guests || 1)
                  return (
                    <>
                      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>Payment summary</div>
                        <div style={{ fontSize: '0.875rem', color: '#475569' }}><strong>Stay:</strong> {name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#475569' }}>Check-in: {bookingForm.checkIn} → Check-out: {bookingForm.checkOut}</div>
                        <div style={{ fontSize: '0.875rem', color: '#475569' }}>Guests: {bookingForm.guests} · Nights: {nights}</div>
                        <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>₹{price.toLocaleString()} per night × {nights} nights × {bookingForm.guests} guests</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#15803d', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #a7f3d0' }}>Amount to pay: ₹{total.toLocaleString()}</div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Payment method *</label>
                        <select value={paymentForm.method} onChange={(e) => setPaymentForm(f => ({ ...f, method: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                          <option value="upi">UPI (GPay, PhonePe, Paytm, etc.)</option>
                          <option value="card">Debit / Credit card</option>
                          <option value="bank">Bank transfer / NEFT / IMPS</option>
                        </select>
                      </div>
                      {paymentForm.method === 'upi' && (
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>UPI ID *</label>
                          <input type="text" value={paymentForm.upiId} onChange={(e) => setPaymentForm(f => ({ ...f, upiId: e.target.value }))} placeholder="e.g. name@paytm or 9876543210@ybl" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Host will send payment request to this UPI ID for ₹{total.toLocaleString()}.</p>
                        </div>
                      )}
                      {paymentForm.method === 'card' && (
                        <>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Name on card *</label>
                            <input type="text" value={paymentForm.cardName} onChange={(e) => setPaymentForm(f => ({ ...f, cardName: e.target.value }))} placeholder="As printed on card" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                          </div>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Card number *</label>
                            <input type="text" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="16-digit number" maxLength="19" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Expiry (MM/YY) *</label>
                              <input type="text" value={paymentForm.cardExpiry} onChange={(e) => setPaymentForm(f => ({ ...f, cardExpiry: e.target.value }))} placeholder="MM/YY" maxLength="5" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>CVV *</label>
                              <input type="text" value={paymentForm.cardCvv} onChange={(e) => setPaymentForm(f => ({ ...f, cardCvv: e.target.value }))} placeholder="3 digits" maxLength="4" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
                            </div>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>You will be charged ₹{total.toLocaleString()} after you confirm. Card details are for booking record; host may share a payment link.</p>
                        </>
                      )}
                      {paymentForm.method === 'bank' && (
                        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>After you confirm, the host will share bank account details (account number, IFSC) to transfer ₹{total.toLocaleString()} via NEFT/IMPS.</p>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <button type="button" className="back-button" onClick={() => setBookingStep('form')}>Back</button>
                        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}><i className="fas fa-lock" style={{ marginRight: 6 }} />Confirm booking</button>
                      </div>
                    </>
                  )
                })()}
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
