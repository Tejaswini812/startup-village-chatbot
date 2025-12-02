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
      console.log('Fetching packages from API...')
      const response = await axios.get(`${API_BASE_URL}/packages`)
      console.log('Packages API response:', response.data)
      
      if (response.data && response.data.length > 0) {
        console.log('Raw API packages:', response.data)
        
        // Transform API packages to match the expected format
        const apiPackages = response.data.map(pkg => {
          console.log('Processing package:', pkg)
          return {
            id: pkg._id || pkg.id,
            title: pkg.title,
            destination: pkg.destination,
            duration: pkg.duration,
            price: `₹${pkg.price}`,
            image: pkg.images?.[0] ? `http://localhost:5000/${pkg.images[0]}` : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: pkg.description || '',
            includes: pkg.includes || '',
            packageType: pkg.packageType || ''
          }
        })
        
        console.log('All transformed API packages:', apiPackages)
        
        // Combine API packages with default packages and limit to first 10
        const combinedPackages = [...apiPackages, ...defaultPackages]
        console.log('Combined packages (API + default):', combinedPackages)
        setPackages(combinedPackages.slice(0, 10))
      } else {
        console.log('No packages in API response, using default packages')
        setPackages(defaultPackages.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      console.log('Using fallback packages data')
      setPackages(defaultPackages.slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
    
    // Listen for package creation
    const handlePackageCreated = () => {
      console.log('Package created, refreshing packages...')
      setLoading(true)
      fetchPackages()
    }
    
    window.addEventListener('packageCreated', handlePackageCreated)
    
    return () => {
      window.removeEventListener('packageCreated', handlePackageCreated)
    }
  }, [])

  const viewPackageDetails = (pkg) => {
    alert(`Package: ${pkg.title}\nDestination: ${pkg.destination}\nDuration: ${pkg.duration}\nPrice: ${pkg.price}`)
  }

  if (loading) {
    return (
      <div className="packages-section">
        <div className="packages-header">
          <h3 className="packages-title">Travel Packages</h3>
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
            <p className="packages-subtitle">Discover amazing destinations</p>
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
