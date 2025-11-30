import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // <-- NEW: Import bcrypt
import User from './models/User.js';
import TouristSpot from './models/TouristSpot.js';
import { mockDrivers, mockGuides, touristSpots } from './data/mockData.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await TouristSpot.deleteMany({});
        console.log('Cleared existing data...');

        // Import Tourist Spots
        await TouristSpot.insertMany(touristSpots);
        console.log('Tourist Spot Data Imported!');

        // *** NEW: Hash all user passwords before importing ***
        const allUsers = [...mockDrivers, ...mockGuides];
        
        const usersWithHashedPasswords = await Promise.all(
            allUsers.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                return {
                    ...user,
                    password: hashedPassword, // Replace plain text with hashed password
                };
            })
        );
        
        // Import users with their new, secure passwords
        await User.insertMany(usersWithHashedPasswords);
        console.log('User Data (Drivers and Guides) Imported with HASHED PASSWORDS!');

        console.log('Data seeding complete!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await User.deleteMany({});
        await TouristSpot.deleteMany({});
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error with data destroy: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}