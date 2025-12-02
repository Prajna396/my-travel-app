// server/services/emailServices.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import axios from 'axios';
import Booking from '../models/Booking.js'; // <--- adjust path if needed

dotenv.config();

// --- CONFIG FROM ENV ---
const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 2525);
const SMTP_SECURE = (process.env.SMTP_SECURE === 'true'); // usually false for 2525/587 (STARTTLS)
const SMTP_USER = process.env.SMTP_USER; // e.g. 9cfffe001@smtp-brevo.com
const SMTP_PASS = process.env.SMTP_PASS; // Brevo SMTP key
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || process.env.EMAIL_USER; // verified sender
const BREVO_API_KEY = process.env.BREVO_API_KEY || null; // optional REST fallback

// --- Create transporter ---
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  family: 4, // force IPv4 (fixes many cloud DNS/IPv6 issues)
  logger: true,
  debug: true,
  connectionTimeout: 20000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  tls: { rejectUnauthorized: false }
});

// Verify transporter at startup (non-blocking)
transporter.verify()
  .then(() => console.log('✅ SMTP transporter verified — ready to send'))
  .catch(err => {
    console.warn('⚠️ SMTP verify failed (check SMTP_HOST/USER/PASS/PORT):', err && err.message ? err.message : err);
  });

// --- Helper: Brevo REST fallback ---
async function sendBrevoViaApi(to, subject, html, from = EMAIL_FROM) {
  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY not set for REST fallback');
  const url = 'https://api.brevo.com/v3/smtp/email';
  const payload = {
    sender: { name: 'Azure Journeys', email: from },
    to: [{ email: to }],
    subject,
    htmlContent: html
  };
  const res = await axios.post(url, payload, {
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': BREVO_API_KEY },
    timeout: 20000
  });
  return res.data;
}

// --- Safe send wrapper: SMTP then optional REST fallback ---
async function sendMailSafe(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP to', mailOptions.to);
    return info;
  } catch (smtpErr) {
    console.error('⚠️ SMTP send failed:', smtpErr && smtpErr.message ? smtpErr.message : smtpErr);
    if (BREVO_API_KEY) {
      try {
        const apiRes = await sendBrevoViaApi(mailOptions.to, mailOptions.subject, mailOptions.html, mailOptions.from);
        console.log('✅ Email sent via Brevo REST API fallback to', mailOptions.to);
        return apiRes;
      } catch (apiErr) {
        console.error('❌ Brevo REST fallback failed:', apiErr && apiErr.message ? apiErr.message : apiErr);
        throw apiErr;
      }
    }
    throw smtpErr;
  }
}

