import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Ensure this matches your ACTUAL frontend URL on Render
const FRONTEND_DOMAIN = 'https://my-travel-app-client.onrender.com';

// --- FIXED TRANSPORTER ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,              // Use Port 465 (SSL) for better reliability on Render
    secure: true,           // True for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // NETWORK FIXES:
    family: 4,              // Force IPv4 to prevent ETIMEDOUT errors
    pool: true,             // Use pooled connections to prevent opening too many sockets
    maxConnections: 1,      // Limit concurrent connections to Gmail
    rateLimit: 5,           // Limit messages per second to avoid Gmail spam blocks
    tls: {
        rejectUnauthorized: false // Helps avoid some certificate issues in cloud
    }
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ CRITICAL EMAIL SERVICE ERROR:", error);
    } else {
        console.log("✅ Email Service is Ready (Connected to Gmail)");
    }
});

// Helper function to format tourist spots
const createSpotsListHtml = (spotNames) => {
    if (!spotNames || spotNames.length === 0) {
        return '';
    }
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
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        const mailOptions = {
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Your Azure Journeys Trip is Confirmed!',
            html: `
                <h1>Hi ${bookingDetails.customerName},</h1>
                <p>Your trip has been successfully booked!</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Route:</strong> ${bookingDetails.from} to ${bookingDetails.to}</li>
                    <li><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
                    <li><strong>Car:</strong> ${bookingDetails.selectedCar?.carModel || 'N/A'}</li>
                    <li><strong>Total Cost:</strong> ₹${bookingDetails.totalCost}</li>
                    ${spotListHtml}
                </ul>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Booking email sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send booking email to ${user.email}:`, error.message);
        // We catch the error so the server doesn't crash
    }
};

export const sendDriverAssignment = async (driver, bookingDetails) => {
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        const mailOptions = {
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
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Failed to send driver email:", error.message);
    }
};

export const sendGuideAssignment = async (guide, bookingDetails) => {
    try {
        const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);
        const mailOptions = {
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
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Failed to send guide email:", error.message);
    }
};

export const sendRegistrationEmail = async (user) => {
    try {
        const mailOptions = {
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to Azure Journeys!',
            html: `
                <h1>Hello, ${user.name}!</h1>
                <p>Thank you for registering with Azure Journeys as a ${user.role}.</p>
                <p>We're excited to have you on board.</p>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Registration email sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send registration email to ${user.email}:`, error.message);
    }
};

export const sendContactMessage = async (formData) => {
    try {
        const mailOptions = {
            from: formData.email, // This might be blocked by Gmail due to spoofing policies
            replyTo: formData.email, // Better practice
            to: process.env.EMAIL_USER,
            subject: `[Contact Form] ${formData.subject || 'General'}`,
            html: `
                <h3>From: ${formData.name} (${formData.email})</h3>
                <p>${formData.message}</p>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Contact form email failed:", error.message);
        throw error; // Rethrow so the frontend knows it failed
    }
};

export const sendPasswordResetLink = async (user, token) => {
    try {
        const resetUrl = `${FRONTEND_DOMAIN}/#/reset-password?token=${token}&email=${user.email}`;
        
        const mailOptions = {
            from: `"Azure Journeys" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset.</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you didn't request this, ignore this email.</p>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Password reset link sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send reset link to ${user.email}:`, error.message);
    }
};