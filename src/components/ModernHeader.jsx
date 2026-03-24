import React from 'react'
import { useNavigate } from 'react-router-dom'

const ModernHeader = () => {
  const navigate = useNavigate()

  const scrollToStays = () => {
    const staysSection = document.getElementById('select-your-stays')
    if (staysSection) {
      staysSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <header className="relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-b-3xl shadow-2xl border border-white/30 mb-4 overflow-visible">
      {/* Header Top Section */}
      <div className="relative flex items-center justify-center p-4 lg:p-6">
        {/* Logo - Responsive sizing */}
        <img 
          src="/image.jpg.jpg" 
          alt="Logo" 
          className="absolute left-4 top-3 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full object-cover border-2 lg:border-3 xl:border-4 border-white/30 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        
        {/* Title - Two lines with responsive sizing */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black text-center leading-tight ml-24 sm:ml-28 lg:ml-36 xl:ml-40 mr-16 sm:mr-20 lg:mr-24 xl:mr-28">
          Startup Village<br />
          County
        </h1>
        
        {/* Top-right: Become a host (unchanged) + Signup/Login below */}
        <div className="absolute top-4 right-2 z-10 flex flex-col items-end gap-2">
          <button
            type="button"
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span className="hidden sm:inline">Become a host</span>
          </button>
          <button
            type="button"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            onClick={() => navigate('/book-signup')}
          >
            <i className="fas fa-user"></i>
            <span className="hidden sm:inline">Signup/Login</span>
          </button>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-center text-green-600 font-medium text-sm sm:text-base mb-2">
        Innovation • Community • Growth
      </p>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-2 sm:gap-3 lg:gap-4 px-4 pb-4 flex-wrap">
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[80px] sm:min-w-[100px]">
          Book a Lunch
        </button>
        <button 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[80px] sm:min-w-[100px]"
          onClick={scrollToStays}
        >
          Find a Stay
        </button>
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[80px] sm:min-w-[100px]">
          Host a Property
        </button>
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-w-[80px] sm:min-w-[100px]">
          Partner with Us
        </button>
      </div>
    </header>
  )
}

export default ModernHeader
