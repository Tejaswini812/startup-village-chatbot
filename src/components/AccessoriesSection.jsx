import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const AccessoriesSection = () => {
  const navigate = useNavigate()
  const [accessories, setAccessories] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccessories()
  }, [])

  const fetchAccessories = async () => {
    try {
      const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '')
      // Try both accessories and products APIs
      const [accessoriesResponse, productsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/accessories`, { timeout: 5000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE_URL}/products`, { timeout: 5000 }).catch(() => ({ data: [] }))
      ])
      
      // Handle both array and object response formats
      const accessoriesData = accessoriesResponse?.data?.data ?? accessoriesResponse?.data
      
      // Transform accessories data (id and source for detail page)
      const transformedAccessories = (accessoriesData && Array.isArray(accessoriesData)) ? accessoriesData.map(accessory => ({
        id: accessory._id,
        source: 'accessories',
        name: accessory.name || 'Product',
        price: `₹${accessory.price ?? 0}`,
        description: accessory.description || 'High quality product',
        image: accessory.image ? (accessory.image.startsWith('http') ? accessory.image : `${baseUrl}/${accessory.image}`) : 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        images: accessory.images || (accessory.image ? [accessory.image] : []),
        contactInfo: accessory.contactInfo || ''
      })) : []
      
      // Transform products data (id and source for detail page)
      const transformedProducts = Array.isArray(productsResponse?.data) ? productsResponse.data.map(product => ({
        id: product._id,
        source: 'products',
        name: product.name || 'Product',
        price: `₹${product.price ?? 0}`,
        description: product.description || 'High quality product',
        image: product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}/${product.images[0]}`) : 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        images: product.images || [],
        contactInfo: product.contactInfo || ''
      })) : []
      
      // Combine both types and limit to first 10
      const allAccessories = [...transformedAccessories, ...transformedProducts]
      
      if (allAccessories.length > 0) {
        setAccessories(allAccessories.slice(0, 10))
      } else {
        throw new Error('No data from API')
      }
    } catch (error) {
      // Fallback to static data
      setAccessories([
        {
          id: 1,
          source: 'products',
          name: "Shakti Technology High Pressure Washer",
          price: "₹199",
          description: "Best seller - High pressure car washer with accessories",
          image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 2,
          source: 'products',
          name: "Shrida Naturals Lemon & Orange Air Freshener",
          price: "₹199",
          description: "Fresh scent lasting up to 45 days, 60g net content",
          image: "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 3,
          source: 'products',
          name: "Premium Car Phone Mount",
          price: "₹450",
          description: "Universal dashboard phone holder with suction cup",
          image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 4,
          source: 'products',
          name: "LED Headlight Bulbs Set",
          price: "₹1,200",
          description: "Bright white LED bulbs for better night visibility",
          image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 5,
          source: 'products',
          name: "Leather Steering Wheel Cover",
          price: "₹650",
          description: "Comfortable leather grip cover with anti-slip design",
          image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 6,
          source: 'products',
          name: "Premium Car Floor Mats",
          price: "₹1,500",
          description: "Heavy-duty rubber floor protection with anti-slip",
          image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 7,
          source: 'products',
          name: "Portable Bluetooth Speaker",
          price: "₹2,200",
          description: "Waterproof wireless speaker with 20W output",
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 8,
          source: 'products',
          name: "Cordless Car Vacuum Cleaner",
          price: "₹1,800",
          description: "Powerful 12V car vacuum with HEPA filter",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 9,
          source: 'products',
          name: "Digital Tire Pressure Gauge",
          price: "₹350",
          description: "Precision digital tire pressure monitor",
          image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        },
        {
          id: 10,
          source: 'products',
          name: "Multi-Compartment Car Organizer",
          price: "₹950",
          description: "Expandable storage organizer for trunk and backseat",
          image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (pageIndex) => {
    setCurrentIndex(pageIndex)
  }

  const buyAccessory = (accessory) => {
    const raw = accessory.source || 'products'
    const source = (raw === 'accessories' || raw === 'products') ? raw : 'products'
    const id = accessory.id
    navigate(`/product-detail/${source}/${id}`, { state: { productCard: accessory } })
  }

  const totalPages = Math.ceil(accessories.length / 3)

  if (loading) {
    return (
      <div className="accessories-section">
        <div className="accessories-header">
          <h3 className="accessories-title">Source From our online stores</h3>

        </div>
        <div className="accessories-container">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="accessories-section">
      <div className="accessories-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="accessories-title">Source From our online stores</h3>
            <p className="accessories-subtitle">Quality products at affordable prices</p>
          </div>
          <a href="#" className="view-all-link" onClick={(e) => {
            e.preventDefault()
            navigate('/accessories')
          }}>View All →</a>
        </div>
      </div>
      
      <div className="accessories-container">
        <div className="accessories-grid" id="accessories-grid">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="accessory-card">
              <div className="accessory-content">
                <img
                  src={accessory.image}
                  alt={accessory.name}
                  className="accessory-image"
                  onError={(e) => {
                    e.target.src = '/image1.png'
                  }}
                />
                <div className="accessory-name">{accessory.name}</div>
                <div className="accessory-price">{accessory.price}</div>
              </div>
              <button
                className="buy-now-btn"
                onClick={() => buyAccessory(accessory)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
        
        <div className="accessories-navigation-dots" id="accessories-navigation-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`accessory-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goToPage(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AccessoriesSection
