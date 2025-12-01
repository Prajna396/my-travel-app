import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); 

const FRONTEND_DOMAIN = 'https://my-travel-app-client.onrender.com';

// --- UPDATED TRANSPORTER CONFIGURATION ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,              // Changed from 465 to 587
    secure: false,          // Must be false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Force IPv4 to prevent connection issues
    family: 4,
    // Add this to prevent certificate errors on some cloud servers
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Service Error:", error);
    } else {
        console.log("✅ Server is ready to take our messages");
    }
});
// -----------------------------------------

// ... (Keep the rest of your functions: createSpotsListHtml, sendBookingConfirmation, etc. EXACTLY as they were)
// Do not delete the rest of your file!

// Helper function to format the spot names into an HTML list
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

export const sendBookingConfirmation = async (user, bookingDetails) => {
    // ... (Keep your existing logic here)
    const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Azure Journeys Trip is Confirmed!',
        html: `
            <h1>Hi ${bookingDetails.customerName},</h1>
            <p>Your trip has been successfully booked with Azure Journeys!</p>
            <p>Here are your booking details:</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 5px;"><strong>Route:</strong> ${bookingDetails.from} to ${bookingDetails.to}</li>
                <li style="margin-bottom: 5px;"><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
                <li style="margin-bottom: 5px;"><strong>Passengers:</strong> ${bookingDetails.passengers}</li>
                <li style="margin-bottom: 5px;"><strong>Car:</strong> ${bookingDetails.selectedCar?.carModel} (${bookingDetails.selectedCar?.carNumber})</li>
                <li style="margin-bottom: 5px;"><strong>Driver:</strong> ${bookingDetails.selectedCar?.name}</li>
                <li style="margin-bottom: 5px;"><strong>Driver Pickup:</strong> ${bookingDetails.driverPickupLocation || 'Not specified'}</li>
                <li style="margin-bottom: 5px;"><strong>Guide:</strong> ${bookingDetails.selectedGuide ? bookingDetails.selectedGuide.name : 'Not selected'}</li>
                <li style="margin-bottom: 5px;"><strong>Guide Pickup:</strong> ${bookingDetails.selectedGuide ? (bookingDetails.guidePickupLocation || 'Not specified') : 'N/A'}</li>
                ${spotListHtml}
            </ul>
            <p>Thank you for choosing us!</p>
        `,
    };
    await transporter.sendMail(mailOptions);
};

export const sendDriverAssignment = async (driver, bookingDetails) => {
    // ... (Keep existing logic)
    const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: driver.email,
        subject: 'New Trip Assigned to You!',
        html: `
            <h1>Hello ${driver.name},</h1>
            <p>You have been assigned a new trip. Here are the details:</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 5px;"><strong>Customer Name:</strong> ${bookingDetails.customerName}</li>
                <li style="margin-bottom: 5px;"><strong>Pickup Location:</strong> ${bookingDetails.driverPickupLocation || 'Not specified'}</li>
                <li style="margin-bottom: 5px;"><strong>Destination:</strong> ${bookingDetails.to}</li>
                <li style="margin-bottom: 5px;"><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
                <li style="margin-bottom: 5px;"><strong>Passengers:</strong> ${bookingDetails.passengers}</li>
                ${spotListHtml}
            </ul>
            <p>Please be ready at the pickup location on time.</p>
        `,
    };
    await transporter.sendMail(mailOptions);
};

export const sendGuideAssignment = async (guide, bookingDetails) => {
    // ... (Keep existing logic)
    const spotListHtml = createSpotsListHtml(bookingDetails.selectedSpotNames);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: guide.email,
        subject: 'New Guide Assignment!',
        html: `
            <h1>Hello ${guide.name},</h1>
            <p>You have been assigned to guide a customer. Here are the details:</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 5px;"><strong>Customer Name:</strong> ${bookingDetails.customerName}</li>
                <li style="margin-bottom: 5px;"><strong>Pickup Location:</strong> ${bookingDetails.guidePickupLocation || 'Not specified'}</li>
                <li style="margin-bottom: 5px;"><strong>Destination:</strong> ${bookingDetails.to}</li>
                <li style="margin-bottom: 5px;"><strong>Date:</strong> ${bookingDetails.date} at ${bookingDetails.time}</li>
                <li style="margin-bottom: 5px;"><strong>Passengers:</strong> ${bookingDetails.passengers}</li>
                ${spotListHtml}
            </ul>
            <p>Please meet the customer at the pickup location on time.</p>
        `,
    };
    await transporter.sendMail(mailOptions);
};

export const sendRegistrationEmail = async (user) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Welcome to Azure Journeys!',
        html: `
            <h1>Hello, ${user.name}!</h1>
            <p>Thank you for registering with Azure Journeys as a ${user.role}.</p>
            <p>We're excited to have you on board. Start exploring and booking your next adventure!</p>
            <p>Happy travels!</p>
        `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${user.email}`);
};

export const sendContactMessage = async (formData) => {
    const mailOptions = {
        from: formData.email,
        to: process.env.EMAIL_USER, 
        subject: `[Contact Form] ${formData.subject || 'General Inquiry'} from ${formData.name}`,
        html: `
            <h1>New Message from Azure Journeys Contact Form</h1>
            <p><strong>Sender Name:</strong> ${formData.name}</p>
            <p><strong>Sender Email:</strong> ${formData.email}</p>
            <p><strong>Sender Phone:</strong> ${formData.phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <hr>
            <h2>Message:</h2>
            <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
                ${formData.message}
            </p>
        `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Contact message sent from ${formData.email}`);
};

export const sendPasswordResetLink = async (user, token) => {
    const resetUrl = `${FRONTEND_DOMAIN}/#/reset-password?token=${token}&email=${user.email}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Azure Journeys: Password Reset Request',
        html: `
            <h1>Hello, ${user.name},</h1>
            <p>You requested a password reset for your Azure Journeys account. Please click the link below to set a new password:</p>
            
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; border-radius: 5px; text-decoration: none; font-weight: bold;">
                Reset Your Password
            </a>
            
            <p style="margin-top: 20px;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
            <p>Thank you.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset link sent to ${user.email}`);
};