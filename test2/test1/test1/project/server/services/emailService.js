// emailServices.js
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const FRONTEND_DOMAIN = 'https://my-travel-app-client.onrender.com';

// Read env (prefer explicit SMTP_* names)
const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const smtpPort = Number(process.env.SMTP_PORT || 2525);
const smtpSecure = (process.env.SMTP_SECURE === 'true'); // false for 587
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

// create transporter for SMTP
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,         // false for 587 (STARTTLS)
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  family: 4,                  // force IPv4 (fixes many cloud DNS/IPv6 issues)
  logger: true,
  debug: true,
  connectionTimeout: 20000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  tls: {
    rejectUnauthorized: false
  }
});

// quick verify at startup so logs show connectivity
transporter.verify()
  .then(() => console.log('✅ SMTP transporter verified — ready to send'))
  .catch(err => {
    console.error('❌ SMTP verify failed (check SMTP_HOST/USER/PASS or port). Error:', err && err.message ? err.message : err);
  });

// --- Brevo REST fallback (optional) ---
const BREVO_API_KEY = process.env.BREVO_API_KEY; // create this in Brevo if you want REST fallback
async function sendBrevoViaApi(to, subject, html) {
  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY not set for REST fallback');
  const url = 'https://api.brevo.com/v3/smtp/email';
  const data = {
    sender: { name: 'Azure Journeys', email: emailFrom },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
  const res = await axios.post(url, data, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    timeout: 20000
  });
  return res.data;
}

// Helper to send via SMTP then fallback
async function sendMailSafe(mailOptions) {
  try { 
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP to', mailOptions.to);
  } catch (smtpErr) {
    console.error('⚠️ SMTP send failed:', smtpErr && smtpErr.message ? smtpErr.message : smtpErr);
    // fallback to Brevo API if available
    try {
      if (BREVO_API_KEY) {
        await sendBrevoViaApi(mailOptions.to, mailOptions.subject, mailOptions.html || mailOptions.text);
        console.log('✅ Email sent via Brevo REST API fallback to', mailOptions.to);
      } else {
        throw smtpErr;
      }
    } catch (apiErr) {
      console.error('❌ Brevo REST fallback failed:', apiErr && apiErr.message ? apiErr.message : apiErr);
      throw apiErr;
    }
  }
}

// Helper to format tourist spots
const createSpotsListHtml = (spotNames) => {
  if (!spotNames || spotNames.length === 0) return '';
  const listItems = spotNames.map(name => `<li>${name}</li>`).join('');
  return `
      <li style="margin-bottom: 5px;">
          <strong>Selected Tourist Spots:</strong>
          <ul style="margin-top: 5px; padding-left: 20px; list-style-type: disc;">
              ${listItems}
          </ul>
      </li>
  `;
};

// --- EMAIL FUNCTIONS ---
export const sendBookingConfirmation = async (user, bookingDetails) => {
  console.log(`Sending booking email to ${user.email}...`);
  const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
  const mailOptions = {
    from: emailFrom,
    to: user.email,
    subject: 'Your Azure Journeys Trip is Confirmed!',
    html: `
      <h1>Hi ${bookingDetails.customerName},</h1>
      <p>Your trip has been successfully booked!</p>
      <ul>
        <li><strong>Route:</strong> ${bookingDetails.from} to ${bookingDetails.to}</li>
        <li><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
        <li><strong>Total Cost:</strong> ₹${bookingDetails.totalCost}</li>
        <li><strong>Driver:</strong> ${bookingDetails.driverName}</li>
        ${spotListHtml}
      </ul>
    `
  };

  try {
    await sendMailSafe(mailOptions);
  } catch (err) {
    console.error('❌ Booking email failed permanently:', err && err.message ? err.message : err);
  }
};

export const sendDriverAssignment = async (driver, bookingDetails) => {
  const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
  const mailOptions = {
    from: emailFrom,
    to: driver.email,
    subject: 'New Trip Assigned to You!',
    html: `
      <h1>Hello ${driver.name},</h1>
      <p>New trip assignment:</p>
      <ul>
        <li><strong>Customer:</strong> ${bookingDetails.customerName}</li>
        <li><strong>Pickup:</strong> ${bookingDetails.driverPickupLocation || 'Not specified'}</li>
        <li><strong>Route:</strong> ${bookingDetails.from} to ${bookingDetails.to}</li>
        <li><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
        ${spotListHtml}
      </ul>
    `
  };
  try { await sendMailSafe(mailOptions); } catch (err) { console.error('❌ Failed to send driver email:', err.message || err); }
};

export const sendGuideAssignment = async (guide, bookingDetails) => {
  const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
  const mailOptions = {
    from: emailFrom,
    to: guide.email,
    subject: 'New Guide Assignment!',
    html: `
      <h1>Hello ${guide.name},</h1>
      <p>New guide assignment:</p>
      <ul>
        <li><strong>Customer:</strong> ${bookingDetails.customerName}</li>
        <li><strong>Pickup:</strong> ${bookingDetails.guidePickupLocation || 'Not specified'}</li>
        <li><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
        ${spotListHtml}
      </ul>
    `
  };
  try { await sendMailSafe(mailOptions); } catch (err) { console.error('❌ Failed to send guide email:', err.message || err); }
};

export const sendRegistrationEmail = async (user) => {
  console.log(`Sending registration email to ${user.email}...`);
  const mailOptions = {
    from: emailFrom,
    to: user.email,
    subject: 'Welcome to Azure Journeys!',
    html: `<h1>Hello ${user.name}!</h1><p>Welcome to Azure Journeys.</p>`
  };
  try { await sendMailSafe(mailOptions); } catch (err) { console.error(`❌ Registration email failed:`, err.message || err); }
};

export const sendContactMessage = async (formData) => {
  const mailOptions = {
    from: emailFrom,
    to: emailFrom,
    replyTo: formData.email,
    subject: `[Contact Form] ${formData.subject || 'General'}`,
    html: `<h3>From: ${formData.name} (${formData.email})</h3><p>${formData.message}</p>`
  };
  try { await sendMailSafe(mailOptions); } catch (err) { console.error('❌ Contact form email failed:', err.message || err); throw err; }
};

export const sendPasswordResetLink = async (user, token) => {
  const resetUrl = `${FRONTEND_DOMAIN}/#/reset-password?token=${token}&email=${user.email}`;
  const mailOptions = {
    from: emailFrom,
    to: user.email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset.</p><a href="${resetUrl}">Reset Password</a>`
  };
  try { await sendMailSafe(mailOptions); } catch (err) { console.error('❌ Failed to send reset link:', err.message || err); }
};
