const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

// Function to read and parse CSV data
function loadUsersFromCSV() {
  try {
    const csvPath = path.join(__dirname, '../data/UserData.csv')
    
    // Check if file exists before reading
    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found, using empty user list. File path:', csvPath)
      return []
    }
    
    const csvData = fs.readFileSync(csvPath, 'utf8')
    const lines = csvData.split('\n')
    const users = []
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        const columns = line.split(',')
        if (columns.length >= 8) {
          const user = {
            id: columns[0]?.trim() || '',
            name: columns[1]?.trim() || '',
            email: columns[2]?.trim() || '',
            phone: columns[3]?.trim() || '',
            whatsapp: columns[4]?.trim() || '',
            privateCall: columns[5]?.trim() || '',
            chatLink: columns[6]?.trim() || '',
            carNumber: columns[7]?.trim() || '',
            referralId: columns[8]?.trim() || '',
            linkedin: columns[9]?.trim() || ''
          }
          
          // Only add users with valid data
          if (user.id && user.name) {
            users.push(user)
          }
        }
      }
    }
    
    console.log(`Loaded ${users.length} users from CSV`)
    return users
  } catch (error) {
    console.error('Error loading CSV data:', error)
    return []
  }
}

// Load users from CSV
let users = loadUsersFromCSV()

// Get user by ID
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const user = users.find(u => u.id === userId.toUpperCase())
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      })
    }
    
    // Format the response to match expected structure
    const formattedUser = {
      id: user.id,
      name: user.name,
      carNumber: user.carNumber,
      phone: user.phone,
      whatsapp: user.whatsapp,
      email: user.email,
      chatLink: !!user.chatLink,
      privateCall: !!user.privateCall,
      referralId: user.referralId,
      linkedin: user.linkedin
    }
    
    res.json({
      success: true,
      data: formattedUser,
      message: 'User found successfully'
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Get all users (for admin purposes)
router.get('/', (req, res) => {
  try {
    // Reload users from CSV in case it was updated
    users = loadUsersFromCSV()
    
    res.json({
      success: true,
      data: users,
      count: users.length,
      message: 'Users retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Create new user (Note: This is read-only from CSV, but kept for API compatibility)
router.post('/', (req, res) => {
  try {
    res.status(405).json({
      success: false,
      message: 'User creation not supported. Data is read-only from CSV file.',
      error: 'READ_ONLY_MODE'
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Update user (Note: This is read-only from CSV, but kept for API compatibility)
router.put('/:userId', (req, res) => {
  try {
    res.status(405).json({
      success: false,
      message: 'User update not supported. Data is read-only from CSV file.',
      error: 'READ_ONLY_MODE'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Delete user (Note: This is read-only from CSV, but kept for API compatibility)
router.delete('/:userId', (req, res) => {
  try {
    res.status(405).json({
      success: false,
      message: 'User deletion not supported. Data is read-only from CSV file.',
      error: 'READ_ONLY_MODE'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

module.exports = router
