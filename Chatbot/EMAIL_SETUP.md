# Email Approval System Setup Guide

## Overview
The new signup system now requires email approval before users are added to the CSV file. When a new user signs up, an approval email is sent to the office email (chenna85@gmail.com).

## Setup Requirements

### 1. Install Dependencies
```bash
npm install nodemailer
```

### 2. Environment Variables
Add these to your `.env` file:

```env
# Email Configuration for Gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
BASE_URL=https://yourdomain.com
```

### 3. Gmail App Password Setup
Since Gmail requires 2FA for app passwords:

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings > Security
3. Generate an App Password for "Mail"
4. Use this 16-character password as `EMAIL_PASS`

## How It Works

### 1. User Signup Flow
1. User fills out signup form
2. Data is stored in `pending-signups.json` (NOT in CSV)
3. Approval email sent to office email (chenna85@gmail.com)
4. User sees "pending approval" message

### 2. Office Approval Process
1. Office receives email with user details
2. Click "Approve User" button in email
3. User is automatically added to CSV with User ID
4. User receives approval confirmation email
5. User can now access system with their User ID

### 3. Rejection Process
1. Office can click "Reject User" button
2. User receives rejection notification
3. Signup request is removed from pending list

## Files Created/Modified

- `pending-signups.json` - Stores pending signup requests
- `admin-pending-signups.html` - Admin panel to view/manage pending signups
- `server.js` - Updated with approval system APIs
- `signup.html` - Updated to show pending status
- `Smart_Connect.html` - Added admin panel link

## API Endpoints

- `POST /api/signup` - Submit signup (now stores in pending)
- `GET /api/approve-signup/:id` - Approve user (adds to CSV)
- `GET /api/reject-signup/:id` - Reject user (removes from pending)
- `GET /api/pending-signups` - View all pending signups

## Admin Access
Access the admin panel at: `/admin-pending-signups.html`

## Security Notes
- Only office email (chenna85@gmail.com) receives approval emails
- Pending signups are stored locally, not in public CSV
- Users cannot access system until approved

## Troubleshooting

### Email Not Sending
1. Check Gmail credentials in `.env`
2. Ensure 2FA is enabled and app password is correct
3. Check server logs for email errors

### Pending Signups Not Loading
1. Check if `pending-signups.json` exists
2. Verify file permissions
3. Check server logs for errors

## Testing
1. Start server: `npm start`
2. Go to signup page and submit a test signup
3. Check if approval email is sent to chenna85@gmail.com
4. Test approval/rejection process
5. Verify user appears in CSV after approval
