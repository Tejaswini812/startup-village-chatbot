import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'
import '../styles/detail-enhancements.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'

function toFullImageUrl(path) {
  if (!path || typeof path !== 'string') return FALLBACK_IMAGE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${base}/${path.replace(/\\/g, '/')}`
}

/** Only 24-char hex IDs are valid MongoDB ObjectIds for /api/packages/:id */
function isMongoObjectIdString(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

const FALLBACK_PACKAGES = [
  { id: 1, title: 'Goa Beach Package', location: 'Goa, India', price: 15000, duration: '3 Days / 2 Nights', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Amazing beach package with water sports', includes: 'Hotel, Meals, Activities', packageType: 'Beach' },
  { id: 2, title: 'Kerala Backwaters', location: 'Kerala, India', price: 18500, duration: '4 Days / 3 Nights', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Peaceful backwater cruise experience', includes: 'Houseboat, Meals, Sightseeing', packageType: 'Backwater' },
  { id: 3, title: 'Himachal Adventure', location: 'Manali, India', price: 22000, duration: '5 Days / 4 Nights', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Adventure sports and mountain views', includes: 'Hotel, Meals, Adventure Activities', packageType: 'Adventure' }
]

function packageCardToDetail(card) {
  if (!card) return null
  const priceNum = typeof card.price === 'string' ? parseInt(card.price.replace(/[^\d]/g, ''), 10) || 0 : (card.price || 0)
  return {
    _id: card.id,
    title: card.title,
    destination: card.destination || card.location || '',
    duration: card.duration,
    price: priceNum,
    description: card.description || '',
    image: card.image,
    images: card.images?.length ? card.images : (card.image ? [card.image] : []),
    includes: card.includes || '',
    contactInfo: card.contactInfo || '',
    packageType: card.packageType || ''
  }
}

export default function PackageDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const packageCard = location.state?.packageCard
  const [data, setData] = useState(() => packageCard ? packageCardToDetail(packageCard) : null)
  const [loading, setLoading] = useState(!packageCard)
  const [error, setError] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState('form')
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', guests: 1, checkIn: '', checkOut: '' })
  const [paymentForm, setPaymentForm] = useState({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' })

  useEffect(() => {
    if (!id) { setError('Invalid package'); setLoading(false); return }

    if (packageCard) {
      setData(packageCardToDetail(packageCard))
      setError(null)
    }

    if (!isMongoObjectIdString(id)) {
      if (!packageCard) {
        const fb = FALLBACK_PACKAGES.find((p) => String(p.id) === String(id))
        if (fb) {
          setData(packageCardToDetail({ ...fb, destination: fb.location }))
          setError(null)
        } else {
          setError('Package not found')
          setData(null)
        }
      }
      setLoading(false)
      return
    }

    let cancelled = false
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/packages/${id}`)
        if (cancelled) return
        if (res.data) setData(res.data)
      } catch (err) {
        if (!cancelled && !packageCard) {
          setError('Failed to load package')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [id, packageCard])

  if (loading) return (<div className="listing-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>)
  if (error || !data) return (
    <div className="listing-page"><div className="listing-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error || 'Package not found'}</p>
      <button type="button" className="back-button" onClick={() => navigate(-1)}><i className="fas fa-arrow-left" /> Back</button>
    </div><Footer /></div>
  )

  const title = data.title || 'Package'
  const destination = data.destination || ''
  const duration = data.duration || ''
  const price = typeof data.price === 'number' ? data.price : parseInt(String(data.price || '0').replace(/\D/g, ''), 10) || 0
  const description = data.description || ''
  const includes = data.includes || ''
  const contactInfo = data.contactInfo || ''

  let images = []
  if (Array.isArray(data.images) && data.images.length > 0) images = data.images.map(toFullImageUrl)
  if (data.image) { const u = toFullImageUrl(data.image); if (!images.includes(u)) images = [u, ...images] }
  if (images.length === 0) images = [FALLBACK_IMAGE]

  return (
    <div className="listing-page stay-detail-page enhanced-detail-root">
      <div className="listing-container stay-detail-layout">
        <button type="button" className="back-button stay-detail-back" onClick={() => navigate(-1)}><i className="fas fa-arrow-left" /> Back</button>
        <div className="stay-detail-gallery">
          <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
            <div style={{ position: 'relative', aspectRatio: '16/10', width: '100%' }}>
              <img src={images[galleryIndex]} alt={`${title} - ${galleryIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.src = FALLBACK_IMAGE }} />
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => setGalleryIndex(i => (i - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: '1.25rem', color: '#166534' }}><i className="fas fa-chevron-left" /></button>
                  <button type="button" onClick={() => setGalleryIndex(i => (i + 1) % images.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: '1.25rem', color: '#166534' }}><i className="fas fa-chevron-right" /></button>
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '0.875rem', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 20 }}>{galleryIndex + 1} / {images.length}</div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, padding: 10, overflowX: 'auto', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={i} type="button" onClick={() => setGalleryIndex(i)} style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: galleryIndex === i ? '3px solid #16a34a' : '2px solid #e2e8f0', padding: 0, cursor: 'pointer', background: '#e2e8f0' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK_IMAGE }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="stay-detail-content">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{title}</h1>
          {destination && <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}><i className="fas fa-map-marker-alt" style={{ marginRight: 6 }} />{destination}</p>}
          {duration && <p style={{ color: '#16a34a', marginBottom: '1rem', fontWeight: 500 }}>{duration}</p>}
          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>Price</h2>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>₹{price.toLocaleString()}</p>
          </section>
          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>About</h2>
            <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{description || 'No description.'}</p>
          </section>
          {includes && (
            <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>What's included</h2>
              <p style={{ margin: 0, color: '#475569', whiteSpace: 'pre-wrap' }}>{includes}</p>
            </section>
          )}
          {contactInfo && (
            <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>Contact</h2>
              <p style={{ margin: 0, color: '#475569' }}>{contactInfo}</p>
            </section>
          )}
          {!showBooking ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setShowBooking(true)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                <i className="fas fa-calendar-check" style={{ marginRight: 8 }} /> Book now
              </button>
              <button type="button" className="back-button" onClick={() => navigate(-1)}>Back to list</button>
            </div>
          ) : bookingStep === 'done' ? (
            <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
              <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>Booking confirmed!</p>
              <p style={{ color: '#15803d', fontSize: '0.9375rem', marginBottom: '1rem' }}>Provider will contact you at {bookingForm.email} with further details.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="back-button" onClick={() => { setShowBooking(false); setBookingStep('form'); setBookingForm({ name: '', email: '', phone: '', guests: 1, checkIn: '', checkOut: '' }); setPaymentForm({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' }); }}>Book again</button>
                <button type="button" className="back-button" onClick={() => navigate(-1)}>Back to list</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>{bookingStep === 'form' ? 'Booking details' : 'Payment details'}</h2>
              {bookingStep === 'form' ? (
                <form onSubmit={(e) => { e.preventDefault(); if (bookingForm.name && bookingForm.email && bookingForm.phone && bookingForm.guests >= 1) setBookingStep('payment'); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Number of guests *</label><input type="number" min="1" value={bookingForm.guests} onChange={(e) => setBookingForm(f => ({ ...f, guests: parseInt(e.target.value, 10) || 1 }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Name *</label><input type="text" value={bookingForm.name} onChange={(e) => setBookingForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Email *</label><input type="email" value={bookingForm.email} onChange={(e) => setBookingForm(f => ({ ...f, email: e.target.value }))} placeholder="Your email" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Phone *</label><input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))} placeholder="Your phone" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Preferred dates (optional)</label><div style={{ display: 'flex', gap: 8 }}><input type="date" value={bookingForm.checkIn} onChange={(e) => setBookingForm(f => ({ ...f, checkIn: e.target.value }))} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /><input type="date" value={bookingForm.checkOut} onChange={(e) => setBookingForm(f => ({ ...f, checkOut: e.target.value }))} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div></div>
                    <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}><span style={{ color: '#166534' }}>₹{price.toLocaleString()} × {bookingForm.guests} guest(s) = ₹{(price * bookingForm.guests).toLocaleString()} total</span></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}><button type="button" className="back-button" onClick={() => setShowBooking(false)}>Cancel</button><button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Continue to payment</button></div>
                  </div>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBookingStep('done'); }}>
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}><strong>{title}</strong> — {bookingForm.guests} guest(s)</div>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>Amount: <strong>₹{(price * bookingForm.guests).toLocaleString()}</strong></div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Payment method</label><select value={paymentForm.method} onChange={(e) => setPaymentForm(f => ({ ...f, method: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}><option value="upi">UPI</option><option value="card">Card</option><option value="bank">Bank transfer</option></select></div>
                  {paymentForm.method === 'upi' && <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>UPI ID</label><input type="text" value={paymentForm.upiId} onChange={(e) => setPaymentForm(f => ({ ...f, upiId: e.target.value }))} placeholder="e.g. name@paytm" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>}
                  {paymentForm.method === 'card' && <><div style={{ marginBottom: '0.75rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Name on card</label><input type="text" value={paymentForm.cardName} onChange={(e) => setPaymentForm(f => ({ ...f, cardName: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ marginBottom: '0.75rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Card number</label><input type="text" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="16 digits" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ display: 'flex', gap: '0.5rem' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Expiry</label><input type="text" value={paymentForm.cardExpiry} onChange={(e) => setPaymentForm(f => ({ ...f, cardExpiry: e.target.value }))} placeholder="MM/YY" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>CVV</label><input type="text" value={paymentForm.cardCvv} onChange={(e) => setPaymentForm(f => ({ ...f, cardCvv: e.target.value }))} placeholder="3 digits" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div></div></>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}><button type="button" className="back-button" onClick={() => setBookingStep('form')}>Back</button><button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}><i className="fas fa-lock" style={{ marginRight: 6 }} />Confirm booking</button></div>
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
