const express = require('express')
const router = express.Router()

// Invalid resource - frontend must not request /api/other; return 400 to avoid 404
router.get('/other/:id', (req, res) => {
  res.status(400).json({ message: 'Invalid API resource. Use /api/stays, /api/hotels, /api/properties, /api/events, etc.' })
})

// WhatsApp notification endpoint
router.post('/send-whatsapp', (req, res) => {
  try {
    const { memberName, memberID, chatLink } = req.body
    
    // Validate required fields
    if (!memberName || !memberID || !chatLink) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: memberName, memberID, chatLink',
        error: 'MISSING_FIELDS'
      })
    }
    
    // Simulate WhatsApp notification sending
    // In a real implementation, you would integrate with WhatsApp Business API
    console.log('📱 WhatsApp Notification Sent:')
    console.log(`   To: ${memberName} (${memberID})`)
    console.log(`   Link: ${chatLink}`)
    console.log(`   Time: ${new Date().toISOString()}`)
    
    // Simulate API delay
    setTimeout(() => {
      res.json({
        success: true,
        message: 'WhatsApp notification sent successfully',
        data: {
          memberName,
          memberID,
          chatLink,
          sentAt: new Date().toISOString(),
          status: 'delivered'
        }
      })
    }, 1000) // 1 second delay to simulate real API call
    
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp notification',
      error: error.message
    })
  }
})

// Get notification history (for admin purposes)
router.get('/history', (req, res) => {
  try {
    // In a real implementation, this would fetch from database
    const notifications = [
      {
        id: 1,
        memberName: 'John Doe',
        memberID: 'PS101',
        chatLink: 'https://example.com/chat/PS101',
        sentAt: new Date().toISOString(),
        status: 'delivered'
      }
    ]
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      message: 'Notification history retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching notification history:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Call management endpoints
router.post('/make-call', (req, res) => {
  try {
    const { to, memberName, memberID } = req.body
    
    // Validate required fields
    if (!to || !memberName || !memberID) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, memberName, memberID',
        error: 'MISSING_FIELDS'
      })
    }
    
    // Simulate call initiation
    // In a real implementation, you would integrate with Twilio or similar service
    console.log('📞 Call Initiated:')
    console.log(`   To: ${memberName} (${memberID})`)
    console.log(`   Phone: ${to}`)
    console.log(`   Time: ${new Date().toISOString()}`)
    
    const callSid = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    res.json({
      success: true,
      message: 'Call initiated successfully',
      data: {
        callSid,
        memberName,
        memberID,
        phone: to,
        status: 'initiated',
        initiatedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error making call:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to initiate call',
      error: error.message
    })
  }
})

router.post('/end-call', (req, res) => {
  try {
    const { callSid } = req.body
    
    if (!callSid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: callSid',
        error: 'MISSING_FIELDS'
      })
    }
    
    // Simulate call ending
    console.log('📞 Call Ended:')
    console.log(`   Call SID: ${callSid}`)
    console.log(`   Time: ${new Date().toISOString()}`)
    
    res.json({
      success: true,
      message: 'Call ended successfully',
      data: {
        callSid,
        status: 'ended',
        endedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error ending call:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to end call',
      error: error.message
    })
  }
})

router.get('/call-status/:callSid', (req, res) => {
  try {
    const { callSid } = req.params
    
    // Simulate call status check
    // In a real implementation, you would check with Twilio
    res.json({
      success: true,
      data: {
        callSid,
        status: 'completed', // or 'ringing', 'in-progress', 'completed', 'failed'
        duration: 120, // in seconds
        startedAt: new Date(Date.now() - 120000).toISOString(),
        endedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error checking call status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check call status',
      error: error.message
    })
  }
})

module.exports = router
