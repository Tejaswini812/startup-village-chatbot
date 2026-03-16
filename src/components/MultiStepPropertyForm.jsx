import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import { submitProperty } from '../services/formSubmissionService'

// Error display component
const ErrorMessage = ({ error }) => {
  if (!error) return null
  return <div className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</div>
}

const MultiStepPropertyForm = ({ onClose, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState('property-name')
  const [formData, setFormData] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [errors, setErrors] = useState({})
  const { user, isAuthenticated } = useAuth()

  // Load saved form data on component mount
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    if (savedForms.property) {
      setFormData(savedForms.property.formData || {})
      setUploadedImages(savedForms.property.images || [])
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    savedForms.property = { formData, images: uploadedImages }
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

  // Cleanup file URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      })
    }
  }, [uploadedImages])

  const handleStepClick = (step) => {
    setCurrentStep(step)
  }

  const handleFormDataChange = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }))
  }

  const resetForm = () => {
    setFormData({})
    setUploadedImages([])
    setCurrentStep('property-name')
    // Clear localStorage
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    delete savedForms.property
    localStorage.setItem('savedForms', JSON.stringify(savedForms))
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

  const validateStep = (stepId) => {
    const newErrors = { ...errors }
    let isValid = true

    switch (stepId) {
      case 'property-name':
        if (!formData['property-name']?.name) {
          newErrors['property-name'] = 'Property name is required'
          isValid = false
        } else if (!formData['property-name']?.type) {
          newErrors['property-name'] = 'Property type is required'
          isValid = false
        } else {
          delete newErrors['property-name']
        }
        break
      case 'room-types':
        if (!formData['room-types'] || formData['room-types'].length === 0) {
          newErrors['room-types'] = 'At least one room type is required'
          isValid = false
        } else {
          delete newErrors['room-types']
        }
        break
      case 'room-pictures':
        if (uploadedImages.length === 0) {
          newErrors['room-pictures'] = 'At least one image is required'
          isValid = false
        } else {
          delete newErrors['room-pictures']
        }
        break
      case 'pricing-range':
        if (!formData['pricing-range']?.basePrice) {
          newErrors['pricing-range'] = 'Base price is required'
          isValid = false
        } else {
          delete newErrors['pricing-range']
        }
        break
      case 'location':
        if (!formData['location']?.address) {
          newErrors['location'] = 'Address is required'
          isValid = false
        } else if (!formData['location']?.city) {
          newErrors['location'] = 'City is required'
          isValid = false
        } else {
          delete newErrors['location']
        }
        break
      case 'contact-details':
        if (!formData['contact-details']?.phone) {
          newErrors['contact-details'] = 'Phone number is required'
          isValid = false
        } else if (!formData['contact-details']?.email) {
          newErrors['contact-details'] = 'Email is required'
          isValid = false
        } else {
          delete newErrors['contact-details']
        }
        break
      case 'other-rules':
        delete newErrors['other-rules'] // Optional step
        break
      default:
        break
    }

    setErrors(newErrors)
    return isValid
  }

  const validateCurrentStep = () => {
    return validateStep(currentStep)
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }
    
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handleSubmit = () => {
    // Validate all steps
    let isFormValid = true
    steps.forEach(step => {
      if (step.id !== 'other-rules') {
        if (!validateStep(step.id)) {
          isFormValid = false
        }
      }
    })

    if (!isFormValid) {
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

      // Debug: Log the form data structure
      console.log('Form data structure:', formData)
      console.log('Uploaded images:', uploadedImages)
      
      // Transform form data to match backend schema
      const propertyData = {
        title: formData['property-name']?.name || formData.title || 'Property',
        description: formData['property-name']?.description || formData.description || 'Property description',
        price: parseInt(formData['pricing-range']?.basePrice || formData['pricing-range']?.minPrice || formData.price || 0),
        location: formData['location']?.address || formData.location || 'Location',
        propertyType: formData['property-name']?.type || formData.propertyType || 'apartment',
        bedrooms: parseInt(formData['room-types']?.[0]?.count || formData.bedrooms || 0),
        bathrooms: parseInt(formData['room-types']?.[1]?.count || formData.bathrooms || 0),
        area: parseInt(formData['room-types']?.[0]?.size || formData.area || 0),
        amenities: formData['other-rules']?.amenities || formData.amenities || '',
        contactInfo: formData['contact-details']?.phone || formData['contact-details']?.email || formData.contactInfo || 'Contact information not provided'
      }

      // Submit to backend
      const result = await submitProperty(propertyData, uploadedImages, token)
      alert('Property listed successfully! It is now live on "Find Your Stay".')
      
      // Reset form and close
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error submitting property:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      alert(`Failed to submit property: ${error.message}. Please check the console for more details.`)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    submitForm()
  }

  const removeImage = (imageId) => {
    setUploadedImages(prev => {
      const updatedImages = prev.filter(img => img.id !== imageId)
      // Revoke object URL to free memory
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return updatedImages
    })
  }

  const steps = [
    { id: 'property-name', icon: 'fas fa-home', label: 'Property Name' },
    { id: 'room-types', icon: 'fas fa-bed', label: 'Room Types' },
    { id: 'room-pictures', icon: 'fas fa-camera', label: 'Room Pictures' },
    { id: 'pricing-range', icon: 'fas fa-dollar-sign', label: 'Pricing Range' },
    { id: 'location', icon: 'fas fa-map-marker-alt', label: 'Location' },
    { id: 'contact-details', icon: 'fas fa-phone', label: 'Contact Details' },
    { id: 'other-rules', icon: 'fas fa-list', label: 'Other Rules' }
  ]

  return (
    <React.Fragment>
      <div className="multistep-form">
        <div className="step-navigation">
        {steps.map(step => (
          <div 
            key={step.id}
            className={`step-item ${currentStep === step.id ? 'active' : ''}`} 
            onClick={() => handleStepClick(step.id)}
          >
            <i className={step.icon}></i>
            <span>{step.label}</span>
          </div>
        ))}
      </div>
      {/* Removed sidebar buttons as per requirement */}
      
      <div className="step-content">
        {/* Mobile: Show all steps at once, Desktop: Show current step */}
        {isMobile ? (
          // Mobile: Show all steps in one scrollable form
          <div className="mobile-all-steps">
            <div className="form-header-mobile">
              <h2>Host a Property</h2>
            </div>
            {/* Property Name & Basic Info */}
            <div className="step-form">
              <h3>Property Name & Basic Info</h3>
              <div className="form-group">
                <label>Property Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter property name"
                  value={formData['property-name']?.name || ''}
                  onChange={(e) => handleFormDataChange('property-name', { ...formData['property-name'], name: e.target.value })}
                />
                <ErrorMessage error={errors['property-name']} />
              </div>
              <div className="form-group">
                <label>Property Type *</label>
                <select 
                  value={formData['property-name']?.type || ''}
                  onChange={(e) => handleFormDataChange('property-name', { ...formData['property-name'], type: e.target.value })}
                >
                  <option value="">Select Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Describe your property..."
                  value={formData['property-name']?.description || ''}
                  onChange={(e) => handleFormDataChange('property-name', { ...formData['property-name'], description: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            {/* Property Photos */}
            <div className="step-form">
              <h3>Property Photos</h3>
              <div className="form-group">
                <label>Upload Images *</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ marginBottom: '1rem' }}
                />
                {uploadedImages.length > 0 && (
                  <div className="image-preview">
                    <p>Uploaded Images ({uploadedImages.length}):</p>
                    <div className="preview-grid">
                      {uploadedImages.map((image, index) => (
                        <div key={image.id} className="preview-item">
                          <img src={image.preview} alt={`Preview ${index + 1}`} />
                          <button 
                            type="button" 
                            onClick={() => setUploadedImages(prev => prev.filter(img => img.id !== image.id))}
                            className="remove-image"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Range */}
            <div className="step-form">
              <h3>Pricing Range</h3>
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input 
                  type="number" 
                  placeholder="Enter base price"
                  value={formData['pricing-range']?.basePrice || ''}
                  onChange={(e) => handleFormDataChange('pricing-range', { ...formData['pricing-range'], basePrice: e.target.value })}
                />
                <ErrorMessage error={errors['pricing-range']} />
              </div>
              <div className="form-group">
                <label>Minimum Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter minimum price"
                  value={formData['pricing-range']?.minPrice || ''}
                  onChange={(e) => handleFormDataChange('pricing-range', { ...formData['pricing-range'], minPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Room Types */}
            <div className="step-form">
              <h3>Room Details</h3>
              <div className="form-group">
                <label>Number of Bedrooms *</label>
                <input 
                  type="number" 
                  placeholder="Enter number of bedrooms"
                  value={formData['room-types']?.[0]?.count || ''}
                  onChange={(e) => {
                    const roomTypes = [...(formData['room-types'] || [{ type: 'bedroom', count: 0, occupancy: 2, size: 0 }])]
                    roomTypes[0] = { ...roomTypes[0], count: parseInt(e.target.value) || 0 }
                    handleFormDataChange('room-types', roomTypes)
                  }}
                />
              </div>
              <div className="form-group">
                <label>Number of Bathrooms *</label>
                <input 
                  type="number" 
                  placeholder="Enter number of bathrooms"
                  value={formData['room-types']?.[1]?.count || ''}
                  onChange={(e) => {
                    const roomTypes = [...(formData['room-types'] || [{ type: 'bedroom', count: 0, occupancy: 2, size: 0 }, { type: 'bathroom', count: 0, occupancy: 1, size: 0 }])]
                    roomTypes[1] = { ...roomTypes[1], count: parseInt(e.target.value) || 0 }
                    handleFormDataChange('room-types', roomTypes)
                  }}
                />
              </div>
              <div className="form-group">
                <label>Property Size (sq ft)</label>
                <input 
                  type="number" 
                  placeholder="Enter property size"
                  value={formData['room-types']?.[0]?.size || ''}
                  onChange={(e) => {
                    const roomTypes = [...(formData['room-types'] || [{ type: 'bedroom', count: 0, occupancy: 2, size: 0 }])]
                    roomTypes[0] = { ...roomTypes[0], size: parseInt(e.target.value) || 0 }
                    handleFormDataChange('room-types', roomTypes)
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div className="step-form">
              <h3>Location</h3>
              <div className="form-group">
                <label>Address *</label>
                <input 
                  type="text" 
                  placeholder="Enter property address"
                  value={formData['location']?.address || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  placeholder="Enter city"
                  value={formData['location']?.city || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  placeholder="Enter state"
                  value={formData['location']?.state || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], state: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="step-form">
              <h3>Contact Details</h3>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  placeholder="Enter phone number"
                  value={formData['contact-details']?.phone || ''}
                  onChange={(e) => handleFormDataChange('contact-details', { ...formData['contact-details'], phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  value={formData['contact-details']?.email || ''}
                  onChange={(e) => handleFormDataChange('contact-details', { ...formData['contact-details'], email: e.target.value })}
                />
              </div>
            </div>

            {/* Other Rules */}
            <div className="step-form">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label>Amenities</label>
                <textarea 
                  placeholder="List amenities (WiFi, AC, Parking, etc.)"
                  value={formData['other-rules']?.amenities || ''}
                  onChange={(e) => handleFormDataChange('other-rules', { ...formData['other-rules'], amenities: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>House Rules</label>
                <textarea 
                  placeholder="List any house rules or restrictions"
                  value={formData['other-rules']?.rules || ''}
                  onChange={(e) => handleFormDataChange('other-rules', { ...formData['other-rules'], rules: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  minWidth: '80px'
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSubmit}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  minWidth: '100px'
                }}
              >
                Submit Property
              </button>
            </div>
          </div>
        ) : (
          // Desktop: Show current step only
          <React.Fragment>
        {currentStep === 'property-name' && (
          <div className="step-form">
            <h3>Property Name & Basic Info</h3>
            <div className="form-group">
              <label>Property Name *</label>
              <input 
                type="text" 
                placeholder="Enter property name"
                value={formData['property-name']?.name || ''}
                onChange={(e) => handleFormDataChange('property-name', { ...formData['property-name'], name: e.target.value })}
              />
              <ErrorMessage error={errors['property-name']} />
            </div>
            <div className="form-group">
              <label>Property Type *</label>
              <select 
                value={formData['property-name']?.type || ''}
                onChange={(e) => handleFormDataChange('property-name', { ...formData['property-name'], type: e.target.value })}
              >
                <option value="">Select Property Type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Describe your property..."
                value={formData['property-name']?.description || ''}
                onChange={(e) => handleFormDataChange('property-name', { ...formData['property-name'], description: e.target.value })}
              ></textarea>
            </div>
          </div>
        )}
        
        {currentStep === 'room-types' && (
          <div className="step-form">
            <h3>Room Types & Details</h3>
            <div className="room-types-list">
              <ErrorMessage error={errors['room-types']} />
              {(formData['room-types'] || []).map((room, index) => (
                <div key={index} className="room-type-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Room Type</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Deluxe Room, Suite, etc."
                        value={room.type}
                        onChange={(e) => {
                          const newRooms = [...(formData['room-types'] || [])]
                          newRooms[index].type = e.target.value
                          handleFormDataChange('room-types', newRooms)
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Rooms</label>
                      <input 
                        type="number" 
                        placeholder="1"
                        value={room.count}
                        onChange={(e) => {
                          const newRooms = [...(formData['room-types'] || [])]
                          newRooms[index].count = e.target.value
                          handleFormDataChange('room-types', newRooms)
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Occupancy</label>
                      <input 
                        type="number" 
                        placeholder="2"
                        value={room.occupancy}
                        onChange={(e) => {
                          const newRooms = [...(formData['room-types'] || [])]
                          newRooms[index].occupancy = e.target.value
                          handleFormDataChange('room-types', newRooms)
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Room Size (sq ft)</label>
                      <input 
                        type="number" 
                        placeholder="300"
                        value={room.size}
                        onChange={(e) => {
                          const newRooms = [...(formData['room-types'] || [])]
                          newRooms[index].size = e.target.value
                          handleFormDataChange('room-types', newRooms)
                        }}
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="remove-room-btn"
                    onClick={() => {
                      const newRooms = (formData['room-types'] || []).filter((_, i) => i !== index)
                      handleFormDataChange('room-types', newRooms)
                    }}
                  >
                    <i className="fas fa-trash"></i> Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="add-room-btn"
                onClick={() => {
                  const newRooms = [...(formData['room-types'] || []), { type: '', count: 1, occupancy: 2, size: '' }]
                  handleFormDataChange('room-types', newRooms)
                }}
              >
                <i className="fas fa-plus"></i> Add Room Type
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 'room-pictures' && (
          <div className="step-form">
            <h3>Room Pictures</h3>
            <div className="upload-area">
              <div className="upload-zone" onClick={() => document.getElementById('image-upload').click()}>
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop images here or click to upload</p>
                <input 
                  id="image-upload"
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
        )}
        
        {currentStep === 'pricing-range' && (
          <div className="step-form">
            <h3>Pricing Range</h3>
            <div className="pricing-options">
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input 
                  type="number" 
                  placeholder="1000"
                  value={formData['pricing-range']?.basePrice || ''}
                  onChange={(e) => handleFormDataChange('pricing-range', { ...formData['pricing-range'], basePrice: e.target.value })}
                />
                <ErrorMessage error={errors['pricing-range']} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Weekend Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="1500"
                    value={formData['pricing-range']?.weekendPrice || ''}
                    onChange={(e) => handleFormDataChange('pricing-range', { ...formData['pricing-range'], weekendPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Holiday Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="2000"
                    value={formData['pricing-range']?.holidayPrice || ''}
                    onChange={(e) => handleFormDataChange('pricing-range', { ...formData['pricing-range'], holidayPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Seasonal Pricing</label>
                <div className="seasonal-pricing">
                  <div className="season-item">
                    <label>Summer (Apr-Jun)</label>
                    <input 
                      type="number" 
                      placeholder="1200" 
                      value={formData['pricing-range']?.seasonal?.summer || ''}
                      onChange={(e) => handleFormDataChange('pricing-range', { 
                        ...formData['pricing-range'], 
                        seasonal: { 
                          ...formData['pricing-range']?.seasonal, 
                          summer: parseInt(e.target.value) || 0 
                        } 
                      })}
                    />
                  </div>
                  <div className="season-item">
                    <label>Monsoon (Jul-Sep)</label>
                    <input 
                      type="number" 
                      placeholder="800" 
                      value={formData['pricing-range']?.seasonal?.monsoon || ''}
                      onChange={(e) => handleFormDataChange('pricing-range', { 
                        ...formData['pricing-range'], 
                        seasonal: { 
                          ...formData['pricing-range']?.seasonal, 
                          monsoon: parseInt(e.target.value) || 0 
                        } 
                      })}
                    />
                  </div>
                  <div className="season-item">
                    <label>Winter (Oct-Mar)</label>
                    <input 
                      type="number" 
                      placeholder="1500" 
                      value={formData['pricing-range']?.seasonal?.winter || ''}
                      onChange={(e) => handleFormDataChange('pricing-range', { 
                        ...formData['pricing-range'], 
                        seasonal: { 
                          ...formData['pricing-range']?.seasonal, 
                          winter: parseInt(e.target.value) || 0 
                        } 
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'location' && (
          <div className="step-form">
            <h3>Location Details</h3>
            <div className="form-group">
              <label>Full Address *</label>
              <textarea 
                placeholder="Enter complete address..."
                value={formData['location']?.address || ''}
                onChange={(e) => handleFormDataChange('location', { ...formData['location'], address: e.target.value })}
              ></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  placeholder="Bangalore"
                  value={formData['location']?.city || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  placeholder="Karnataka"
                  value={formData['location']?.state || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], state: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input 
                  type="text" 
                  placeholder="560001"
                  value={formData['location']?.pincode || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], pincode: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Landmark</label>
                <input 
                  type="text" 
                  placeholder="Near Metro Station"
                  value={formData['location']?.landmark || ''}
                  onChange={(e) => handleFormDataChange('location', { ...formData['location'], landmark: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'contact-details' && (
          <div className="step-form">
            <h3>Contact Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Person *</label>
                <input 
                  type="text" 
                  placeholder="Your Name"
                  value={formData['contact-details']?.name || ''}
                  onChange={(e) => handleFormDataChange('contact-details', { ...formData['contact-details'], name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={formData['contact-details']?.phone || ''}
                  onChange={(e) => handleFormDataChange('contact-details', { ...formData['contact-details'], phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={formData['contact-details']?.email || ''}
                  onChange={(e) => handleFormDataChange('contact-details', { ...formData['contact-details'], email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={formData['contact-details']?.whatsapp || ''}
                  onChange={(e) => handleFormDataChange('contact-details', { ...formData['contact-details'], whatsapp: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'other-rules' && (
          <div className="step-form">
            <h3>Other Rules & Amenities</h3>
            <div className="amenities-section">
              <h4>Amenities</h4>
              <div className="amenities-grid">
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Parking Available</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Swimming Pool</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Gym</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>WiFi</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Air Conditioning</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Kitchen</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Laundry</span>
                </label>
                <label className="amenity-item">
                  <input type="checkbox" />
                  <span>Security</span>
                </label>
              </div>
            </div>
            <div className="rules-section">
              <h4>House Rules</h4>
              <div className="form-group">
                <label>Check-in Time</label>
                <input type="time" placeholder="14:00" />
              </div>
              <div className="form-group">
                <label>Check-out Time</label>
                <input type="time" placeholder="11:00" />
              </div>
              <div className="form-group">
                <label>Pet Policy</label>
                <select>
                  <option value="">Select Pet Policy</option>
                  <option value="allowed">Pets Allowed</option>
                  <option value="not-allowed">Pets Not Allowed</option>
                  <option value="conditional">Pets Allowed with Conditions</option>
                </select>
              </div>
              <div className="form-group">
                <label>Additional Rules</label>
                <textarea placeholder="Any additional rules or restrictions..."></textarea>
              </div>
            </div>
            {/* Desktop action buttons placed directly below Additional Rules */}
            <div className="form-action-buttons">
              <button
                type="button"
                className="action-btn add-new-btn"
                onClick={() => {
                  const newFormData = { ...formData }
                  const newUploadedImages = [...uploadedImages]
                  setFormData(newFormData)
                  setUploadedImages(newUploadedImages)
                }}
              >
                <i className="fas fa-plus"></i>
                Add New Property
              </button>

              <button
                type="button"
                className="action-btn verify-btn"
                onClick={() => {
                  console.log('Get verify clicked for property')
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
          </div>
        )}
      </React.Fragment>
        )}
      </div>
      
      
      {/* Navigation and Submit Buttons */}
      <div className="form-navigation">
        <div className="nav-buttons">
        </div>
        
        <div className="form-progress">
          <span>Step {steps.findIndex(step => step.id === currentStep) + 1} of {steps.length}</span>
        </div>
      </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        formData={{ formData, images: uploadedImages }}
        formType="property"
      />
    </React.Fragment>
  )
}

export default MultiStepPropertyForm
