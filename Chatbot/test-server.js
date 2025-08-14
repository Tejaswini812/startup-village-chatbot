const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// WhatsApp test route
app.post('/api/send-whatsapp', (req, res) => {
    console.log('WhatsApp route hit with body:', req.body);
    res.json({ 
        success: true, 
        message: 'WhatsApp route is working',
        received: req.body
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🧪 Test server running on port ${PORT}`);
    console.log(`✅ Test route: http://localhost:${PORT}/api/test`);
    console.log(`✅ WhatsApp route: POST http://localhost:${PORT}/api/send-whatsapp`);
});
