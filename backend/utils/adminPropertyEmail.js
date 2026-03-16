const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'villagecounty2025@gmail.com',
    pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || 'Startup@12345'
  }
})

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'villagecounty2025@gmail.com'
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:5173'

/**
 * Send email to website owner when a host submits a new property (pending approval).
 * Email includes link to Admin Panel to approve, reject, or edit.
 */
function sendNewPropertyEmailToAdmin(property) {
  const adminPanelLink = `${FRONTEND_URL.replace(/\/$/, '')}/admin-properties`
  const subject = 'New Property Submitted – Approval Required'
  const html = `
    <h2>New property submitted</h2>
    <p>A host has submitted a property and it is waiting for your approval.</p>
    <table style="border-collapse: collapse; margin: 1rem 0;">
      <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><strong>Title</strong></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${(property.title || '').replace(/</g, '&lt;')}</td></tr>
      <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><strong>Location</strong></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${(property.location || '').replace(/</g, '&lt;')}</td></tr>
      <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><strong>Price</strong></td><td style="padding: 6px 12px; border: 1px solid #ddd;">₹${Number(property.price) || 0}</td></tr>
      <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><strong>Contact</strong></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${(property.contactInfo || '').replace(/</g, '&lt;')}</td></tr>
    </table>
    <p>Only you (the website owner) can approve, reject, or edit this listing.</p>
    <p>
      <a href="${adminPanelLink}" style="display: inline-block; padding: 10px 20px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 6px; margin-right: 8px;">Open Admin Panel</a>
    </p>
    <p style="color: #666; font-size: 12px;">In the admin panel you can approve, reject, or edit the property details before publishing.</p>
  `
  return transporter.sendMail({
    from: process.env.EMAIL_USER || 'villagecounty2025@gmail.com',
    to: ADMIN_EMAIL,
    subject,
    html
  })
}

module.exports = { sendNewPropertyEmailToAdmin }
