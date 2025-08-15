const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Domain configuration
const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || 'startupmysore.com';
const BASE_URL = process.env.BASE_URL || `https://${CUSTOM_DOMAIN}`;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// CSV path for backend (keep outside public for security)
const csvPath = path.join(__dirname, 'UserData.csv');

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
let client = null;

// Initialize Twilio only if credentials are set
if (TWILIO_ACCOUNT_SID.startsWith('AC') && TWILIO_AUTH_TOKEN) {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// WhatsApp Business API Configuration
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WHATSAPP_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ID || '';

// Store active calls
const activeCalls = new Map();

// ================== ROUTES ==================

// Root route -> Serve main dashboard
app.get('/', (req, res) => {
    // If custom domain is configured, redirect to it
    if (CUSTOM_DOMAIN !== 'startupmysore.com' || process.env.CUSTOM_DOMAIN) {
        return res.redirect(`${BASE_URL}/Smart_Connect.html`);
    }
    res.sendFile(path.join(__dirname, 'Smart_Connect.html'));
});

// Custom domain configuration route
app.get('/api/domain-config', (req, res) => {
    res.json({ 
        customDomain: CUSTOM_DOMAIN,
        baseUrl: BASE_URL,
        currentHost: req.get('host')
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Test WhatsApp API route
app.get('/api/test-whatsapp', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'WhatsApp API route is accessible',
        configured: {
            hasToken: !!WHATSAPP_API_TOKEN,
            hasPhoneId: !!WHATSAPP_PHONE_ID,
            hasBusinessId: !!WHATSAPP_BUSINESS_ID
        }
    });
});

// ================== TELEPHONY ROUTES ==================

app.post('/api/make-call', async (req, res) => {
    try {
        if (!client) {
            return res.status(500).json({ success: false, error: 'Twilio not configured.' });
        }

        const { to, memberID, callType = 'private' } = req.body;

        if (!to || !memberID) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: to, memberID'
            });
        }

        console.log(`Initiating ${callType} call to ${to} for member ${memberID}`);

        const twimlUrl = `${req.protocol}://${req.get('host')}/api/twiml/connect-call`;

        const call = await client.calls.create({
            to: to,
            from: TWILIO_PHONE_NUMBER,
            url: twimlUrl,
            method: 'POST',
            statusCallback: `${req.protocol}://${req.get('host')}/api/call-status-webhook`,
            statusCallbackMethod: 'POST',
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
        });

        activeCalls.set(call.sid, {
            callSid: call.sid,
            to: to,
            memberID: memberID,
            callType: callType,
            status: 'initiated',
            startTime: new Date(),
            endTime: null
        });

        res.json({
            success: true,
            callSid: call.sid,
            status: call.status,
            to: to,
            memberID: memberID
        });

    } catch (error) {
        console.error('Error making call:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to initiate call'
        });
    }
});

app.get('/api/call-status/:callSid', async (req, res) => {
    try {
        if (!client) {
            return res.status(500).json({ success: false, error: 'Twilio not configured.' });
        }

        const { callSid } = req.params;

        const localCall = activeCalls.get(callSid);
        if (localCall) {
            const call = await client.calls(callSid).fetch();

            localCall.status = call.status;
            if (call.status === 'completed' && !localCall.endTime) {
                localCall.endTime = new Date();
            }

            res.json({
                success: true,
                callSid: callSid,
                status: call.status,
                duration: call.duration,
                memberID: localCall.memberID
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Call not found'
            });
        }

    } catch (error) {
        console.error('Error fetching call status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch call status'
        });
    }
});

app.post('/api/end-call/:callSid', async (req, res) => {
    try {
        if (!client) {
            return res.status(500).json({ success: false, error: 'Twilio not configured.' });
        }

        const { callSid } = req.params;

        const call = await client.calls(callSid).update({ status: 'completed' });

        const localCall = activeCalls.get(callSid);
        if (localCall) {
            localCall.status = 'completed';
            localCall.endTime = new Date();
        }

        res.json({
            success: true,
            callSid: callSid,
            status: call.status
        });

    } catch (error) {
        console.error('Error ending call:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to end call'
        });
    }
});

app.post('/api/twiml/connect-call', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say({
        voice: 'alice',
        language: 'en-IN'
    }, 'Hello! You have received a private call through Cloud Shoppe Connect. Please hold while we connect you.');

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/api/call-status-webhook', (req, res) => {
    const { CallSid, CallStatus } = req.body;

    const localCall = activeCalls.get(CallSid);
    if (localCall) {
        localCall.status = CallStatus;
        if (CallStatus === 'completed' && !localCall.endTime) {
            localCall.endTime = new Date();
        }
    }

    res.status(200).send('OK');
});

app.get('/api/calls', (req, res) => {
    const calls = Array.from(activeCalls.values());
    res.json({
        success: true,
        activeCalls: calls.length,
        calls: calls
    });
});

// ================== USER ROUTES ==================

