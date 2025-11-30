import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js'; 
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
// This middleware is necessary for parsing JSON data in other routes
app.use(express.json()); 
// This middleware is required for Multer to save files to disk
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api', bookingRoutes); 
app.use('/api', contactRoutes);

// Add this middleware to serve files from the 'uploads' directory 
// so that the frontend can display the driving license image.
app.use('/uploads', express.static('uploads')); // <-- ADDED STATIC FILE SERVER

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
