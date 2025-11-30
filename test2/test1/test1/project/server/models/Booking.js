import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    // User Identifiers
    customerEmail: {
        type: String,
        required: true,
        ref: 'User', 
    },
    driverEmail: {
        type: String,
        required: true,
        ref: 'User',
    },
    guideEmail: {
        type: String,
        ref: 'User',
        default: null, 
    },

    // Trip Details
    route: {
        type: String, // e.g., 'Hyderabad → Vijayawada'
        required: true,
    },
    date: {
        type: String, 
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    passengers: {
        type: Number,
        required: true,
    },
    selectedSpots: [String], // Array of TouristSpot IDs

    // Cost & Payment
    totalCost: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['phonepay', 'cash'],
        required: true,
    },

    // Status & Logistics
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    driverPickupLocation: String,
    guidePickupLocation: String,

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Booking = mongoose.model('Booking', BookingSchema);

export default Booking;