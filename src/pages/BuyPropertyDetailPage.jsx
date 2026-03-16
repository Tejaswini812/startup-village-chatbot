import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import Footer from '../components/Footer'
import '../styles/listing-pages.css'

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'

function toFullImageUrl(path) {
  if (!path || typeof path !== 'string') return FALLBACK_IMAGE
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${base}/${path.replace(/\\/g, '/')}`
}

function propertyCardToDetail(card) {
  if (!card) return null
  return {
    _id: card.id,
    title: card.name,
    description: '',
    location: card.location || '',
    price: card.price,
    area: card.area || '',
    propertyType: card.type,
    landType: card.type,
    image: card.image,
    images: card.image ? [card.image] : [],
    contactInfo: card.contactInfo || ''
  }
}

export default function BuyPropertyDetailPage() {
  const { source, id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const propertyCard = location.state?.propertyCard
  const [data, setData] = useState(() => propertyCard ? propertyCardToDetail(propertyCard) : null)
  const [loading, setLoading] = useState(!propertyCard)
  const [error, setError] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const validPropertySources = ['properties', 'land-properties']
  const isValidSource = source && validPropertySources.includes(source)

  useEffect(() => {
    if (!source || !id) {
      setError('Invalid property')
      setLoading(false)
      return
    }
    if (propertyCard) setLoading(false)
    // Never call API for "other" or unknown source - backend has no /api/other route (404)
    if (!isValidSource) {
      if (propertyCard) {
        setData(propertyCardToDetail(propertyCard))
      } else {
        setError('Invalid property type')
        setData(null)
      }
      setLoading(false)
      return
    }
    let cancelled = false
    const fetchDetail = async () => {
      try {
        if (!validPropertySources.includes(source)) return
        const res = await axios.get(`${API_BASE_URL}/${source}/${id}`)
        if (cancelled) return
        if (res.data) setData(res.data)
      } catch (err) {
        if (!cancelled && !propertyCard) {
          setError(err.response?.status === 404 ? 'Property not found' : 'Failed to load property')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [source, id, propertyCard, isValidSource])

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
          <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error || 'Property not found'}</p>
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Back
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const isLand = source === 'land-properties'
  const title = data.title || data.name || 'Property'
  const locationStr = data.location || ''
  const description = data.description || ''
  const priceDisplay = typeof data.price === 'string' ? data.price : (data.price != null ? `₹${Number(data.price).toLocaleString()}` : '—')
  const areaDisplay = data.area != null ? (typeof data.unit === 'string' ? `${data.area} ${data.unit}` : `${data.area}`) : ''
  const typeDisplay = data.landType || data.propertyType || ''
  const contactInfo = typeof data.contactInfo === 'string' ? data.contactInfo : (data.contactInfo || '')

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
          {locationStr && (
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              <i className="fas fa-map-marker-alt" style={{ marginRight: 6 }} />{locationStr}
            </p>
          )}
          {typeDisplay && (
            <p style={{ marginBottom: '1rem' }}>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 6, fontSize: '0.875rem' }}>{typeDisplay}</span>
            </p>
          )}

          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>Price</h2>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>{priceDisplay}</p>
            {areaDisplay && <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>Area: {areaDisplay}</p>}
            {isLand && data.purpose && <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.25rem' }}>Purpose: {data.purpose}</p>}
            {isLand && data.ownership && <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.25rem' }}>Ownership: {data.ownership}</p>}
          </section>

          <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>About this property</h2>
            <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{description || 'No description provided.'}</p>
          </section>

          {contactInfo && (
            <section style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>Contact</h2>
              <p style={{ margin: 0, color: '#475569' }}>{contactInfo}</p>
            </section>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="back-button" onClick={() => navigate(-1)}>
              Back to list
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
