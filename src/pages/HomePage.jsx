import React from 'react'
import Header from '../components/Header'
import Chatbot from '../components/Chatbot'
import PromotionalCarousel from '../components/PromotionalCarousel'
import LocationButtons from '../components/LocationButtons'
import BookingSection from '../components/BookingSection'
import EventsSection from '../components/EventsSection'
import PropertySection from '../components/PropertySection'
import CarResellingSection from '../components/CarResellingSection'
import AccessoriesSection from '../components/AccessoriesSection'
import PackagesSection from '../components/PackagesSection'
import Footer from '../components/Footer'
import FloatingButtons from '../components/FloatingButtons'

const HomePage = () => {

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        <Chatbot />
        <PromotionalCarousel />
        <LocationButtons />
        <EventsSection />
        <PackagesSection />
        <BookingSection />
        <PropertySection />
        <CarResellingSection />
        <AccessoriesSection />
      </main>
      
      <Footer />
      <FloatingButtons />
    </div>
  )
}

export default HomePage
