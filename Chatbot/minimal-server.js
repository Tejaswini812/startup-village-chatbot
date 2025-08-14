const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// WhatsApp route
app.post('/api/send-whatsapp', (req, res) => {
    console.log('WhatsApp route accessed');
    res.json({ success: true, message: 'WhatsApp route working' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Minimal server running on port ${PORT}`);
    console.log(`✅ Test: http://localhost:${PORT}/`);
    console.log(`✅ WhatsApp: POST http://localhost:${PORT}/api/send-whatsapp`);
});
