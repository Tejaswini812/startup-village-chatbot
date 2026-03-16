import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop'

function toFullImageUrl(path) {
  if (!path || typeof path !== 'string') return FALLBACK_IMAGE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${base}/${path.replace(/\\/g, '/')}`
}

function productCardToDetail(card) {
  if (!card) return null
  const priceNum = typeof card.price === 'string' ? parseInt(card.price.replace(/[^\d]/g, ''), 10) || 0 : (card.price || 0)
  return {
    _id: card.id,
    name: card.name,
    price: priceNum,
    description: card.description || '',
    image: card.image,
    images: card.images?.length ? card.images : (card.image ? [card.image] : []),
    contactInfo: card.contactInfo || ''
  }
}

export default function ProductDetailPage() {
  const { source, id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const productCard = location.state?.productCard
  const [data, setData] = useState(() => productCard ? productCardToDetail(productCard) : null)
  const [loading, setLoading] = useState(!productCard)
  const [error, setError] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showBuy, setShowBuy] = useState(false)
  const [buyStep, setBuyStep] = useState('form')
  const [buyForm, setBuyForm] = useState({ name: '', email: '', phone: '', quantity: 1 })
  const [paymentForm, setPaymentForm] = useState({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' })

  const validProductSources = ['accessories', 'products']
  const apiSource = validProductSources.includes(source) ? (source === 'accessories' ? 'accessories' : 'products') : 'products'

  useEffect(() => {
    if (!id) { setError('Invalid product'); setLoading(false); return }
    if (productCard) setLoading(false)
    let cancelled = false
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/${apiSource}/${id}`)
        if (cancelled) return
        const raw = res.data
        if (raw) {
          const normalized = {
            _id: raw._id || raw.id,
            name: raw.name || raw.title,
            price: typeof raw.price === 'number' ? raw.price : parseInt(String(raw.price || '0').replace(/\D/g, ''), 10) || 0,
            description: raw.description || '',
            image: raw.image || raw.images?.[0],
            images: Array.isArray(raw.images) ? raw.images : (raw.image ? [raw.image] : []),
            contactInfo: raw.contactInfo || ''
          }
          setData(normalized)
        }
      } catch (err) {
        if (!cancelled && !productCard) { setError('Failed to load product'); setData(null) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [id, apiSource, productCard])

  if (loading) return (<div className="listing-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner" /></div>)
  if (error || !data) return (
    <div className="listing-page"><div className="listing-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error || 'Product not found'}</p>
      <button type="button" className="back-button" onClick={() => navigate(-1)}><i className="fas fa-arrow-left" /> Back</button>
    </div><Footer /></div>
  )

  const name = data.name || 'Product'
  const price = typeof data.price === 'number' ? data.price : 0
  const description = data.description || ''
  const contactInfo = data.contactInfo || ''

  let images = []
  if (Array.isArray(data.images) && data.images.length > 0) images = data.images.map(toFullImageUrl)
  if (data.image) { const u = toFullImageUrl(data.image); if (!images.includes(u)) images = [u, ...images] }
  if (images.length === 0) images = [FALLBACK_IMAGE]

  return (
    <div className="listing-page stay-detail-page">
      <div className="listing-container stay-detail-layout">
        <button type="button" className="back-button stay-detail-back" onClick={() => navigate(-1)}><i className="fas fa-arrow-left" /> Back</button>
        <div className="stay-detail-gallery">
          <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
            <div style={{ position: 'relative', aspectRatio: '16/10', width: '100%' }}>
              <img src={images[galleryIndex]} alt={`${name} - ${galleryIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.src = FALLBACK_IMAGE }} />
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{name}</h1>
          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>Price</h2>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>₹{price.toLocaleString()}</p>
          </section>
          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>Description</h2>
            <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{description || 'No description.'}</p>
          </section>
          {contactInfo && (
            <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>Contact</h2>
              <p style={{ margin: 0, color: '#475569' }}>{contactInfo}</p>
            </section>
          )}
          {!showBuy ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setShowBuy(true)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                <i className="fas fa-shopping-cart" style={{ marginRight: 8 }} /> Buy now
              </button>
              <button type="button" className="back-button" onClick={() => navigate(-1)}>Back to list</button>
            </div>
          ) : buyStep === 'done' ? (
            <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
              <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>Order submitted!</p>
              <p style={{ color: '#15803d', fontSize: '0.9375rem', marginBottom: '1rem' }}>Seller will contact you at {buyForm.email} with payment details.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="back-button" onClick={() => { setShowBuy(false); setBuyStep('form'); setBuyForm({ name: '', email: '', phone: '', quantity: 1 }); setPaymentForm({ method: 'upi', upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' }); }}>Buy another</button>
                <button type="button" className="back-button" onClick={() => navigate(-1)}>Back to list</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>{buyStep === 'form' ? 'Your details' : 'Payment'}</h2>
              {buyStep === 'form' ? (
                <form onSubmit={(e) => { e.preventDefault(); if (buyForm.name && buyForm.email && buyForm.phone && buyForm.quantity >= 1) setBuyStep('payment'); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Quantity *</label><input type="number" min="1" value={buyForm.quantity} onChange={(e) => setBuyForm(f => ({ ...f, quantity: parseInt(e.target.value, 10) || 1 }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Name *</label><input type="text" value={buyForm.name} onChange={(e) => setBuyForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Email *</label><input type="email" value={buyForm.email} onChange={(e) => setBuyForm(f => ({ ...f, email: e.target.value }))} placeholder="Your email" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Phone *</label><input type="tel" value={buyForm.phone} onChange={(e) => setBuyForm(f => ({ ...f, phone: e.target.value }))} placeholder="Your phone" required style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}><span style={{ color: '#166534' }}>₹{price.toLocaleString()} × {buyForm.quantity} = ₹{(price * buyForm.quantity).toLocaleString()} total</span></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}><button type="button" className="back-button" onClick={() => setShowBuy(false)}>Cancel</button><button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Continue to payment</button></div>
                  </div>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBuyStep('done'); }}>
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}><strong>{name}</strong> × {buyForm.quantity}</div>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>Amount: <strong>₹{(price * buyForm.quantity).toLocaleString()}</strong></div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Payment method</label><select value={paymentForm.method} onChange={(e) => setPaymentForm(f => ({ ...f, method: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}><option value="upi">UPI</option><option value="card">Card</option><option value="bank">Bank transfer</option></select></div>
                  {paymentForm.method === 'upi' && <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>UPI ID</label><input type="text" value={paymentForm.upiId} onChange={(e) => setPaymentForm(f => ({ ...f, upiId: e.target.value }))} placeholder="e.g. name@paytm" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div>}
                  {paymentForm.method === 'card' && <><div style={{ marginBottom: '0.75rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Name on card</label><input type="text" value={paymentForm.cardName} onChange={(e) => setPaymentForm(f => ({ ...f, cardName: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ marginBottom: '0.75rem' }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Card number</label><input type="text" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="16 digits" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ display: 'flex', gap: '0.5rem' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>Expiry</label><input type="text" value={paymentForm.cardExpiry} onChange={(e) => setPaymentForm(f => ({ ...f, cardExpiry: e.target.value }))} placeholder="MM/YY" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 500 }}>CVV</label><input type="text" value={paymentForm.cardCvv} onChange={(e) => setPaymentForm(f => ({ ...f, cardCvv: e.target.value }))} placeholder="3 digits" style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} /></div></div></>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}><button type="button" className="back-button" onClick={() => setBuyStep('form')}>Back</button><button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}><i className="fas fa-lock" style={{ marginRight: 6 }} />Place order</button></div>
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
