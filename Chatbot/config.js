// Configuration file for custom domain and environment settings
module.exports = {
    // Custom Domain Configuration
    CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN || 'startupmysore.com',
    BASE_URL: process.env.BASE_URL || 'https://startupmysore.com',
    
    // Server Configuration
    PORT: process.env.PORT || 3000,
    
    // Twilio Configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
    
    WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN || '',
    WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || '',
    WHATSAPP_BUSINESS_ID: process.env.WHATSAPP_BUSINESS_ID || ''
};

