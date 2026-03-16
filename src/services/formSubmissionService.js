import { API_BASE_URL } from '../config/api'
import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 1
const MAX_DIMENSION = 1024

// Compress image file if over 1MB (returns same file if not image or already small). Exported for use in SignupForm etc.
export async function compressImageIfNeeded(file) {
  if (!file || !file.type?.startsWith('image/')) return file
  if (file.size <= MAX_SIZE_MB * 1024 * 1024) return file
  try {
    const options = { maxSizeMB: MAX_SIZE_MB, maxWidthOrHeight: MAX_DIMENSION, useWebWorker: true }
    const compressed = await imageCompression(file, options)
    return compressed
  } catch {
    return file
  }
}

// Helper function to create FormData for multipart uploads (compresses images > 1MB)
const createFormData = async (formData, images) => {
  const data = new FormData()
  
  // Add all form fields
  Object.keys(formData).forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      if (typeof formData[key] === 'object') {
        data.append(key, JSON.stringify(formData[key]))
      } else {
        data.append(key, formData[key])
      }
    }
  })
  
  // Add images (compressed if > 1MB)
  if (images && images.length > 0) {
    for (const image of images) {
      const file = image?.file ? await compressImageIfNeeded(image.file) : image
      if (file) data.append('images', file)
    }
  }
  
  return data
}

// Property submission (Host a Property -> Find Your Stay)
export const submitProperty = async (formData, images, token) => {
  try {
    // Use multipart endpoint to handle file uploads
    const formDataToSend = await createFormData(formData, images)
    
    console.log('🔧 Form Submission Debug:')
    console.log('- API Base URL:', API_BASE_URL)
    console.log('- Full URL:', `${API_BASE_URL}/properties`)
    console.log('- Form data:', formData)
    console.log('- Images:', images)
    console.log('- Token:', token ? 'Present' : 'Missing')
    
    // Log FormData contents
    console.log('- FormData contents:')
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formDataToSend
    })
    
    console.log('- Response status:', response.status)
    console.log('- Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }
      throw new Error(`Failed to submit property: ${errorData.message || 'Unknown error'}`)
    }
    
    const result = await response.json()
    console.log('✅ Success response:', result)
    return result
  } catch (error) {
    console.error('❌ Error submitting property:', error)
    throw error
  }
}

// Land Property submission (Host a Land Property -> Buy & SELL/lease Property)
export const submitLandProperty = async (formData, images, token) => {
  try {
    const data = await createFormData(formData, images)
    
    const response = await fetch(`${API_BASE_URL}/land-properties`, {
      method: 'POST',
      body: data
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit land property')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting land property:', error)
    throw error
  }
}

// Event submission
export const submitEvent = async (formData, images, token) => {
  try {
    const data = await createFormData(formData, images)
    
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: data
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit event')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting event:', error)
    throw error
  }
}

// Product submission
export const submitProduct = async (formData, images, token) => {
  try {
    const data = await createFormData(formData, images)
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: data
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit product')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting product:', error)
    throw error
  }
}

// Package submission
export const submitPackage = async (formData, images, token) => {
  try {
    const data = await createFormData(formData, images)
    
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'POST',
      body: data
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit package')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting package:', error)
    throw error
  }
}

// Car submission
export const submitCar = async (formData, images, token) => {
  try {
    const data = await createFormData(formData, images)
    
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      body: data
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit car')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting car:', error)
    throw error
  }
}


// Get all submitted forms for display
export const getSubmittedForms = async (token) => {
  try {
    const [properties, events, landProperties, products, packages, cars] = await Promise.all([
      fetch(`${API_BASE_URL}/properties`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/events`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/land-properties`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/products`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/packages`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/cars`).then(res => res.json()).catch(() => [])
    ])

    // Combine all forms with their types
    const allForms = [
      ...properties.map(item => ({ ...item, type: 'property' })),
      ...events.map(item => ({ ...item, type: 'event' })),
      ...landProperties.map(item => ({ ...item, type: 'land' })),
      ...products.map(item => ({ ...item, type: 'product' })),
      ...packages.map(item => ({ ...item, type: 'package' })),
      ...cars.map(item => ({ ...item, type: 'car' }))
    ]

    // Sort by creation date (newest first)
    return allForms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Error fetching submitted forms:', error)
    return []
  }
}
