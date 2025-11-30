import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'driver', 'guide'],
        default: 'customer',
    },
    // Additional fields for driver or guide roles
    carNumber: String,
    carModel: String,
    carImage: String,
    pricePerDay: Number,
    
    // *** NEW FIELD FOR DRIVING LICENSE URL ***
    drivingLicenseUrl: {
        type: String,
        default: null, // Stores the path to the uploaded file (e.g., '/uploads/12345.jpg')
    },
    
    // *** NEW FIELD FOR MANUAL VERIFICATION STATUS ***
    licenseVerified: {
        type: Boolean,
        default: false, // Default status is unverified
    },
    
    // --- Guide Fields ---
    languages: [String],
    experience: String,
    profileImage: String,
    guideNumber: String,
    
    // *** NEW: ADD THESE TWO FIELDS FOR GUIDE VERIFICATION ***
    guideIdCardUrl: {
        type: String,
        default: null, // Stores the path to the guide's ID card
    },
    idCardVerified: {
        type: Boolean,
        default: false, // Default status is unverified
    },
    
    totalEarnings: {
        type: Number,
        default: 0,
    },
    tripsCompleted: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    languages: [String],
    experience: String,
    profileImage: String,
    guideNumber: String, // Added guideNumber for guide role
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

const User = mongoose.model('User', UserSchema);

export default User;
