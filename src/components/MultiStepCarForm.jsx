import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import FormProfileCard from './FormProfileCard'
import CommonListingDetailsSection from './CommonListingDetailsSection'
import { submitCar } from '../services/formSubmissionService'

const MultiStepCarForm = ({ onClose, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState('car-basic-info')
  const [formData, setFormData] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const steps = [
    { id: 'car-basic-info', title: 'Car Information', icon: 'fas fa-info-circle' },
    { id: 'car-details', title: 'Car Details', icon: 'fas fa-car' },
    { id: 'car-specifications', title: 'Specifications', icon: 'fas fa-cogs' },
    { id: 'car-pricing', title: 'Pricing & Finance', icon: 'fas fa-dollar-sign' },
    { id: 'car-media', title: 'Car Media', icon: 'fas fa-camera' },
    { id: 'car-documents', title: 'Documents', icon: 'fas fa-file-alt' }
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
      case 'car-basic-info':
        return formData.make && formData.model
      case 'car-details':
        return formData.year && formData.mileage
      case 'car-specifications':
        return formData.engine && formData.fuelType
      case 'car-pricing':
        return formData.price && formData.currency
      case 'car-media':
        return uploadedImages.length > 0
      case 'car-documents':
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
      if (step.id === 'car-documents') return true // Optional step
      return validateCurrentStep()
    })

    if (!isFormValid) {
      alert('Please fill in all required fields before submitting.')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Please upload at least one image of your car.')
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
      const carData = {
        make: formData.make || '',
        model: formData.model || '',
        year: formData.year || 0,
        mileage: formData.mileage || 0,
        fuelType: formData.fuelType || '',
        transmission: formData.transmission || '',
        color: formData.color || '',
        price: formData.price || 0,
        description: formData.description || '',
        contactInfo: formData.contactInfo || ''
      }

      // Submit to backend
      const result = await submitCar(carData, uploadedImages, token)
      
      // Clear saved form data
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
      delete savedForms.car
      localStorage.setItem('savedForms', JSON.stringify(savedForms))

      console.log('Car submitted to MongoDB:', result)
      alert('Car listed for sale successfully and saved to database!')
      onClose()
    } catch (error) {
      console.error('Error submitting car:', error)
      alert('Failed to submit car. Please try again.')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    submitForm()
  }

  // Load saved form data on component mount
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    if (savedForms.car) {
      setFormData(savedForms.car.formData || {})
      setUploadedImages(savedForms.car.images || [])
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    savedForms.car = { formData, images: uploadedImages }
    localStorage.setItem('savedForms', JSON.stringify(savedForms))
  }, [formData, uploadedImages])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'car-basic-info':
        return (
          <div className="step-form">
            <h3>Car Information</h3>
            <div className="form-group">
              <label>Car Title *</label>
              <input
                type="text"
                placeholder="e.g., 2020 Honda City VX"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="Describe the car condition, features, etc..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Make *</label>
                <select
                  value={formData.make || ''}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  required
                >
                  <option value="">Select Make</option>
                  <option value="maruti">Maruti Suzuki</option>
                  <option value="hyundai">Hyundai</option>
                  <option value="honda">Honda</option>
                  <option value="toyota">Toyota</option>
                  <option value="tata">Tata</option>
                  <option value="mahindra">Mahindra</option>
                  <option value="kia">Kia</option>
                  <option value="volkswagen">Volkswagen</option>
                  <option value="skoda">Skoda</option>
                  <option value="ford">Ford</option>
                  <option value="nissan">Nissan</option>
                  <option value="renault">Renault</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  placeholder="Enter model name"
                  value={formData.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 'car-details':
        return (
          <div className="step-form">
            <h3>Car Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  placeholder="e.g., 2020"
                  min="1990"
                  max="2024"
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fuel Type *</label>
                <select
                  value={formData.fuelType || ''}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  required
                >
                  <option value="">Select Fuel Type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Transmission *</label>
                <select
                  value={formData.transmission || ''}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  required
                >
                  <option value="">Select Transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>
              <div className="form-group">
                <label>Body Type *</label>
                <select
                  value={formData.bodyType || ''}
                  onChange={(e) => handleInputChange('bodyType', e.target.value)}
                  required
                >
                  <option value="">Select Body Type</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="muv">MUV</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  placeholder="Enter car color"
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seating Capacity</label>
                <select
                  value={formData.seatingCapacity || ''}
                  onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                >
                  <option value="">Select Seating</option>
                  <option value="2">2 Seater</option>
                  <option value="4">4 Seater</option>
                  <option value="5">5 Seater</option>
                  <option value="6">6 Seater</option>
                  <option value="7">7 Seater</option>
                  <option value="8">8+ Seater</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'car-specifications':
        return (
          <div className="step-form">
            <h3>Specifications</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Engine (cc)</label>
                <input
                  type="number"
                  placeholder="e.g., 1200"
                  value={formData.engine || ''}
                  onChange={(e) => handleInputChange('engine', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mileage (kmpl)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 15.5"
                  value={formData.mileage || ''}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>KMs Driven *</label>
                <input
                  type="number"
                  placeholder="Total kilometers driven"
                  value={formData.kilometers || ''}
                  onChange={(e) => handleInputChange('kilometers', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>No. of Owners</label>
                <select
                  value={formData.owners || ''}
                  onChange={(e) => handleInputChange('owners', e.target.value)}
                >
                  <option value="">Select Owners</option>
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4">4th+ Owner</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Features</label>
              <div className="features-grid">
                {['AC', 'Power Steering', 'Power Windows', 'Central Locking', 'Music System', 'Airbags', 'ABS', 'Alloy Wheels'].map(feature => (
                  <label key={feature} className="feature-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature) || false}
                      onChange={(e) => {
                        const features = formData.features || []
                        if (e.target.checked) {
                          handleInputChange('features', [...features, feature])
                        } else {
                          handleInputChange('features', features.filter(f => f !== feature))
                        }
                      }}
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'car-pricing':
        return (
          <div className="step-form">
            <h3>Pricing & Finance</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Expected Price (₹) *</label>
                <input
                  type="number"
                  placeholder="Expected selling price"
                  value={formData.expectedPrice || ''}
                  onChange={(e) => handleInputChange('expectedPrice', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Negotiable</label>
                <select
                  value={formData.negotiable || ''}
                  onChange={(e) => handleInputChange('negotiable', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Finance Available</label>
              <select
                value={formData.financeAvailable || ''}
                onChange={(e) => handleInputChange('financeAvailable', e.target.value)}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Exchange Accepted</label>
              <select
                value={formData.exchangeAccepted || ''}
                onChange={(e) => handleInputChange('exchangeAccepted', e.target.value)}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )

      case 'car-media':
        return (
          <div className="step-form">
            <h3>Car Media</h3>
            <div className="form-group">
              <label>Car Images *</label>
              <div className="upload-area">
                <div className="upload-zone" onClick={() => document.getElementById('car-image-upload').click()}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload car images</p>
                  <input 
                    id="car-image-upload"
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

      case 'car-documents':
        return (
          <div className="step-form">
            <h3>Documents</h3>
            <div className="form-group">
              <label>Required Documents</label>
              <div className="document-upload">
                <div className="document-item">
                  <label>RC (Registration Certificate)</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
                <div className="document-item">
                  <label>Insurance Certificate</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
                <div className="document-item">
                  <label>PUC Certificate</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
                <div className="document-item">
                  <label>Service History</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                placeholder="Any additional information about the car"
                value={formData.additionalNotes || ''}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
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
              <h2>Car Reselling</h2>
            </div>
            
            {/* Car Information */}
            <div className="step-form">
              <h3>Car Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Make *</label>
                  <input
                    type="text"
                    placeholder="Enter car make"
                    value={formData.make || ''}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    placeholder="Enter car model"
                    value={formData.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Variant</label>
                <input
                  type="text"
                  placeholder="Enter variant (optional)"
                  value={formData.variant || ''}
                  onChange={(e) => handleInputChange('variant', e.target.value)}
                />
              </div>
            </div>

            {/* Car Details */}
            <div className="step-form">
              <h3>Car Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    placeholder="Enter year"
                    value={formData.year || ''}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mileage (km) *</label>
                  <input
                    type="number"
                    placeholder="Enter mileage"
                    value={formData.mileage || ''}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    placeholder="Enter color"
                    value={formData.color || ''}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select
                    value={formData.transmission || ''}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                  >
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="semi-automatic">Semi-Automatic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="step-form">
              <h3>Specifications</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Engine *</label>
                  <input
                    type="text"
                    placeholder="e.g., 1.5L Turbo"
                    value={formData.engine || ''}
                    onChange={(e) => handleInputChange('engine', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Type *</label>
                  <select
                    value={formData.fuelType || ''}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    placeholder="Enter seating capacity"
                    value={formData.seatingCapacity || ''}
                    onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Body Type</label>
                  <select
                    value={formData.bodyType || ''}
                    onChange={(e) => handleInputChange('bodyType', e.target.value)}
                  >
                    <option value="">Select Body Type</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="muv">MUV</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Finance */}
            <div className="step-form">
              <h3>Pricing & Finance</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Expected Price *</label>
                  <input
                    type="number"
                    placeholder="Enter expected price"
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
                <label>Negotiable</label>
                <select
                  value={formData.negotiable || ''}
                  onChange={(e) => handleInputChange('negotiable', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Car Media */}
            <div className="step-form">
              <h3>Car Media</h3>
              <div className="form-group">
                <label>Car Images</label>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="car-image-upload"
                  />
                  <label htmlFor="car-image-upload" className="upload-label">
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

            {/* Documents */}
            <div className="step-form">
              <h3>Documents</h3>
              <div className="form-group">
                <label>RC Status</label>
                <select
                  value={formData.rcStatus || ''}
                  onChange={(e) => handleInputChange('rcStatus', e.target.value)}
                >
                  <option value="">Select RC Status</option>
                  <option value="clear">Clear</option>
                  <option value="pending">Pending</option>
                  <option value="duplicate">Duplicate</option>
                </select>
              </div>
              <div className="form-group">
                <label>Insurance Status</label>
                <select
                  value={formData.insuranceStatus || ''}
                  onChange={(e) => handleInputChange('insuranceStatus', e.target.value)}
                >
                  <option value="">Select Insurance Status</option>
                  <option value="valid">Valid</option>
                  <option value="expired">Expired</option>
                  <option value="not-available">Not Available</option>
                </select>
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  placeholder="Any additional information about the car..."
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
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
                Sell Car
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
                {currentStep === 'car-documents' && (
                  <button 
                    type="button" 
                    className="nav-btn submit-btn"
                    onClick={handleSubmit}
                  >
                    <i className="fas fa-check"></i>
                    Sell Car
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
                    Add New Car
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
        formType="car"
      />
    </React.Fragment>
  )
}

export default MultiStepCarForm
