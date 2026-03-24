import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import FormProfileCard from './FormProfileCard'
import CommonListingDetailsSection from './CommonListingDetailsSection'
import { submitEvent } from '../services/formSubmissionService'

const MultiStepEventForm = ({ onClose, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState('event-info')
  const [formData, setFormData] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Load saved form data on component mount
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    if (savedForms.event) {
      setFormData(savedForms.event.formData || {})
      setUploadedImages(savedForms.event.images || [])
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    savedForms.event = { formData, images: uploadedImages }
    localStorage.setItem('savedForms', JSON.stringify(savedForms))
  }, [formData, uploadedImages])

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const steps = [
    { id: 'event-info', title: 'Event Information', icon: 'fas fa-info-circle' },
    { id: 'event-details', title: 'Event Details', icon: 'fas fa-calendar-alt' },
    { id: 'event-location', title: 'Event Location', icon: 'fas fa-map-marker-alt' },
    { id: 'event-pricing', title: 'Pricing & Tickets', icon: 'fas fa-ticket-alt' },
    { id: 'event-media', title: 'Event Media', icon: 'fas fa-camera' },
    { id: 'event-rules', title: 'Event Rules', icon: 'fas fa-list-alt' }
  ]

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))
    setUploadedImages(prev => [...prev, ...newImages])
  }

  const removeImage = (imageId) => {
    setUploadedImages(prev => {
      const updatedImages = prev.filter(img => img.id !== imageId)
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return updatedImages
    })
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'event-info':
        return formData.eventName && formData.eventType
      case 'event-details':
        return formData.description && formData.capacity
      case 'event-location':
        return formData.venue && formData.address
      case 'event-pricing':
        return formData.ticketPrice !== undefined
      case 'event-media':
        return uploadedImages.length > 0
      case 'event-rules':
        return true // Optional step
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      alert('Please fill in all required fields before proceeding.')
      return
    }
    
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all steps
    const isFormValid = steps.every(step => {
      if (step.id === 'event-rules') return true // Optional step
      return validateCurrentStep()
    })

    if (!isFormValid) {
      alert('Please fill in all required fields before submitting.')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Please upload at least one image for your event.')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // User is authenticated, proceed with submission
    submitForm()
  }

  const submitForm = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Authentication token not found. Please login again.')
        return
      }

      // Transform form data to match backend schema
      const eventData = {
        title: formData.eventName || '',
        description: formData.description || '',
        category: formData.eventType || '',
        location: {
          venue: formData.venue || '',
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || ''
        },
        dateTime: {
          start: formData.startDate || new Date(),
          end: formData.endDate || new Date()
        },
        price: formData.ticketPrice || 0,
        capacity: formData.capacity || 0,
        contactInfo: {
          phone: formData.phone || '',
          email: formData.email || ''
        }
      }

      // Submit to backend
      const result = await submitEvent(eventData, uploadedImages, token)
      
      // Clear saved form data
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
      delete savedForms.event
      localStorage.setItem('savedForms', JSON.stringify(savedForms))

      console.log('Event submitted to MongoDB:', result)
      alert('Event created successfully and saved to database!')
      onClose()
    } catch (error) {
      console.error('Error submitting event:', error)
      alert('Failed to submit event. Please try again.')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    submitForm()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'event-info':
        return (
          <div className="step-form">
            <h3>Event Information</h3>
            <div className="form-group">
              <label>Event Title *</label>
              <input
                type="text"
                placeholder="e.g., Tech Conference 2024"
                value={formData.eventTitle || ''}
                onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="Describe your event..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="0 for free events"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Type *</label>
                <select
                  value={formData.eventType || ''}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="meetup">Meetup</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'event-details':
        return (
          <div className="step-form">
            <h3>Event Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  value={formData.eventDate || ''}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Time *</label>
                <input
                  type="time"
                  value={formData.eventTime || ''}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Duration (hours)</label>
                <input
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Max Attendees</label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.maxAttendees || ''}
                  onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'event-location':
        return (
          <div className="step-form">
            <h3>Event Location</h3>
            <div className="form-group">
              <label>Venue Name *</label>
              <input
                type="text"
                placeholder="Enter venue name"
                value={formData.venueName || ''}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <textarea
                placeholder="Enter complete address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 'event-pricing':
        return (
          <div className="step-form">
            <h3>Pricing & Tickets</h3>
            <div className="form-group">
              <label>Ticket Categories</label>
              <div className="ticket-categories">
                <div className="ticket-category">
                  <input
                    type="text"
                    placeholder="Category name (e.g., Early Bird)"
                    value={formData.ticketCategory1 || ''}
                    onChange={(e) => handleInputChange('ticketCategory1', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.ticketPrice1 || ''}
                    onChange={(e) => handleInputChange('ticketPrice1', e.target.value)}
                  />
                </div>
                <div className="ticket-category">
                  <input
                    type="text"
                    placeholder="Category name (e.g., Regular)"
                    value={formData.ticketCategory2 || ''}
                    onChange={(e) => handleInputChange('ticketCategory2', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.ticketPrice2 || ''}
                    onChange={(e) => handleInputChange('ticketPrice2', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Registration Deadline</label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline || ''}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
              />
            </div>
          </div>
        )

      case 'event-media':
        return (
          <div className="step-form">
            <h3>Event Media</h3>
            <div className="form-group">
              <label>Event Images</label>
              <div className="upload-area">
                <div className="upload-zone" onClick={() => document.getElementById('event-image-upload').click()}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload event images</p>
                  <input 
                    id="event-image-upload"
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="uploaded-images">
                  <p>Uploaded Images ({uploadedImages.length})</p>
                  <div className="image-grid">
                    {uploadedImages.map(image => (
                      <div key={image.id} className="image-preview-item">
                        <img 
                          src={image.preview} 
                          alt={image.name}
                          className="preview-image"
                        />
                        <button 
                          className="remove-image-btn"
                          onClick={() => removeImage(image.id)}
                          title="Remove image"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'event-rules':
        return (
          <div className="step-form">
            <h3>Event Rules</h3>
            <div className="form-group">
              <label>Terms & Conditions</label>
              <textarea
                placeholder="Enter terms and conditions for the event"
                value={formData.terms || ''}
                onChange={(e) => handleInputChange('terms', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Refund Policy</label>
              <textarea
                placeholder="Enter refund policy"
                value={formData.refundPolicy || ''}
                onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                placeholder="Any special instructions for attendees"
                value={formData.specialInstructions || ''}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <React.Fragment>
      <div className="multistep-form">
        <div className="step-navigation">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step-item ${currentStep === step.id ? 'active' : ''}`}
            onClick={() => handleStepClick(step.id)}
          >
            <i className={step.icon}></i>
            <span>{step.title}</span>
          </div>
        ))}
        <FormProfileCard user={user} />
      </div>
      
      <div className="step-content">
        {/* Mobile: Show all steps at once, Desktop: Show current step */}
        {isMobile ? (
          // Mobile: Show all steps in one scrollable form
          <div className="mobile-all-steps">
            <div className="form-header-mobile">
              <h2>Launch Events</h2>
            </div>
            
            {/* Event Information */}
            <div className="step-form">
              <h3>Event Information</h3>
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={formData.eventName || ''}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Event Type *</label>
                <select
                  value={formData.eventType || ''}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                >
                  <option value="">Select Event Type</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="meetup">Meetup</option>
                  <option value="party">Party</option>
                  <option value="concert">Concert</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Event Details */}
            <div className="step-form">
              <h3>Event Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={formData.eventDate || ''}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Describe your event..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  placeholder="Maximum attendees"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                />
              </div>
            </div>

            {/* Event Location */}
            <div className="step-form">
              <h3>Event Location</h3>
              <div className="form-group">
                <label>Venue Name *</label>
                <input
                  type="text"
                  placeholder="Enter venue name"
                  value={formData.venue || ''}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            {/* Pricing & Tickets */}
            <div className="step-form">
              <h3>Pricing & Tickets</h3>
              <div className="form-group">
                <label>Ticket Price (₹) *</label>
                <input
                  type="number"
                  placeholder="Enter ticket price"
                  value={formData.ticketPrice || ''}
                  onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Early Bird Price (₹)</label>
                <input
                  type="number"
                  placeholder="Early bird discount price"
                  value={formData.earlyBirdPrice || ''}
                  onChange={(e) => handleInputChange('earlyBirdPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Event Media */}
            <div className="step-form">
              <h3>Event Media</h3>
              <div className="form-group">
                <label>Event Images</label>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="event-image-upload"
                  />
                  <label htmlFor="event-image-upload" className="upload-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>Click to upload images</span>
                  </label>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="image-preview">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="preview-item">
                        <img src={image.preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Event Rules */}
            <div className="step-form">
              <h3>Event Rules</h3>
              <div className="form-group">
                <label>Terms & Conditions</label>
                <textarea
                  placeholder="Enter terms and conditions..."
                  value={formData.terms || ''}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Additional Rules</label>
                <textarea
                  placeholder="Any additional rules or restrictions..."
                  value={formData.rules || ''}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  rows="3"
                />
              </div>
            </div>

            {/* Submit Button */}
            <CommonListingDetailsSection
              values={formData}
              onChange={handleInputChange}
            />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                Create Event
              </button>
            </div>
          </div>
        ) : (
          // Desktop: Show current step only
          <React.Fragment>
            {renderStepContent()}

            <CommonListingDetailsSection
              values={formData}
              onChange={handleInputChange}
            />
            
            <div className="form-navigation">
              <div className="nav-buttons">
                {currentStep === 'event-rules' && (
                  <button 
                    type="button" 
                    className="nav-btn submit-btn"
                    onClick={handleSubmit}
                  >
                    <i className="fas fa-check"></i>
                    Create Event
                  </button>
                )}
              </div>
              
              {/* Laptop view only - Additional action buttons */}
              {!isMobile && (
                <div className="form-action-buttons">
                  <button 
                    type="button" 
                    className="action-btn add-new-btn"
                    onClick={() => {
                      // Duplicate form functionality
                      const newFormData = { ...formData }
                      const newUploadedImages = [...uploadedImages]
                      setFormData(newFormData)
                      setUploadedImages(newUploadedImages)
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    Add New Event
                  </button>
                  
                  <button 
                    type="button" 
                    className="action-btn verify-btn"
                    onClick={() => {
                      // Get verify functionality
                      console.log('Get verify clicked')
                    }}
                  >
                    <i className="fas fa-check-circle"></i>
                    Get Verify
                  </button>
                  
                  <button 
                    type="button" 
                    className="action-btn submit-main-btn"
                    onClick={handleSubmit}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Submit
                  </button>
                </div>
              )}
              
              <div className="form-progress">
                <span>Step {steps.findIndex(step => step.id === currentStep) + 1} of {steps.length}</span>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        formData={{ formData, images: uploadedImages }}
        formType="event"
      />
    </React.Fragment>
  )
}

export default MultiStepEventForm
