import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
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

  const handleHostProperty = () => {
    navigate('/dashboard')
  }

  const handleLaunchEvent = () => {
    navigate('/dashboard')
  }

  const handleBookLunch = () => {
    window.open('https://startupvillagecounty.in/discovery-village-trails', '_blank')
  }

  return (
    <header className="header" style={{position: 'relative'}}>
      <div className="header-top">
        <img 
          src="/image.jpg.jpg" 
          alt="Logo" 
          className="club-logo"
        />
        <h6 className="club-title">Startup Village<br />County</h6>
        
        <div className="header-top-actions">
          <button
            type="button"
            className="dashboard-btn"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            Become a host
          </button>
          <button
            type="button"
            className="signup-login-btn"
            onClick={() => navigate('/book-signup')}
          >
            <i className="fas fa-user"></i>
            Signup/Login
          </button>
        </div>
      </div>
      <p className="club-tagline-left">Innovation • Community • Growth</p>
      <div className="nav-buttons">
        <button className="nav-btn" onClick={handleBookLunch}>Book a Lunch</button>
        <button className="nav-btn" onClick={scrollToStays}>Find a Stay</button>
        <button className="nav-btn" onClick={handleHostProperty}>Host a Property</button>
        <button className="nav-btn" onClick={handleLaunchEvent}>Launch an Event</button>
      </div>
    </header>
  )
}

export default Header
