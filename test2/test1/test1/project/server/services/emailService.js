import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Use a verified sender email or the Resend testing email
// IMPORTANT: Until you verify your own domain, you MUST use 'onboarding@resend.dev'
const SENDER_EMAIL = 'onboarding@resend.dev'; 
const FRONTEND_DOMAIN = 'https://my-travel-app-client.onrender.com';

// Helper to format spots list
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

// --- EMAILS ---

export const sendBookingConfirmation = async (user, bookingDetails) => {
    console.log(`Sending booking email to ${user.email}...`);
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        const data = await resend.emails.send({
            from: SENDER_EMAIL,
            to: user.email,
            subject: 'Your Azure Journeys Trip is Confirmed!',
            html: `
                <h1>Hi ${bookingDetails.customerName},</h1>
                <p>Your trip has been successfully booked!</p>
                <ul>
                    <li><strong>Route:</strong> ${bookingDetails.from} to ${bookingDetails.to}</li>
                    <li><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
                    <li><strong>Total Cost:</strong> ₹${bookingDetails.totalCost}</li>
                    ${spotListHtml}
                </ul>
            `
        });
        console.log(`✅ Booking email sent:`, data);
    } catch (error) {
        console.error(`❌ Failed to send booking email:`, error);
    }
};

export const sendDriverAssignment = async (driver, bookingDetails) => {
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        await resend.emails.send({
            from: SENDER_EMAIL,
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
        });
        console.log(`✅ Driver email sent`);
    } catch (error) {
        console.error("❌ Failed to send driver email:", error);
    }
};

export const sendGuideAssignment = async (guide, bookingDetails) => {
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        await resend.emails.send({
            from: SENDER_EMAIL,
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
        });
        console.log(`✅ Guide email sent`);
    } catch (error) {
        console.error("❌ Failed to send guide email:", error);
    }
};

export const sendRegistrationEmail = async (user) => {
    console.log(`Sending registration email to ${user.email}...`);
    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: user.email,
            subject: 'Welcome to Azure Journeys!',
            html: `
                <h1>Hello, ${user.name}!</h1>
                <p>Thank you for registering with Azure Journeys as a ${user.role}.</p>
                <p>We're excited to have you on board.</p>
            `
        });
        console.log(`✅ Registration email sent successfully`);
    } catch (error) {
        console.error(`❌ Failed to send registration email:`, error);
    }
};

export const sendContactMessage = async (formData) => {
    try {
        // Note: For contact forms, we send TO ourselves (the admin)
        // You can set this to your personal email or use an environment variable
        const adminEmail = 'prajnasree396@gmail.com'; 
        
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: adminEmail, 
            reply_to: formData.email,
            subject: `[Contact Form] ${formData.subject || 'General'}`,
            html: `
                <h3>From: ${formData.name} (${formData.email})</h3>
                <p>${formData.message}</p>
            `
        });
        console.log(`✅ Contact message forwarded`);
    } catch (error) {
        console.error("❌ Contact form email failed:", error);
        throw error;
    }
};

export const sendPasswordResetLink = async (user, token) => {
    try {
        const resetUrl = `${FRONTEND_DOMAIN}/#/reset-password?token=${token}&email=${user.email}`;
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset.</p>
                <a href="${resetUrl}">Reset Password</a>
            `
        });
        console.log(`✅ Password reset link sent`);
    } catch (error) {
        console.error(`❌ Failed to send reset link:`, error);
    }
};