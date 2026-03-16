import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const PropertySection = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  // Handle scroll events to update current index
  useEffect(() => {
    const scrollContainer = document.getElementById('property-scroll')
    if (!scrollContainer) return

    const handleScroll = () => {
      const cardWidth = scrollContainer.querySelector('.property-card')?.offsetWidth || 0
      const scrollLeft = scrollContainer.scrollLeft
      const newIndex = Math.round(scrollLeft / (cardWidth + 16))
      setCurrentIndex(newIndex)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [properties])

  const fetchProperties = async () => {
    try {
      // Fetch both so one failure doesn't hide the other (hosted properties + land both show)
      const [propertiesResult, landResult] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/properties`),
        axios.get(`${API_BASE_URL}/land-properties`)
      ])
      const propertiesResponse = propertiesResult.status === 'fulfilled' ? propertiesResult.value : null
      const landPropertiesResponse = landResult.status === 'fulfilled' ? landResult.value : null
      
      // Transform properties data (safe price/area to avoid NaN or division by zero)
      const transformedProperties = (Array.isArray(propertiesResponse?.data) ? propertiesResponse.data : []).map(property => {
        let imageUrl = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'
        if (property.images?.[0]) {
          const imagePath = property.images[0]
          if (typeof imagePath === 'string') {
            imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`
          }
        }
        const priceNum = Number(property.price) || 0
        const areaNum = Number(property.area) || 1
        const pricePerSqft = areaNum > 0 ? Math.round(priceNum / areaNum) : 0
        return {
          id: property._id,
          source: 'properties',
          name: property.title || 'Property',
          price: `₹${(priceNum / 100000).toFixed(2)} ${priceNum >= 10000000 ? 'Crores' : 'Lakhs'}`,
          area: `${areaNum} sqft`,
          pricePerSqft: `₹${pricePerSqft.toLocaleString()}`,
          image: imageUrl,
          location: property.location || 'Location',
          type: property.propertyType || ''
        }
      })
      
      // Transform land properties data (safe price/area)
      const transformedLandProperties = (Array.isArray(landPropertiesResponse?.data) ? landPropertiesResponse.data : []).map(landProperty => {
        let imageUrl = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop'
        if (landProperty.images?.[0]) {
          const imagePath = landProperty.images[0]
          if (typeof imagePath === 'string') {
            imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`
          }
        }
        const priceNum = Number(landProperty.price) || 0
        const areaNum = Number(landProperty.area) || 1
        const pricePerSqft = areaNum > 0 ? Math.round(priceNum / areaNum) : 0
        return {
          id: landProperty._id,
          source: 'land-properties',
          name: landProperty.title || 'Land',
          price: `₹${(priceNum / 100000).toFixed(2)} ${priceNum >= 10000000 ? 'Crores' : 'Lakhs'}`,
          area: `${areaNum} ${landProperty.unit || 'sqft'}`,
          pricePerSqft: `₹${pricePerSqft.toLocaleString()}`,
          image: imageUrl,
          location: landProperty.location || 'Location',
          type: landProperty.landType || ''
        }
      })
      
      // Combine both types of properties and limit to first 10
      const allProperties = [...transformedProperties, ...transformedLandProperties].slice(0, 10)
      
      if (allProperties.length === 0) {
        const fallbackProperties = [
          {
            id: 1,
            source: 'properties',
            name: "Luxury Villa",
            price: "₹1.15 Crores",
            area: "1,500 sqft",
            pricePerSqft: "₹7,666",
            image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
          },
          {
            id: 2,
            source: 'properties',
            name: "Modern Apartment",
            price: "₹1.15 Crores",
            area: "1,500 sqft",
            pricePerSqft: "₹7,666",
            image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
          },
          {
            id: 3,
            source: 'properties',
            name: "Premium House",
            price: "₹1.8 Crores",
            area: "2,000 sqft",
            pricePerSqft: "₹9,000",
            image: "https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
          },
          {
            id: 4,
            source: 'properties',
            name: "Executive Villa",
            price: "₹2.5 Crores",
            area: "2,200 sqft",
            pricePerSqft: "₹11,363",
            image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
          },
          {
            id: 5,
            source: 'properties',
            name: "Cozy Home",
            price: "₹85 Lakhs",
            area: "1,800 sqft",
            pricePerSqft: "₹4,722",
            image: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
          }
        ]
        setProperties(fallbackProperties.slice(0, 10))
      } else {
        setProperties(allProperties)
      }
    } catch (error) {
      // Fallback to static data if API fails
      setProperties([
        {
          id: 1,
          source: 'properties',
          name: "Luxury Villa",
          price: "₹1.15 Crores",
          area: "1,500 sqft",
          pricePerSqft: "₹7,666",
          image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
        },
        {
          id: 2,
          source: 'properties',
          name: "Modern Apartment",
          price: "₹1.15 Crores",
          area: "1,500 sqft",
          pricePerSqft: "₹7,666",
          image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
        },
        {
          id: 3,
          source: 'properties',
          name: "Premium House",
          price: "₹1.8 Crores",
          area: "2,000 sqft",
          pricePerSqft: "₹9,000",
          image: "https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
        },
        {
          id: 4,
          source: 'properties',
          name: "Executive Villa",
          price: "₹2.5 Crores",
          area: "2,200 sqft",
          pricePerSqft: "₹11,363",
          image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
        },
        {
          id: 5,
          source: 'properties',
          name: "Cozy Home",
          price: "₹85 Lakhs",
          area: "1,800 sqft",
          pricePerSqft: "₹4,722",
          image: "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1000&h=600&fit=crop"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (pageIndex) => {
    setCurrentIndex(pageIndex)
    const scrollContainer = document.getElementById('property-scroll')
    if (scrollContainer) {
      const cardWidth = scrollContainer.querySelector('.property-card')?.offsetWidth || 0
      const scrollAmount = pageIndex * (cardWidth + 16) // 16px for gap
      scrollContainer.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const buyProperty = (property) => {
    const source = property.source || 'properties'
    navigate(`/buy-property/${source}/${property.id}`, { state: { propertyCard: property } })
  }

  const totalPages = Math.ceil(properties.length / 2)

  if (loading) {
    return (
      <div className="property-section">
        <div className="property-header">
          <h3 className="property-title">Buy & SELL / lease → Property</h3>
        </div>
        <div className="property-container">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="property-section" style={{ display: 'block', visibility: 'visible', margin: '0', padding: '0' }}>
      <div className="property-header">
        <h3 className="property-title" style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 'bold' }}>Buy & SELL / lease → Property</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="property-location-buttons">
            {['Wayanad', 'Shakaleshwara', 'Hassan', 'Coorg', 'Mysore', 'Chikmagalore', 'BR Hills', 'Shivana Samudra', 'Bandipur'].map((location, index) => (
              <button key={index} className="property-location-btn">
                {location}
              </button>
            ))}
          </div>
          <a href="#" className="view-all-link" onClick={(e) => {
            e.preventDefault()
            navigate('/properties')
          }}>View All →</a>
        </div>
      </div>
      
      <div className="property-container" style={{ padding: '0', margin: '0' }}>
        <div className="property-scroll" id="property-scroll" style={{ gap: '0', padding: '0', margin: '0' }}>
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-content">
                <img
                  src={property.image}
                  alt={property.name}
                  className="property-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="property-details">
                  <div className="property-name">{property.name}</div>
                  <div className="property-price">{property.price}</div>
                  <div className="property-area">{property.area} • {property.pricePerSqft}</div>
                </div>
              </div>
              <button
                className="buy-now-btn"
                onClick={() => buyProperty(property)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
        
        <div className="property-navigation-dots" id="property-navigation-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`property-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goToPage(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PropertySection
