import express from 'express';
import User from '../models/User.js';
import TouristSpot from '../models/TouristSpot.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage }).fields([
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'guideIdCard', maxCount: 1 },
]);
// -----------------------------------------------------------------
// NEW ROUTE: MANUAL LICENSE VERIFICATION (Admin function)
// -----------------------------------------------------------------
router.put('/verify-license/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        // Find the driver and set licenseVerified to true
        const updatedUser = await User.findOneAndUpdate(
            { email: email, role: 'driver' },
            { $set: { licenseVerified: true } }, 
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Driver not found or is not a driver role.' });
        }

        res.status(200).json({ 
            message: 'Driver license verified successfully.', 
            driver: updatedUser 
        });
    } catch (error) {
        console.error('Error verifying license:', error);
        res.status(500).json({ message: 'Failed to verify license.', error: error.message });
    }
});

// -----------------------------------------------------------------
// EXISTING GET ROUTES
// -----------------------------------------------------------------

// Get all drivers
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' });
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all guides
router.get('/guides', async (req, res) => {
    try {
        const guides = await User.find({ role: 'guide' });
        res.status(200).json(guides);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all tourist spots
router.get('/touristspots', async (req, res) => {
    try {
        const spots = await TouristSpot.find();
        res.status(200).json(spots);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// New endpoint for fetching tourist spots based on cities
router.get('/touristspots/bycities', async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ message: 'Missing "from" or "to" city in query.' });
    }

    try {
        const spots = await TouristSpot.find({
            city: { $in: [from, to] }
        });
        res.status(200).json(spots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- MODIFIED PROFILE UPDATE ROUTE ---
router.put('/profile/:email', upload, async (req, res) => {
    const { email } = req.params;
    const updates = req.body;

    delete updates.email;
    delete updates.role;

    try {
        // *** FIX: Convert languages string back to an array before saving ***
        if (updates.languages && typeof updates.languages === 'string') {
            updates.languages = updates.languages.split(',').map(lang => lang.trim()).filter(Boolean);
        }

        if (req.files) {
            if (req.files.drivingLicense) {
                updates.drivingLicenseUrl = '/uploads/' + req.files.drivingLicense[0].filename;
                updates.licenseVerified = false;
            }
            if (req.files.guideIdCard) {
                updates.guideIdCardUrl = '/uploads/' + req.files.guideIdCard[0].filename;
                updates.idCardVerified = false;
            }
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
});

export default router;