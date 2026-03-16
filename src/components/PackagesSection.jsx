import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const PackagesSection = () => {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  // Default packages as fallback
  const defaultPackages = [
    {
      id: 1,
      title: "Goa Beach Package",
      destination: "Goa, India",
      duration: "3 Days / 2 Nights",
      price: "₹15,000",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      title: "Kerala Backwaters",
      destination: "Kerala, India",
      duration: "4 Days / 3 Nights",
      price: "₹18,500",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      title: "Himachal Adventure",
      destination: "Manali, India",
      duration: "5 Days / 4 Nights",
      price: "₹22,000",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
  ]

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/packages`)
      const data = Array.isArray(response?.data) ? response.data : (response?.data?.data && Array.isArray(response.data.data) ? response.data.data : [])
      if (data.length > 0) {
        const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '')
        const apiPackages = data.map(pkg => ({
          id: pkg._id || pkg.id,
          title: pkg.title || 'Package',
          destination: pkg.destination || '',
          duration: pkg.duration || '',
          price: `₹${pkg.price ?? 0}`,
          image: pkg.images?.[0] ? (pkg.images[0].startsWith('http') ? pkg.images[0] : `${baseUrl}/${String(pkg.images[0]).replace(/\\/g, '/')}`) : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          images: Array.isArray(pkg.images) ? pkg.images : [],
          description: pkg.description || '',
          includes: pkg.includes || '',
          packageType: pkg.packageType || '',
          contactInfo: pkg.contactInfo || ''
        }))
        setPackages([...apiPackages, ...defaultPackages].slice(0, 10))
      } else {
        setPackages(defaultPackages.slice(0, 10))
      }
    } catch (error) {
      setPackages(defaultPackages.slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
    
    // Listen for package creation
    const handlePackageCreated = () => {
      setLoading(true)
      fetchPackages()
    }
    
    window.addEventListener('packageCreated', handlePackageCreated)
    
    return () => {
      window.removeEventListener('packageCreated', handlePackageCreated)
    }
  }, [])

  const viewPackageDetails = (pkg) => {
    navigate(`/package/${pkg.id}`, { state: { packageCard: pkg } })
  }

  if (loading) {
    return (
      <div className="packages-section">
        <div className="packages-header">
          <h3 className="packages-title">Travel Packages</h3>
          <p className="packages-subtitle">Source From our online stores</p>
        </div>
        <div className="packages-container">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="packages-section">
      <div className="packages-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="packages-title">Travel Packages</h3>
            <p className="packages-subtitle">Source From our online stores</p>
          </div>
          <a href="#" className="view-all-link" onClick={(e) => {
            e.preventDefault()
            navigate('/packages')
          }}>View All →</a>
        </div>
      </div>
      
      <div className="packages-container">
        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <div className="package-content">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="package-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                  }}
                />
                <div className="package-details">
                  <div className="package-title">{pkg.title}</div>
                  <div className="package-destination">{pkg.destination}</div>
                  <div className="package-duration">{pkg.duration}</div>
                  <div className="package-price">{pkg.price}</div>
                </div>
              </div>
              <button
                className="view-details-btn"
                onClick={() => viewPackageDetails(pkg)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PackagesSection