// --- Helper to format tourist spots into HTML ---
const createSpotsListHtml = (spotNames) => {
  if (!spotNames || !Array.isArray(spotNames) || spotNames.length === 0) return '';
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

// -----------------------------
// EMAIL FUNCTIONS
// -----------------------------

/**
 * sendBookingConfirmation
 * - Accepts either:
 *    a) full booking object (bookingDetails), or
 *    b) booking id string OR { id: bookingId }
 * - If driverName/guideName/vehicleNumber are missing -> tries to fetch booking from DB
 *
 * Usage:
 *  await sendBookingConfirmation({ email: customerEmail }, bookingObject);
 *  OR
 *  await sendBookingConfirmation({ email: customerEmail }, bookingIdString);
 */
export const sendBookingConfirmation = async (user, bookingDetailsOrId) => {
  try {
    // Normalize input
    let booking = bookingDetailsOrId;

    // If caller passed a string or { id: ... }, fetch booking by id
    if (typeof bookingDetailsOrId === 'string' || (bookingDetailsOrId && bookingDetailsOrId.id)) {
      const id = typeof bookingDetailsOrId === 'string' ? bookingDetailsOrId : bookingDetailsOrId.id;
      try {
        booking = await Booking.findById(id).lean();
        if (!booking) {
          console.warn('sendBookingConfirmation: booking not found for id=', id);
          booking = bookingDetailsOrId; // fallback
        }
      } catch (err) {
        console.warn('sendBookingConfirmation: DB fetch failed for id=', id, err && err.message ? err.message : err);
      }
    }

    // If we have a booking object but it's missing fields, try a DB fetch using _id
    if (booking && (!booking.driverName || !booking.guideName || !booking.vehicleNumber) && booking._id) {
      try {
        const dbBooking = await Booking.findById(booking._id).lean();
        if (dbBooking) booking = { ...dbBooking, ...booking }; // db fills missing fields
      } catch (err) {
        console.warn('sendBookingConfirmation: second DB fetch failed for _id=', booking._id, err && err.message ? err.message : err);
      }
    }

    // Final fallbacks for display
    const customerName = booking?.customerName || user?.name || user?.email || 'Traveler';
    const route = booking?.route || 'N/A';
    const date = booking?.date || 'N/A';
    const time = booking?.time || 'N/A';
    const totalCost = (booking?.totalCost !== undefined && booking?.totalCost !== null) ? booking.totalCost : 'N/A';
    const driverName = booking?.driverName || 'Not assigned yet';
    const guideName = booking?.guideName || 'Not assigned yet';
    const vehicleNumber = booking?.vehicleNumber || 'Not assigned yet';
    const selectedSpotNames = booking?.selectedSpots || booking?.selectedSpotNames || [];

    const spotListHtml = createSpotsListHtml(selectedSpotNames);

    const mailOptions = {
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Your Azure Journeys Trip is Confirmed!',
      html: `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
          <h1 style="font-size:24px;">Hi ${customerName},</h1>
          <p>Your trip has been successfully booked!</p>
          <ul>
            <li><strong>Route:</strong> ${route}</li>
            <li><strong>Date:</strong> ${date} at ${time}</li>
            <li><strong>Total Cost:</strong> ₹${totalCost}</li>

            <li><strong>Driver:</strong> ${driverName}</li>
            <li><strong>Guide:</strong> ${guideName}</li>
            <li><strong>Vehicle Number:</strong> ${vehicleNumber}</li>

            ${spotListHtml}
          </ul>
          <p style="font-size:13px; color:#666;">If you have any questions reply to this email or contact our support.</p>
        </div>
      `
    };

    const info = await sendMailSafe(mailOptions);
    return info;
  } catch (err) {
    console.error('❌ Booking email failed permanently:', err && err.message ? err.message : err);
    throw err;
  }
};

export const sendDriverAssignment = async (driver, bookingDetailsOrId) => {
  try {
    // same defensive pattern: try to fetch booking if passed id
    let booking = bookingDetailsOrId;
    if (typeof bookingDetailsOrId === 'string' || (bookingDetailsOrId && bookingDetailsOrId.id)) {
      const id = typeof bookingDetailsOrId === 'string' ? bookingDetailsOrId : bookingDetailsOrId.id;
      booking = await Booking.findById(id).lean();
    }

    const spotListHtml = createSpotsListHtml(booking?.selectedSpots || []);
    const mailOptions = {
      from: EMAIL_FROM,
      to: driver.email,
      subject: 'New Trip Assigned to You!',
      html: `
        <h2>Hello ${driver.name || 'Driver'},</h2>
        <p>New trip assignment:</p>
        <ul>
          <li><strong>Customer:</strong> ${booking?.customerName || 'N/A'}</li>
          <li><strong>Pickup:</strong> ${booking?.driverPickupLocation || 'Not specified'}</li>
          <li><strong>Route:</strong> ${booking?.route || 'N/A'}</li>
          <li><strong>Date:</strong> ${booking?.date || 'N/A'} at ${booking?.time || 'N/A'}</li>
          <li><strong>Vehicle Number:</strong> ${booking?.vehicleNumber || 'N/A'}</li>
          ${spotListHtml}
        </ul>
      `
    };
    await sendMailSafe(mailOptions);
    console.log('✅ Driver email sent to', driver.email);
  } catch (err) {
    console.error('❌ Failed to send driver email:', err && err.message ? err.message : err);
  }
};

export const sendGuideAssignment = async (guide, bookingDetailsOrId) => {
  try {
    let booking = bookingDetailsOrId;
    if (typeof bookingDetailsOrId === 'string' || (bookingDetailsOrId && bookingDetailsOrId.id)) {
      const id = typeof bookingDetailsOrId === 'string' ? bookingDetailsOrId : bookingDetailsOrId.id;
      booking = await Booking.findById(id).lean();
    }

    const spotListHtml = createSpotsListHtml(booking?.selectedSpots || []);
    const mailOptions = {
      from: EMAIL_FROM,
      to: guide.email,
      subject: 'New Guide Assignment!',
      html: `
        <h2>Hello ${guide.name || 'Guide'},</h2>
        <p>New guide assignment:</p>
        <ul>
          <li><strong>Customer:</strong> ${booking?.customerName || 'N/A'}</li>
          <li><strong>Pickup:</strong> ${booking?.guidePickupLocation || 'Not specified'}</li>
          <li><strong>Date:</strong> ${booking?.date || 'N/A'} at ${booking?.time || 'N/A'}</li>
          <li><strong>Vehicle Number:</strong> ${booking?.vehicleNumber || 'N/A'}</li>
          ${spotListHtml}
        </ul>
      `
    };
    await sendMailSafe(mailOptions);
    console.log('✅ Guide email sent to', guide.email);
  } catch (err) {
    console.error('❌ Failed to send guide email:', err && err.message ? err.message : err);
  }
};

export const sendRegistrationEmail = async (user) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Azure Journeys!',
      html: `<h1>Hello ${user.name || 'there'}!</h1><p>Welcome to Azure Journeys. We are excited to have you.</p>`
    };
    await sendMailSafe(mailOptions);
  } catch (err) {
    console.error('❌ Registration email failed:', err && err.message ? err.message : err);
  }
};

export const sendContactMessage = async (formData) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_FROM,
      replyTo: formData.email,
      subject: `[Contact Form] ${formData.subject || 'General'}`,
      html: `<h3>From: ${formData.name} (${formData.email})</h3><p>${formData.message}</p>`
    };
    await sendMailSafe(mailOptions);
  } catch (err) {
    console.error('❌ Contact form email failed:', err && err.message ? err.message : err);
    throw err;
  }
};

export const sendPasswordResetLink = async (user, token) => {
  try {
    const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'https://my-travel-app-client.onrender.com';
    const resetUrl = `${FRONTEND_DOMAIN}/#/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    const mailOptions = {
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset Password</a></p>`
    };
    await sendMailSafe(mailOptions);
  } catch (err) {
    console.error('❌ Failed to send reset link:', err && err.message ? err.message : err);
  }
};
