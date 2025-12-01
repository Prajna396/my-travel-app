import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// --- MANUAL GMAIL CONFIGURATION (Port 587 + IPv4) ---
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  // Manually specify host
    port: 587,               // Use the Standard Submission Port
    secure: false,           // Must be FALSE for Port 587 (it upgrades via STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // NETWORK STABILITY SETTINGS
    family: 4,               // Force IPv4 (Fixes Render timeouts)
    connectionTimeout: 10000, // Fail after 10s (Don't hang forever)
    greetingTimeout: 5000,    // Wait max 5s for server greeting
    debug: true,              // Show us exactly what happens
    logger: true              // Log the conversation
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Startup Connection Test Failed:", error);
    } else {
        console.log("✅ Ready to send emails (Connected to Gmail on Port 587)");
    }
});

// Helper to format spots
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
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        await transporter.sendMail({
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
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
        console.log(`✅ Booking email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Booking email failed:`, error.message);
    }
};

export const sendDriverAssignment = async (driver, bookingDetails) => {
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        await transporter.sendMail({
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
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
        console.error("❌ Failed to send driver email:", error.message);
    }
};

export const sendGuideAssignment = async (guide, bookingDetails) => {
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        await transporter.sendMail({
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
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
        console.error("❌ Failed to send guide email:", error.message);
    }
};

export const sendRegistrationEmail = async (user) => {
    console.log(`Sending registration email to ${user.email}...`);
    try {
        await transporter.sendMail({
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to Azure Journeys!',
            html: `<h1>Hello ${user.name}!</h1><p>Welcome to Azure Journeys.</p>`
        });
        console.log(`✅ Registration email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Registration email failed:`, error.message);
    }
};

export const sendContactMessage = async (formData) => {
    try {
        await transporter.sendMail({
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to Admin
            replyTo: formData.email,
            subject: `[Contact Form] ${formData.subject || 'General'}`,
            html: `
                <h3>From: ${formData.name} (${formData.email})</h3>
                <p>${formData.message}</p>
            `
        });
        console.log(`✅ Contact message sent`);
    } catch (error) {
        console.error("❌ Contact form email failed:", error.message);
    }
};

export const sendPasswordResetLink = async (user, token) => {
    try {
        const resetUrl = `${FRONTEND_DOMAIN}/#/reset-password?token=${token}&email=${user.email}`;
        await transporter.sendMail({
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset.</p>
                <a href="${resetUrl}">Reset Password</a>
            `
        });
        console.log(`✅ Password reset link sent`);
    } catch (error) {
        console.error(`❌ Failed to send reset link:`, error.message);
    }
};