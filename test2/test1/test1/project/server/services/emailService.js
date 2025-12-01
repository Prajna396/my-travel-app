import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_DOMAIN = 'https://my-travel-app-client.onrender.com';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Explicitly say Gmail
    port: 587,              // This is the standard "Submission" port (safest for cloud)
    secure: false,          // True is for port 465, false is for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },          // Show SMTP traffic
});

// Helper function to format tourist spots
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
        const mailOptions = {
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
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Booking email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send booking email:`, error.message);
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
        console.log(`✅ Driver email sent`);
    } catch (error) {
        console.error("❌ Failed to send driver email:", error.message);
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
        console.log(`✅ Guide email sent`);
    } catch (error) {
        console.error("❌ Failed to send guide email:", error.message);
    }
};

export const sendRegistrationEmail = async (user) => {
    console.log(`Sending registration email to ${user.email}...`);
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
        console.log(`✅ Registration email sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send registration email:`, error.message);
    }
};

export const sendContactMessage = async (formData) => {
    try {
        const mailOptions = {
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            replyTo: formData.email,
            to: process.env.EMAIL_USER,
            subject: `[Contact Form] ${formData.subject || 'General'}`,
            html: `
                <h3>From: ${formData.name} (${formData.email})</h3>
                <p>${formData.message}</p>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("❌ Contact form email failed:", error.message);
        throw error;
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
                <a href="${resetUrl}">Reset Password</a>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset link sent`);
    } catch (error) {
        console.error(`❌ Failed to send reset link:`, error.message);
    }
};