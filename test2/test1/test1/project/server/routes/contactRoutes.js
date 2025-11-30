import express from 'express';
import { sendContactMessage } from '../services/emailService.js';

const router = express.Router();

// POST /api/contact - Endpoint to receive contact form submission
router.post('/contact', async (req, res) => {
    const formData = req.body;

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
        return res.status(400).json({ message: 'Name, Email, and Message are required fields.' });
    }

    try {
        await sendContactMessage(formData);
        
        res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('API Error handling contact form:', error);
        res.status(500).json({ 
            message: 'Failed to send message due to a server error. Please try calling us.',
            error: error.message 
        });
    }
});

export default router;