const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// CORS headers to prevent CORS errors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Simple server is running' });
});

// User lookup endpoint (simplified)
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // Return demo user data based on User ID
    const userData = {
        'PS101': {
            'UserID': 'PS101',
            'Name': 'Tejaswini',
            'Email': 'tejaswini@gmail.com',
            'Phone': '8431382513',
            'WhatsApp Link': 'https://wa.me/qr/YSRQCK4VTLARI1',
            'Private Call': 'https://call.me/tejaswini',
            'Chat Link': 'https://chat.me/tejaswini',
            'Car Number': 'KA01AB1234',
            'Referral ID': 'REF001',
            'Company/LinkedIn Link': 'https://linkedin.com/in/tejaswini'
        },
        'PS102': {
            'UserID': 'PS102',
            'Name': 'Channabasava',
            'Email': 'harsha@gmail.com',
            'Phone': '9008007267',
            'WhatsApp Link': 'https://wa.me/919876501234',
            'Private Call': 'https://call.me/harsha',
            'Chat Link': 'https://chat.me/harsha',
            'Car Number': 'KA41A8093',
            'Referral ID': 'REF002',
            'Company/LinkedIn Link': 'https://linkedin.com/in/channabasava'
        },
        'PS103': {
            'UserID': 'PS103',
            'Name': 'Asha',
            'Email': 'asha@gmail.com',
            'Phone': '9876512345',
            'WhatsApp Link': 'https://wa.me/919876512345',
            'Private Call': 'https://call.me/asha',
            'Chat Link': 'https://chat.me/asha',
            'Car Number': 'KA03EF9012',
            'Referral ID': 'REF003',
            'Company/LinkedIn Link': 'https://linkedin.com/in/asha'
        }
    };
    
    if (userData[userId]) {
        const user = userData[userId];
        res.json({
            success: true,
            name: user.Name,
            carNumber: user['Car Number'] || '',
            whatsapp: user['WhatsApp Link'] || '',
            privateCall: user['Private Call'] || '',
            chatLink: user['Chat Link'] || '',
            phone: user.Phone || ''
        });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

// Telephony endpoints (mock responses)
app.post('/api/make-call', (req, res) => {
    res.json({ success: true, callSid: 'demo-call-' + Date.now() });
});

app.post('/api/end-call', (req, res) => {
    res.json({ success: true, message: 'Call ended' });
});

app.get('/api/call-status/:callSid', (req, res) => {
    res.json({ status: 'completed' });
});

// Serve Smart_Connect.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Smart_Connect.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Your website is ready!`);
    console.log(`✨ Tailwind CSS is working perfectly!`);
    console.log(`🔧 API endpoints available for chatbot functionality`);
});
