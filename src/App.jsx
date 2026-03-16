import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import HotelsListingPage from './pages/HotelsListingPage'
import StayDetailPage from './pages/StayDetailPage'
import BookingPage from './pages/BookingPage'
import EventsListingPage from './pages/EventsListingPage'
import EventDetailPage from './pages/EventDetailPage'
import PropertiesListingPage from './pages/PropertiesListingPage'
import BuyPropertyDetailPage from './pages/BuyPropertyDetailPage'
import CarsListingPage from './pages/CarsListingPage'
import CarDetailPage from './pages/CarDetailPage'
import AccessoriesListingPage from './pages/AccessoriesListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import PackagesListingPage from './pages/PackagesListingPage'
import PackageDetailPage from './pages/PackageDetailPage'
import AdminPropertiesPage from './pages/AdminPropertiesPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/hotels" element={<HotelsListingPage />} />
              <Route path="/stay/:source/:id" element={<StayDetailPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/events" element={<EventsListingPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/properties" element={<PropertiesListingPage />} />
              <Route path="/buy-property/:source/:id" element={<BuyPropertyDetailPage />} />
              <Route path="/cars" element={<CarsListingPage />} />
              <Route path="/car/:id" element={<CarDetailPage />} />
              <Route path="/accessories" element={<AccessoriesListingPage />} />
              <Route path="/product-detail/:source/:id" element={<ProductDetailPage />} />
              <Route path="/packages" element={<PackagesListingPage />} />
              <Route path="/package/:id" element={<PackageDetailPage />} />
              <Route path="/admin-properties" element={<AdminPropertiesPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App