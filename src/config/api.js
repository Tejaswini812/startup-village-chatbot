// API Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api'
  },
  production: {
    // For Hostinger VPS: Backend can be on same domain or subdomain
    // Option 1: Same domain (if nginx proxies /api to backend)
    API_BASE_URL: 'https://villagecounty.in/api',
    // Option 2: Subdomain (if backend is on api.villagecounty.in)
    // API_BASE_URL: 'https://api.villagecounty.in/api',
    // Option 3: Different port (if backend is on villagecounty.in:5000)
    // API_BASE_URL: 'https://villagecounty.in:5000/api'
  }
}

// Get current environment
const environment = import.meta.env.MODE || 'development'

// Check if we're in production based on the actual URL
const isProduction = window.location.hostname === 'villagecounty.in' || 
                     window.location.hostname === 'www.villagecounty.in' ||
                     !window.location.hostname.includes('localhost')

// Use environment variable if available (for build-time configuration)
const envApiUrl = import.meta.env.VITE_API_BASE_URL

const actualEnvironment = isProduction ? 'production' : environment

// Fallback to development if environment is not found
const finalEnvironment = config[actualEnvironment] ? actualEnvironment : 'development'

// Export the appropriate configuration
// Priority: Environment variable > Config > Default
export const API_BASE_URL = envApiUrl || config[finalEnvironment].API_BASE_URL


// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}

export default config[finalEnvironment]
