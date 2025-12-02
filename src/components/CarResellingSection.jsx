import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const CarResellingSection = () => {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Default cars as fallback
  const defaultCars = [
    {
      id: 1,
      name: "Toyota Innova Crysta",
      year: "2019",
      price: "₹12.5 Lakhs",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      name: "Mahindra XUV700",
      year: "2021",
      price: "₹18.2 Lakhs",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      name: "Tata Safari",
      year: "2020",
      price: "₹15.8 Lakhs",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 4,
      name: "Hyundai Creta",
      year: "2022",
      price: "₹14.5 Lakhs",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 5,
      name: "Kia Seltos",
      year: "2021",
      price: "₹13.9 Lakhs",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
  ]

  const fetchCars = async () => {
    try {
      console.log('Fetching cars from API...')
      const response = await axios.get(`${API_BASE_URL}/cars`)
      console.log('Cars API response:', response.data)
      
      if (response.data && response.data.length > 0) {
        console.log('Raw API cars:', response.data)
        
        // Transform API cars to match the expected format
        const apiCars = response.data.map(car => {
          console.log('Processing car:', car)
          return {
            id: car._id || car.id,
            name: `${car.make} ${car.model}`,
            year: car.year.toString(),
            price: `₹${(car.price / 100000).toFixed(2)} ${car.price >= 10000000 ? 'Crores' : 'Lakhs'}`,
            image: car.images?.[0] ? `http://localhost:5000/${car.images[0]}` : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            description: car.description || '',
            mileage: car.mileage || '',
            fuelType: car.fuelType || ''
          }
        })
        
        console.log('All transformed API cars:', apiCars)
        
        // Combine API cars with default cars and limit to first 10
        const combinedCars = [...apiCars, ...defaultCars]
        console.log('Combined cars (API + default):', combinedCars)
        setCars(combinedCars.slice(0, 10))
      } else {
        console.log('No cars in API response, using default cars')
        setCars(defaultCars.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      console.log('Using fallback cars data')
      setCars(defaultCars.slice(0, 10))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
    
    // Listen for car creation
    const handleCarCreated = () => {
      console.log('Car created, refreshing cars...')
      setLoading(true)
      fetchCars()
    }
    
    window.addEventListener('carCreated', handleCarCreated)
    
    return () => {
      window.removeEventListener('carCreated', handleCarCreated)
    }
  }, [])

  useEffect(() => {
    console.log('CarResellingSection: Cars loaded with', cars.length, 'items')
  }, [])

  const goToPage = (pageIndex) => {
    setCurrentIndex(pageIndex)
  }

  const viewCarDetails = (car) => {
    alert(`Car: ${car.name}\nYear: ${car.year}\nPrice: ${car.price}`)
  }

  const totalPages = Math.ceil(cars.length / 2)

  if (loading) {
    return (
      <div className="car-reselling-section" id="car-reselling">
        <div className="cars-section">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="car-reselling-section" id="car-reselling">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
        <h2 style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b', margin: '0' }}>Zoom Car/ CAR Resale EXPO</h2>
        <a href="#" className="view-all-link" onClick={(e) => {
          e.preventDefault()
          navigate('/cars')
        }}>View All →</a>
      </div>
      <div className="cars-section">
        <div className="cars-grid" id="cars-grid" style={{ 
          display: 'flex', 
          gap: '0', 
          padding: '0', 
          margin: '0', 
          overflowX: 'auto', 
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch'
        }}>
          {cars.map((car) => (
            <div key={car.id} className="car-card" style={{ 
              backgroundColor: 'white', 
              padding: '4px', 
              borderRadius: '4px', 
              margin: '0',
              minWidth: '50%',
              maxWidth: '50%',
              flexShrink: '0',
              scrollSnapAlign: 'start'
            }}>
              <div className="car-content">
                <img
                  src={car.image}
                  alt={car.name}
                  className="car-image"
                  style={{ 
                    borderRadius: '0',
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="car-details" style={{ backgroundColor: 'white', padding: '2px', borderRadius: '2px', marginTop: '1px', textAlign: 'center' }}>
                  <div className="car-name" style={{ marginBottom: '0px', fontSize: '0.8rem', lineHeight: '1.0' }}>{car.name}</div>
                  <div className="car-year" style={{ marginBottom: '0px', fontSize: '0.7rem', lineHeight: '1.0' }}>{car.year}</div>
                  <div className="car-price" style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0' }}>{car.price}</div>
                </div>
              </div>
              <button
                className="view-details-btn"
                onClick={() => viewCarDetails(car)}
                style={{ 
                  padding: '6px 8px', 
                  fontSize: '0.7rem', 
                  marginTop: '2px',
                  borderRadius: '2px',
                  border: 'none',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  width: '80%',
                  display: 'block',
                  margin: '2px auto 0 auto'
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
        
        <div className="car-navigation-dots" id="car-navigation-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`car-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goToPage(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CarResellingSection
