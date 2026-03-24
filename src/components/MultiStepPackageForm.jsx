import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import FormProfileCard from './FormProfileCard'
import CommonListingDetailsSection from './CommonListingDetailsSection'
import { submitPackage } from '../services/formSubmissionService'

const MultiStepPackageForm = ({ onClose, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState('package-basic-info')
  const [formData, setFormData] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const steps = [
    { id: 'package-basic-info', title: 'Package Information', icon: 'fas fa-info-circle' },
    { id: 'package-details', title: 'Package Details', icon: 'fas fa-suitcase' },
    { id: 'package-itinerary', title: 'Itinerary', icon: 'fas fa-route' },
    { id: 'package-pricing', title: 'Pricing & Inclusions', icon: 'fas fa-dollar-sign' },
    { id: 'package-media', title: 'Package Media', icon: 'fas fa-camera' },
    { id: 'package-terms', title: 'Terms & Conditions', icon: 'fas fa-file-contract' }
  ]

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      case 'package-basic-info':
        return formData.title && formData.duration
      case 'package-details':
        return formData.description && formData.difficulty
      case 'package-itinerary':
        return formData.itinerary && formData.itinerary.length > 0
      case 'package-pricing':
        return formData.price && formData.currency
      case 'package-media':
        return uploadedImages.length > 0
      case 'package-terms':
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
      if (step.id === 'package-terms') return true // Optional step
      return validateCurrentStep()
    })

    if (!isFormValid) {
      alert('Please fill in all required fields before submitting.')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Please upload at least one image for your package.')
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
      const packageData = {
        title: formData.title || '',
        description: formData.description || '',
        destination: formData.destination || '',
        duration: formData.duration || 0,
        difficulty: formData.difficulty || '',
        price: formData.price || 0,
        maxParticipants: formData.maxParticipants || 0,
        includes: formData.includes || '',
        excludes: formData.excludes || '',
        contactInfo: formData.contactInfo || ''
      }

      // Submit to backend
      const result = await submitPackage(packageData, uploadedImages, token)
      
      // Clear saved form data
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
      delete savedForms.package
      localStorage.setItem('savedForms', JSON.stringify(savedForms))

      console.log('Package submitted to MongoDB:', result)
      alert('Package listed successfully and saved to database!')
      onClose()
    } catch (error) {
      console.error('Error submitting package:', error)
      alert('Failed to submit package. Please try again.')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    submitForm()
  }

  // Load saved form data on component mount
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    if (savedForms.package) {
      setFormData(savedForms.package.formData || {})
      setUploadedImages(savedForms.package.images || [])
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    savedForms.package = { formData, images: uploadedImages }
    localStorage.setItem('savedForms', JSON.stringify(savedForms))
  }, [formData, uploadedImages])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'package-basic-info':
        return (
          <div className="step-form">
            <h3>Package Information</h3>
            <div className="form-group">
              <label>Package Title *</label>
              <input
                type="text"
                placeholder="Enter package title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Package Description *</label>
              <textarea
                placeholder="Describe your travel package..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Package Type *</label>
                <select
                  value={formData.packageType || ''}
                  onChange={(e) => handleInputChange('packageType', e.target.value)}
                  required
                >
                  <option value="">Select Package Type</option>
                  <option value="domestic">Domestic Tour</option>
                  <option value="international">International Tour</option>
                  <option value="adventure">Adventure Tour</option>
                  <option value="religious">Religious Tour</option>
                  <option value="honeymoon">Honeymoon Package</option>
                  <option value="family">Family Package</option>
                  <option value="corporate">Corporate Tour</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duration (Days) *</label>
                <input
                  type="number"
                  placeholder="Number of days"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 'package-details':
        return (
          <div className="step-form">
            <h3>Package Details</h3>
            <div className="form-group">
              <label>Destination *</label>
              <input
                type="text"
                placeholder="Enter destination(s)"
                value={formData.destination || ''}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Departure City *</label>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={formData.departureCity || ''}
                  onChange={(e) => handleInputChange('departureCity', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Return City</label>
                <input
                  type="text"
                  placeholder="Return city (if different)"
                  value={formData.returnCity || ''}
                  onChange={(e) => handleInputChange('returnCity', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Min Group Size</label>
                <input
                  type="number"
                  placeholder="Minimum group size"
                  value={formData.minGroupSize || ''}
                  onChange={(e) => handleInputChange('minGroupSize', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Max Group Size</label>
                <input
                  type="number"
                  placeholder="Maximum group size"
                  value={formData.maxGroupSize || ''}
                  onChange={(e) => handleInputChange('maxGroupSize', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'package-itinerary':
        return (
          <div className="step-form">
            <h3>Itinerary</h3>
            <div className="form-group">
              <label>Day-wise Itinerary *</label>
              <div className="itinerary-days">
                {[1, 2, 3, 4, 5].map(day => (
                  <div key={day} className="itinerary-day">
                    <h4>Day {day}</h4>
                    <input
                      type="text"
                      placeholder={`Day ${day} activities`}
                      value={formData[`day${day}`] || ''}
                      onChange={(e) => handleInputChange(`day${day}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Highlights</label>
              <textarea
                placeholder="Key highlights of the package"
                value={formData.highlights || ''}
                onChange={(e) => handleInputChange('highlights', e.target.value)}
              />
            </div>
          </div>
        )

      case 'package-pricing':
        return (
          <div className="step-form">
            <h3>Pricing & Inclusions</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Price per Person (₹) *</label>
                <input
                  type="number"
                  placeholder="Price per person"
                  value={formData.pricePerPerson || ''}
                  onChange={(e) => handleInputChange('pricePerPerson', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Child Price (₹)</label>
                <input
                  type="number"
                  placeholder="Price for children"
                  value={formData.childPrice || ''}
                  onChange={(e) => handleInputChange('childPrice', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>What's Included</label>
              <textarea
                placeholder="List what's included in the package (accommodation, meals, transport, etc.)"
                value={formData.inclusions || ''}
                onChange={(e) => handleInputChange('inclusions', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>What's Not Included</label>
              <textarea
                placeholder="List what's not included (personal expenses, optional activities, etc.)"
                value={formData.exclusions || ''}
                onChange={(e) => handleInputChange('exclusions', e.target.value)}
              />
            </div>
          </div>
        )

      case 'package-media':
        return (
          <div className="step-form">
            <h3>Package Media</h3>
            <div className="form-group">
              <label>Package Images *</label>
              <div className="upload-area">
                <div className="upload-zone" onClick={() => document.getElementById('package-image-upload').click()}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload package images</p>
                  <input 
                    id="package-image-upload"
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

      case 'package-terms':
        return (
          <div className="step-form">
            <h3>Terms & Conditions</h3>
            <div className="form-group">
              <label>Cancellation Policy</label>
              <textarea
                placeholder="Describe cancellation policy"
                value={formData.cancellationPolicy || ''}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Booking Terms</label>
              <textarea
                placeholder="Enter booking terms and conditions"
                value={formData.bookingTerms || ''}
                onChange={(e) => handleInputChange('bookingTerms', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                placeholder="Any special instructions for travelers"
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
              <h2>List Package/Trip</h2>
            </div>
            
            {/* Package Information */}
            <div className="step-form">
              <h3>Package Information</h3>
              <div className="form-group">
                <label>Package Title *</label>
                <input
                  type="text"
                  placeholder="Enter package title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (days) *</label>
                  <input
                    type="number"
                    placeholder="Enter duration"
                    value={formData.duration || ''}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Group Size</label>
                  <input
                    type="number"
                    placeholder="Max group size"
                    value={formData.groupSize || ''}
                    onChange={(e) => handleInputChange('groupSize', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="step-form">
              <h3>Package Details</h3>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Describe your package..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Difficulty Level *</label>
                <select
                  value={formData.difficulty || ''}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Departure City *</label>
                  <input
                    type="text"
                    placeholder="Enter departure city"
                    value={formData.departureCity || ''}
                    onChange={(e) => handleInputChange('departureCity', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Return City</label>
                  <input
                    type="text"
                    placeholder="Return city (if different)"
                    value={formData.returnCity || ''}
                    onChange={(e) => handleInputChange('returnCity', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="step-form">
              <h3>Itinerary</h3>
              <div className="form-group">
                <label>Day-by-Day Itinerary *</label>
                <textarea
                  placeholder="Enter detailed itinerary for each day..."
                  value={formData.itinerary ? formData.itinerary.join('\n\n') : ''}
                  onChange={(e) => {
                    const itinerary = e.target.value.split('\n\n').filter(day => day.trim())
                    handleInputChange('itinerary', itinerary)
                  }}
                  rows="6"
                />
              </div>
            </div>

            {/* Pricing & Inclusions */}
            <div className="step-form">
              <h3>Pricing & Inclusions</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Currency *</label>
                  <select
                    value={formData.currency || ''}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="">Select Currency</option>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>What's Included</label>
                <textarea
                  placeholder="List what's included in the package..."
                  value={formData.inclusions || ''}
                  onChange={(e) => handleInputChange('inclusions', e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>What's Not Included</label>
                <textarea
                  placeholder="List what's not included..."
                  value={formData.exclusions || ''}
                  onChange={(e) => handleInputChange('exclusions', e.target.value)}
                  rows="3"
                />
              </div>
            </div>

            {/* Package Media */}
            <div className="step-form">
              <h3>Package Media</h3>
              <div className="form-group">
                <label>Package Images</label>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="package-image-upload"
                  />
                  <label htmlFor="package-image-upload" className="upload-label">
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

            {/* Terms & Conditions */}
            <div className="step-form">
              <h3>Terms & Conditions</h3>
              <div className="form-group">
                <label>Booking Terms</label>
                <textarea
                  placeholder="Enter booking terms and conditions..."
                  value={formData.bookingTerms || ''}
                  onChange={(e) => handleInputChange('bookingTerms', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Cancellation Policy</label>
                <textarea
                  placeholder="Enter cancellation policy..."
                  value={formData.cancellationPolicy || ''}
                  onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
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
                List Package
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
                {currentStep === 'package-terms' && (
                  <button 
                    type="button" 
                    className="nav-btn submit-btn"
                    onClick={handleSubmit}
                  >
                    <i className="fas fa-check"></i>
                    List Package
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
                    Add New Package
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
        formType="package"
      />
    </React.Fragment>
  )
}

export default MultiStepPackageForm
