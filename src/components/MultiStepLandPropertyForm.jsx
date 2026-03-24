import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import FormProfileCard from './FormProfileCard'
import CommonListingDetailsSection from './CommonListingDetailsSection'
import { submitLandProperty } from '../services/formSubmissionService'

const MultiStepLandPropertyForm = ({ onClose, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState('land-basic-info')
  const [formData, setFormData] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const steps = [
    { id: 'land-basic-info', title: 'Land Basic Info', icon: 'fas fa-info-circle' },
    { id: 'land-details', title: 'Land Details', icon: 'fas fa-map-marked-alt' },
    { id: 'land-pricing', title: 'Pricing & Terms', icon: 'fas fa-dollar-sign' },
    { id: 'land-location', title: 'Location Details', icon: 'fas fa-map-marker-alt' },
    { id: 'land-media', title: 'Land Media', icon: 'fas fa-camera' },
    { id: 'land-legal', title: 'Legal Documents', icon: 'fas fa-file-contract' }
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
      case 'land-basic-info':
        return formData.title && formData.landType
      case 'land-details':
        return formData.size && formData.description
      case 'land-pricing':
        return formData.price && formData.currency
      case 'land-location':
        return formData.address && formData.city
      case 'land-media':
        return uploadedImages.length > 0
      case 'land-legal':
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
      if (step.id === 'land-legal') return true // Optional step
      return validateCurrentStep()
    })

    if (!isFormValid) {
      alert('Please fill in all required fields before submitting.')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Please upload at least one image of your land property.')
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
      const landPropertyData = {
        title: formData.title || '',
        description: formData.description || '',
        landType: formData.landType || '',
        size: formData.size || 0,
        unit: formData.unit || 'sqft',
        price: formData.price || 0,
        location: formData.location || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        contactInfo: formData.contactInfo || ''
      }

      // Submit to backend
      const result = await submitLandProperty(landPropertyData, uploadedImages, token)
      
      // Clear saved form data
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
      delete savedForms.land
      localStorage.setItem('savedForms', JSON.stringify(savedForms))

      console.log('Land property submitted to MongoDB:', result)
      alert('Land property listed successfully and saved to database!')
      onClose()
    } catch (error) {
      console.error('Error submitting land property:', error)
      alert('Failed to submit land property. Please try again.')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    submitForm()
  }

  // Load saved form data on component mount
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    if (savedForms.land) {
      setFormData(savedForms.land.formData || {})
      setUploadedImages(savedForms.land.images || [])
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    savedForms.land = { formData, images: uploadedImages }
    localStorage.setItem('savedForms', JSON.stringify(savedForms))
  }, [formData, uploadedImages])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'land-basic-info':
        return (
          <div className="step-form">
            <h3>Land Basic Information</h3>
            <div className="form-group">
              <label>Property Title *</label>
              <input
                type="text"
                placeholder="Enter land property title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="Describe the land property..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Land Type *</label>
                <select
                  value={formData.landType || ''}
                  onChange={(e) => handleInputChange('landType', e.target.value)}
                  required
                >
                  <option value="">Select Land Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed-use">Mixed Use</option>
                </select>
              </div>
              <div className="form-group">
                <label>Purpose *</label>
                <select
                  value={formData.purpose || ''}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="lease">For Lease</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'land-details':
        return (
          <div className="step-form">
            <h3>Land Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Area (sq ft) *</label>
                <input
                  type="number"
                  placeholder="Enter area in square feet"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Area Unit</label>
                <select
                  value={formData.areaUnit || 'sqft'}
                  onChange={(e) => handleInputChange('areaUnit', e.target.value)}
                >
                  <option value="sqft">Square Feet</option>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Length (ft)</label>
                <input
                  type="number"
                  placeholder="Length in feet"
                  value={formData.length || ''}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Width (ft)</label>
                <input
                  type="number"
                  placeholder="Width in feet"
                  value={formData.width || ''}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Soil Type</label>
              <select
                value={formData.soilType || ''}
                onChange={(e) => handleInputChange('soilType', e.target.value)}
              >
                <option value="">Select Soil Type</option>
                <option value="clay">Clay</option>
                <option value="sandy">Sandy</option>
                <option value="loamy">Loamy</option>
                <option value="rocky">Rocky</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )

      case 'land-pricing':
        return (
          <div className="step-form">
            <h3>Pricing & Terms</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price per sq ft</label>
                <input
                  type="number"
                  placeholder="Price per square foot"
                  value={formData.pricePerSqft || ''}
                  onChange={(e) => handleInputChange('pricePerSqft', e.target.value)}
                />
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
            <div className="form-group">
              <label>Payment Terms</label>
              <textarea
                placeholder="Describe payment terms and conditions"
                value={formData.paymentTerms || ''}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              />
            </div>
          </div>
        )

      case 'land-location':
        return (
          <div className="step-form">
            <h3>Location Details</h3>
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
            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={formData.pincode || ''}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nearby Landmarks</label>
                <input
                  type="text"
                  placeholder="e.g., Near Metro Station"
                  value={formData.landmarks || ''}
                  onChange={(e) => handleInputChange('landmarks', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'land-media':
        return (
          <div className="step-form">
            <h3>Land Media</h3>
            <div className="form-group">
              <label>Land Images</label>
              <div className="upload-area">
                <div className="upload-zone" onClick={() => document.getElementById('land-image-upload').click()}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload land images</p>
                  <input 
                    id="land-image-upload"
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

      case 'land-legal':
        return (
          <div className="step-form">
            <h3>Legal Documents</h3>
            <div className="form-group">
              <label>Property Documents</label>
              <div className="document-upload">
                <div className="document-item">
                  <label>Sale Deed / Title Deed</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
                <div className="document-item">
                  <label>Property Tax Receipt</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
                <div className="document-item">
                  <label>Encumbrance Certificate</label>
                  <input type="file" accept=".pdf,.jpg,.png" className="file-input" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                placeholder="Any additional legal information or notes"
                value={formData.legalNotes || ''}
                onChange={(e) => handleInputChange('legalNotes', e.target.value)}
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
              <h2>Host Land Property</h2>
            </div>
            
            {/* Land Basic Information */}
            <div className="step-form">
              <h3>Land Basic Information</h3>
              <div className="form-group">
                <label>Property Title *</label>
                <input
                  type="text"
                  placeholder="Enter property title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Land Type *</label>
                <select
                  value={formData.landType || ''}
                  onChange={(e) => handleInputChange('landType', e.target.value)}
                >
                  <option value="">Select Land Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed-use">Mixed Use</option>
                </select>
              </div>
            </div>

            {/* Land Details */}
            <div className="step-form">
              <h3>Land Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Size (sq ft) *</label>
                  <input
                    type="number"
                    placeholder="Enter size in sq ft"
                    value={formData.size || ''}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g., 50x100 ft"
                    value={formData.dimensions || ''}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Describe your land property..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="4"
                />
              </div>
            </div>

            {/* Pricing & Terms */}
            <div className="step-form">
              <h3>Pricing & Terms</h3>
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
                <label>Price Per Unit</label>
                <input
                  type="text"
                  placeholder="e.g., ₹500 per sq ft"
                  value={formData.pricePerUnit || ''}
                  onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="step-form">
              <h3>Location Details</h3>
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
                <label>City *</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
            </div>

            {/* Land Media */}
            <div className="step-form">
              <h3>Land Media</h3>
              <div className="form-group">
                <label>Land Images</label>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="land-image-upload"
                  />
                  <label htmlFor="land-image-upload" className="upload-label">
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

            {/* Legal Documents */}
            <div className="step-form">
              <h3>Legal Documents</h3>
              <div className="form-group">
                <label>Legal Status</label>
                <select
                  value={formData.legalStatus || ''}
                  onChange={(e) => handleInputChange('legalStatus', e.target.value)}
                >
                  <option value="">Select Legal Status</option>
                  <option value="freehold">Freehold</option>
                  <option value="leasehold">Leasehold</option>
                  <option value="power-of-attorney">Power of Attorney</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  placeholder="Any additional information about legal documents..."
                  value={formData.legalNotes || ''}
                  onChange={(e) => handleInputChange('legalNotes', e.target.value)}
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
                List Land Property
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
            {currentStep === 'land-legal' && (
              <button 
                type="button" 
                className="nav-btn submit-btn"
                onClick={handleSubmit}
              >
                <i className="fas fa-check"></i>
                List Land Property
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
                Add New Land Property
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
        formType="land"
      />
    </React.Fragment>
  )
}

export default MultiStepLandPropertyForm
