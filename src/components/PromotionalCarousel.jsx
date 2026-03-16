import React, { useState, useEffect } from 'react'

const PromotionalCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const images = [
    {
      src: '/image1.png',
      alt: 'Discovery Village Trials - Batch 25'
    },
    {
      src: '/image2.png',
      alt: 'Startup Village County Experience'
    },
    {
      src: '/image3.png',
      alt: 'Explore Discovery Village Trails'
    },
    {
      src: '/image4.png',
      alt: 'Promotional Banner 4'
    },
    {
      src: '/image5.png',
      alt: 'Promotional Banner 5'
    }
  ]

  // Auto-scroll every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [images.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length)
  }

  const goToPrev = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length)
  }

  return (
    <div className="promotional-slider">
      <div className="slider-container">
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToNext()}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="promo-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>
        

        
        {/* Progress Dots */}
        <div className="slider-dots">
          {images.map((_, index) => (
            <button 
              key={index}
              onClick={() => goToSlide(index)} 
              className={`dot ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromotionalCarousel
