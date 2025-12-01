import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Note: dotenv.config() needs to be run early.
dotenv.config({ path: path.resolve('server', '.env') }); 

const connectDB = async () => {
    try {
        // MONGODB_URI is successfully read from Render Environment Variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export { connectDB };