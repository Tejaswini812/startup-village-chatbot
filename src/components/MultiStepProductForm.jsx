import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import FormProfileCard from './FormProfileCard'
import CommonListingDetailsSection from './CommonListingDetailsSection'
import { submitProduct } from '../services/formSubmissionService'

const MultiStepProductForm = ({ onClose, onAuthRequired }) => {
  const [currentStep, setCurrentStep] = useState('product-basic-info')
  const [formData, setFormData] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const steps = [
    { id: 'product-basic-info', title: 'Product Information', icon: 'fas fa-info-circle' },
    { id: 'product-details', title: 'Product Details', icon: 'fas fa-box' },
    { id: 'product-pricing', title: 'Pricing & Inventory', icon: 'fas fa-dollar-sign' },
    { id: 'product-category', title: 'Category & Tags', icon: 'fas fa-tags' },
    { id: 'product-media', title: 'Product Media', icon: 'fas fa-camera' },
    { id: 'product-shipping', title: 'Shipping & Returns', icon: 'fas fa-shipping-fast' }
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
      case 'product-basic-info':
        return formData.name && formData.category
      case 'product-details':
        return formData.description && formData.brand
      case 'product-pricing':
        return formData.price && formData.currency
      case 'product-category':
        return formData.tags && formData.tags.length > 0
      case 'product-media':
        return uploadedImages.length > 0
      case 'product-shipping':
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
      if (step.id === 'product-shipping') return true // Optional step
      return validateCurrentStep()
    })

    if (!isFormValid) {
      alert('Please fill in all required fields before submitting.')
      return
    }

    if (uploadedImages.length === 0) {
      alert('Please upload at least one image of your product.')
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
      const productData = {
        name: formData.name || '',
        description: formData.description || '',
        category: formData.category || '',
        price: formData.price || 0,
        quantity: formData.quantity || 0,
        brand: formData.brand || '',
        condition: formData.condition || '',
        contactInfo: formData.contactInfo || ''
      }

      // Submit to backend
      const result = await submitProduct(productData, uploadedImages, token)
      
      // Clear saved form data
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
      delete savedForms.product
      localStorage.setItem('savedForms', JSON.stringify(savedForms))

      console.log('Product submitted to MongoDB:', result)
      alert('Product added to cart successfully and saved to database!')
      onClose()
    } catch (error) {
      console.error('Error submitting product:', error)
      alert('Failed to submit product. Please try again.')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    submitForm()
  }

  // Load saved form data on component mount
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    if (savedForms.product) {
      setFormData(savedForms.product.formData || {})
      setUploadedImages(savedForms.product.images || [])
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}')
    savedForms.product = { formData, images: uploadedImages }
    localStorage.setItem('savedForms', JSON.stringify(savedForms))
  }, [formData, uploadedImages])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'product-basic-info':
        return (
          <div className="step-form">
            <h3>Product Information</h3>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={formData.productName || ''}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Product Description *</label>
              <textarea
                placeholder="Describe your product..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={formData.brand || ''}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  placeholder="Enter model number"
                  value={formData.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'product-details':
        return (
          <div className="step-form">
            <h3>Product Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>SKU/Product Code</label>
                <input
                  type="text"
                  placeholder="Enter SKU or product code"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter weight"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Dimensions (L x W x H)</label>
                <input
                  type="text"
                  placeholder="e.g., 10 x 5 x 3 cm"
                  value={formData.dimensions || ''}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  placeholder="Enter color"
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Material</label>
              <input
                type="text"
                placeholder="Enter material used"
                value={formData.material || ''}
                onChange={(e) => handleInputChange('material', e.target.value)}
              />
            </div>
          </div>
        )

      case 'product-pricing':
        return (
          <div className="step-form">
            <h3>Pricing & Inventory</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="Enter selling price"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Compare at Price</label>
                <input
                  type="number"
                  placeholder="Original price (for discount display)"
                  value={formData.comparePrice || ''}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cost Price</label>
                <input
                  type="number"
                  placeholder="Your cost price"
                  value={formData.costPrice || ''}
                  onChange={(e) => handleInputChange('costPrice', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  placeholder="Available quantity"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Track Inventory</label>
              <select
                value={formData.trackInventory || 'yes'}
                onChange={(e) => handleInputChange('trackInventory', e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )

      case 'product-category':
        return (
          <div className="step-form">
            <h3>Category & Tags</h3>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing & Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="books">Books & Media</option>
                <option value="beauty">Beauty & Health</option>
                <option value="automotive">Automotive</option>
                <option value="toys">Toys & Games</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subcategory</label>
              <input
                type="text"
                placeholder="Enter subcategory"
                value={formData.subcategory || ''}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="Enter tags separated by commas"
                value={formData.tags || ''}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Keywords for Search</label>
              <input
                type="text"
                placeholder="Keywords that help customers find this product"
                value={formData.keywords || ''}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
              />
            </div>
          </div>
        )

      case 'product-media':
        return (
          <div className="step-form">
            <h3>Product Media</h3>
            <div className="form-group">
              <label>Product Images *</label>
              <div className="upload-area">
                <div className="upload-zone" onClick={() => document.getElementById('product-image-upload').click()}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload product images</p>
                  <input 
                    id="product-image-upload"
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

      case 'product-shipping':
        return (
          <div className="step-form">
            <h3>Shipping & Returns</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Shipping Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Shipping weight"
                  value={formData.shippingWeight || ''}
                  onChange={(e) => handleInputChange('shippingWeight', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Shipping Class</label>
                <select
                  value={formData.shippingClass || ''}
                  onChange={(e) => handleInputChange('shippingClass', e.target.value)}
                >
                  <option value="">Select Shipping Class</option>
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="overnight">Overnight</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Return Policy</label>
              <textarea
                placeholder="Describe your return policy"
                value={formData.returnPolicy || ''}
                onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Warranty Information</label>
              <textarea
                placeholder="Enter warranty details"
                value={formData.warranty || ''}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
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
              <h2>Add Products</h2>
            </div>
            
            {/* Product Information */}
            <div className="step-form">
              <h3>Product Information</h3>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="beauty">Beauty</option>
                  <option value="toys">Toys</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Product Details */}
            <div className="step-form">
              <h3>Product Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Brand *</label>
                  <input
                    type="text"
                    placeholder="Enter brand name"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    placeholder="Enter model number"
                    value={formData.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Describe your product..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  placeholder="Enter SKU (optional)"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="step-form">
              <h3>Pricing & Inventory</h3>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="Enter stock quantity"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="step-form">
              <h3>Category & Tags</h3>
              <div className="form-group">
                <label>Tags *</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas"
                  value={formData.tags ? formData.tags.join(', ') : ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    handleInputChange('tags', tags)
                  }}
                />
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <input
                  type="text"
                  placeholder="Enter subcategory"
                  value={formData.subcategory || ''}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                />
              </div>
            </div>

            {/* Product Media */}
            <div className="step-form">
              <h3>Product Media</h3>
              <div className="form-group">
                <label>Product Images</label>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="product-image-upload"
                  />
                  <label htmlFor="product-image-upload" className="upload-label">
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

            {/* Shipping & Returns */}
            <div className="step-form">
              <h3>Shipping & Returns</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Shipping Cost</label>
                  <input
                    type="number"
                    placeholder="Enter shipping cost"
                    value={formData.shippingCost || ''}
                    onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Free Shipping Threshold</label>
                  <input
                    type="number"
                    placeholder="Enter free shipping threshold"
                    value={formData.freeShippingThreshold || ''}
                    onChange={(e) => handleInputChange('freeShippingThreshold', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Return Policy</label>
                <textarea
                  placeholder="Describe your return policy"
                  value={formData.returnPolicy || ''}
                  onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
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
                Add Product
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
            {currentStep === 'product-shipping' && (
              <button 
                type="button" 
                className="nav-btn submit-btn"
                onClick={handleSubmit}
              >
                <i className="fas fa-check"></i>
                Add to Cart
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
                Add New Product
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
        formType="product"
      />
    </React.Fragment>
  )
}

export default MultiStepProductForm
