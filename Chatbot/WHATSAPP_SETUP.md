# 🚀 WhatsApp Business API Setup Guide

## 📋 Prerequisites
- ✅ Your number **7676558020** is already verified for WhatsApp Business
- ✅ Node.js server with Express.js
- ✅ Axios package installed

## 🔑 Required Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
WHATSAPP_PHONE_ID=your_whatsapp_phone_id_here
WHATSAPP_BUSINESS_ID=your_whatsapp_business_id_here
```

## 📱 How to Get WhatsApp Credentials

### Step 1: Access Meta Developer Console
1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Create a new app or use existing one

### Step 2: Add WhatsApp Product
1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. Follow the setup wizard

### Step 3: Get Your Credentials
1. Go to **WhatsApp > Getting Started**
2. Copy the **Phone Number ID** (this is your `WHATSAPP_PHONE_ID`)
3. Copy the **Access Token** (this is your `WHATSAPP_API_TOKEN`)
4. Note your **Business Account ID** (this is your `WHATSAPP_BUSINESS_ID`)

### Step 4: Configure Webhook (Optional)
1. Go to **WhatsApp > Configuration**
2. Set webhook URL: `https://yourdomain.com/api/webhook`
3. Verify webhook token

## 🧪 Testing the Integration

### Test 1: Check Server Status
```bash
npm start
```
Look for: `💬 WhatsApp Business API ready`

### Test 2: Send Test Message
1. Open your chatbot
2. Search for a user ID
3. Click "Private Chat"
4. Enter a test phone number
5. Click "Send WhatsApp"

### Test 3: Check Console Logs
Look for:
```
Sending WhatsApp notification to 919876543210 for member 123
WhatsApp message sent successfully: {...}
```

## 🔧 Troubleshooting

### Error: "WhatsApp Business API not configured"
- Check your `.env` file has the correct variables
- Restart your server after adding environment variables

### Error: "WhatsApp API Error: Invalid phone number"
- Ensure phone number format: `9876543210` or `+919876543210`
- Phone number must be registered on WhatsApp

### Error: "Permission denied"
- Check your WhatsApp Business account status
- Ensure your app is approved for messaging

## 💰 Cost Information
- **Setup:** Free
- **Per message:** $0.0050 (very affordable)
- **Monthly free tier:** 1,000 conversations
- **Billing:** Monthly through Meta

## 🎯 What Happens Now

1. **Customer clicks "Private Chat"** → Chat window opens
2. **Office staff enters customer phone** → Phone number input
3. **Staff clicks "Send WhatsApp"** → API call to Meta
4. **Meta sends WhatsApp message** → From your number 7676558020
5. **Customer receives notification** → With chat link and details
6. **Customer clicks link** → Joins private chat

## 🚀 Next Steps

1. **Add environment variables** to your `.env` file
2. **Restart your server**
3. **Test with a real phone number**
4. **Monitor API usage** in Meta Developer Console

## 📞 Support

If you encounter issues:
1. Check Meta Developer Console for error details
2. Verify your WhatsApp Business account status
3. Ensure all environment variables are set correctly

---

**🎉 Congratulations!** You now have a fully automated WhatsApp notification system that sends messages from your verified business number 7676558020 to customers automatically!