app.get('/api/user/:userId', (req, res) => {
    const userId = (req.params.userId || '').trim();
    const results = [];
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
            const normalized = {};
            for (const key in data) {
                normalized[key.trim()] = (data[key] || '').trim();
            }
            if (normalized.UserID && normalized.Name) results.push(normalized);
        })
        .on('end', () => {
            const user = results.find(u => (u.UserID || '').trim() === userId);
            if (user) {
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
        })
        .on('error', (err) => {
            res.status(500).json({ success: false, message: 'Could not access user data file.' });
        });
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, phone, carNumber, referral, companyLink } = req.body;

        if (!name || !email || !phone || !carNumber) {
            return res.status(400).json({ success: false, message: 'Name, email, phone, and car number are required fields.' });
        }

        const correctHeader = 'UserID,Name,Email,Phone,WhatsApp Link,Private Call,Chat Link,Car Number,Referral ID,Company/LinkedIn Link\n';
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, correctHeader);
        } else {
            let current = fs.readFileSync(csvPath, 'utf8').split('\n')[0];
            if (current.trim() !== correctHeader.trim()) {
                fs.writeFileSync(csvPath, correctHeader);
            }
        }

        let data = fs.readFileSync(csvPath, 'utf8').split('\n').filter(Boolean);
        let maxId = 100;
        for (let i = 1; i < data.length; i++) {
            let row = data[i].split(',');
            let idStr = row[0];
            // Extract number from PS101, PS102 format
            if (idStr.startsWith('PS')) {
                let num = parseInt(idStr.substring(2));
                if (!isNaN(num) && num > maxId) maxId = num;
            }
        }

        const newId = 'PS' + (maxId + 1);

        const newRow = [
            newId,
            name,
            email,
            phone,
            '', // WhatsApp Link - empty for manual CSV update
            '', // Private Call - empty for manual CSV update
            '', // Chat Link - empty for manual CSV update
            carNumber || '',
            referral || '',
            companyLink || ''
        ].map(x => (typeof x === 'string' && x.includes(',')) ? `"${x}"` : x).join(',');

        fs.appendFileSync(csvPath, '\n' + newRow);

        res.json({ success: true, message: 'Signup successful!', userId: newId });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// ================== WHATSAPP BUSINESS API ROUTES ==================

app.post('/api/send-whatsapp', async (req, res) => {
    try {
        // Check if WhatsApp API is configured
        if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_ID) {
            return res.status(500).json({ 
                success: false, 
                error: 'WhatsApp Business API not configured. Please add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_ID to your .env file.' 
            });
        }

        const { memberName, memberID, chatLink } = req.body;

        if (!memberName || !memberID || !chatLink) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: memberName, memberID, chatLink'
            });
        }

        console.log(`Processing WhatsApp notification for member ${memberID}: ${memberName}`);

        // Fetch customer phone number from CSV database
        const customerPhone = await new Promise((resolve, reject) => {
            let foundPhone = null;
            let hasError = false;

            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (data) => {
                    if (hasError) return;
                    
                    const normalized = {};
                    for (const key in data) {
                        normalized[key.trim()] = (data[key] || '').trim();
                    }
                    if (normalized.UserID && normalized.UserID === memberID) {
                        foundPhone = normalized.Phone;
                    }
                })
                .on('end', () => {
                    if (hasError) return;
                    resolve(foundPhone);
                })
                .on('error', (err) => {
                    hasError = true;
                    reject(err);
                });
        });

        if (!customerPhone) {
            return res.status(404).json({
                success: false,
                error: `Customer phone number not found for Member ID: ${memberID}`
            });
        }

        console.log(`Found phone number: ${customerPhone} for member ${memberID}`);

        // Format phone number (remove +91 if present, add 91 if not)
        let formattedPhone = customerPhone.replace(/^\+91/, '').replace(/^91/, '');
        if (!formattedPhone.startsWith('91')) {
            formattedPhone = '91' + formattedPhone;
        }

        console.log(`Sending WhatsApp notification to ${formattedPhone} for member ${memberID}`);

        // Create the message payload
        const messageData = {
            messaging_product: "whatsapp",
            to: formattedPhone,
            type: "text",
            text: {
                body: `🔔 *Startup Village Club - Private Chat Request* 🔔

👋 Hello! Someone from our team is trying to contact you privately.

🏢 *From:* Startup Village Club Office
👤 *Member:* ${memberName}
🆔 *Member ID:* ${memberID}
⏰ *Time:* ${new Date().toLocaleString()}
🌐 *Chat Link:* ${chatLink}

💬 Click the link above to start a private conversation with our team.

---
*Startup Village Club - Smart Connect System*`
            }
        };

        // Send message via WhatsApp Business API
        const response = await axios.post(
            `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
            messageData,
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('WhatsApp message sent successfully:', response.data);

        res.json({ 
            success: true, 
            messageId: response.data.messages[0].id,
            to: formattedPhone,
            memberID: memberID,
            customerPhone: customerPhone
        });

    } catch (error) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        
        // Handle specific WhatsApp API errors
        if (error.response?.data?.error) {
            const whatsappError = error.response.data.error;
            return res.status(400).json({
                success: false,
                error: `WhatsApp API Error: ${whatsappError.message}`,
                code: whatsappError.code,
                details: whatsappError.error_subcode
            });
        }

        res.status(500).json({ 
            success: false, 
            error: 'Failed to send WhatsApp message: ' + error.message 
        });
    }
});

// ================== ERROR HANDLERS ==================

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 fallback (important for Render/Netlify refresh issues)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Smart_Connect.html'));
});

// ================== START SERVER ==================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📞 Telephony API ready`);
    console.log(`💬 WhatsApp Business API ${WHATSAPP_API_TOKEN ? 'ready' : 'not configured'}`);
    console.log(`🔧 Make sure to configure your Twilio and WhatsApp credentials in .env file`);
});
