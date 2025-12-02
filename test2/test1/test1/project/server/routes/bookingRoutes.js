import express from 'express';
import {
    sendBookingConfirmation,
    sendDriverAssignment,
    sendGuideAssignment,
} from '../services/emailService.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import TouristSpot from '../models/TouristSpot.js';

const router = express.Router();

const calculateTotalCost = (bookingDetails) => {
    const carCost = bookingDetails.selectedCar?.pricePerDay || 0;
    const guideCost = bookingDetails.selectedGuide?.pricePerDay || 0;
    // Only add guide cost if a guide is selected
    return carCost + (bookingDetails.selectedGuide ? guideCost : 0);
};

router.post('/bookings', async (req, res) => {
    const { userEmail, customerName, bookingDetails } = req.body;

    if (!userEmail || !bookingDetails.selectedCar) {
        return res.status(400).json({ message: 'Missing essential booking data.' });
    }

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const totalCost = calculateTotalCost(bookingDetails);

        // 1. Create the booking in Database
        const newBooking = new Booking({
            customerEmail: userEmail,
            driverEmail: bookingDetails.selectedCar.email,
            guideEmail: bookingDetails.selectedGuide?.email || null,
            route: `${bookingDetails.from} → ${bookingDetails.to}`,
            date: bookingDetails.date,
            time: bookingDetails.time,
            passengers: bookingDetails.passengers,
            selectedSpots: bookingDetails.selectedSpots,
            totalCost: totalCost,
            paymentMethod: bookingDetails.paymentMethod,
            driverPickupLocation: bookingDetails.driverPickupLocation,
            guidePickupLocation: bookingDetails.guidePickupLocation,
        });
        await newBooking.save();

        // ---------------------------------------------------------
        // 2. FETCH DETAILS *BEFORE* SENDING EMAILS
        // ---------------------------------------------------------
        
        // Fetch Driver Details (Name, Vehicle No)
        const driverUser = await User.findOne({ email: bookingDetails.selectedCar.email });
        
        // Fetch Guide Details (Name)
        const guideUser = bookingDetails.selectedGuide?.email 
            ? await User.findOne({ email: bookingDetails.selectedGuide.email }) 
            : null;

        // 3. Construct the Email Payload with ACTUAL NAMES and VEHICLE NO
        const emailPayload = { 
            ...bookingDetails, 
            customerName, 
            totalCost: newBooking.totalCost,
            // Add the fetched details here:
            driverName: driverUser ? driverUser.name : 'Assigning Driver...',
            vehicleNo: driverUser ? (driverUser.carNumber || 'Not Updated') : 'N/A', 
            guideName: guideUser ? guideUser.name : 'Not Added'
        };
        
        // ---------------------------------------------------------

        // 4. Send Emails safely
        try {
            // Send to Customer (Now includes driverName, vehicleNo, guideName)
            await sendBookingConfirmation(user, emailPayload); 

            // Send to Driver
            if (driverUser) {
                await sendDriverAssignment(driverUser, emailPayload);
            }

            // Send to Guide
            if (guideUser) {
                await sendGuideAssignment(guideUser, emailPayload);
            }

            res.status(201).json({ message: 'Booking confirmed! Emails sent.' });

        } catch (emailError) {
            console.error('SERVER CRASH PREVENTED: Email service failed.', emailError);
            res.status(201).json({ message: 'Booking confirmed, but email system is busy. Check "My Trips".' });
        }

    } catch (error) {
        console.error('SERVER ERROR DURING BOOKING:', error);
        res.status(500).json({ message: 'Server error during booking.' });
    }
});

router.get('/bookings/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    const { role } = req.query;
    try {
        const findQuery = {};
        if (role === 'customer') findQuery.customerEmail = userEmail;
        else if (role === 'driver') findQuery.driverEmail = userEmail;
        else if (role === 'guide') findQuery.guideEmail = userEmail;
        else return res.status(400).json({ message: 'Invalid role.' });

        // Removed sort, as requested in previous instructions (but sorting data on date field is usually efficient)
        const bookings = await Booking.find(findQuery).lean(); 
        const bookingsWithSpotNames = await Promise.all(
            bookings.map(async (booking) => {
                const spots = await TouristSpot.find({ id: { $in: booking.selectedSpots } });
                const selectedSpotNames = spots.map(spot => spot.name);
                return { ...booking, selectedSpotNames };
            })
        );
        res.status(200).json(bookingsWithSpotNames);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
});

router.put('/bookings/cancel/:id', async (req, res) => {
    // ... (Your existing cancel logic)
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        if (booking.status !== 'upcoming') {
            return res.status(400).json({ message: `Cannot cancel a trip that is already ${booking.status}.` });
        }
        booking.status = 'cancelled';
        await booking.save();
        res.status(200).json({ message: 'Trip successfully cancelled.', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error while cancelling trip.' });
    }
});

router.put('/bookings/complete/:id', async (req, res) => {
    // ... (Your existing complete logic)
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (booking.status !== 'ongoing') return res.status(400).json({ message: 'Only ongoing trips can be completed.' });

        booking.status = 'completed';
        
        const driver = await User.findOne({ email: booking.driverEmail });
        if (driver) {
            driver.tripsCompleted = (driver.tripsCompleted || 0) + 1;
            driver.totalEarnings = (driver.totalEarnings || 0) + booking.totalCost;
            await driver.save();
        }

        if (booking.guideEmail) {
            const guide = await User.findOne({ email: booking.guideEmail });
            if (guide) {
                guide.tripsCompleted = (guide.tripsCompleted || 0) + 1;
                // You can add guide earnings logic here if needed
                await guide.save();
            }
        }
        await booking.save();
        res.status(200).json({ message: 'Trip marked as complete.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while completing trip.' });
    }
});

export default router;