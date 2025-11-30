import mongoose from 'mongoose';

const TouristSpotSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    history: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
});

const TouristSpot = mongoose.model('TouristSpot', TouristSpotSchema);

export default TouristSpot;