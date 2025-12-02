import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import HotelsListingPage from './pages/HotelsListingPage'
import BookingPage from './pages/BookingPage'
import EventsListingPage from './pages/EventsListingPage'
import PropertiesListingPage from './pages/PropertiesListingPage'
import CarsListingPage from './pages/CarsListingPage'
import AccessoriesListingPage from './pages/AccessoriesListingPage'
import PackagesListingPage from './pages/PackagesListingPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/hotels" element={<HotelsListingPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/events" element={<EventsListingPage />} />
              <Route path="/properties" element={<PropertiesListingPage />} />
              <Route path="/cars" element={<CarsListingPage />} />
              <Route path="/accessories" element={<AccessoriesListingPage />} />
              <Route path="/packages" element={<PackagesListingPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App