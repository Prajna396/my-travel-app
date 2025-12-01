import express from 'express';
import User from '../models/User.js';
import { sendRegistrationEmail, sendPasswordResetLink} from '../services/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs'; // Make sure bcryptjs is imported

const router = express.Router();

// In server/routes/authRoutes.js

router.post('/register', async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, phone, password: hashedPassword, role });
        
        await newUser.save(); // Save the user FIRST

        // Attempt to send email, but don't crash if it fails
        try {
            await sendRegistrationEmail(newUser);
        } catch (emailError) {
            console.error("Email failed, but user registered:", emailError.message);
        }

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login route (This should already be correct)
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or role' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials or role' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Forgot Password route (This is correct)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If an account exists for that email, a password reset link has been sent.' });
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        await sendPasswordResetLink(user, token);
        res.status(200).json({ message: 'If an account exists for that email, a password reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing forgot password request.' });
    }
});

// *** THIS IS THE CORRECTED CODE FOR RESETTING THE PASSWORD ***
router.post('/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findOne({
            email: email,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset link is invalid or has expired.' });
        }

        // FIX: Hash the new password before saving it
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been successfully reset. You can now log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error processing password reset.' });
    }
});

export default router;