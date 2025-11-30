export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'driver' | 'guide';
    profileImage?: string;
    // Driver properties
    carNumber?: string;
    carModel?: string;
    carImage?: string;
    drivingLicenseUrl?: string;
    licenseVerified?: boolean;
    // Guide properties
    languages?: string[];
    experience?: string;
    guideNumber?: string;
    guideIdCardUrl?: string;
    idCardVerified?: boolean;
    // Common properties
    pricePerDay?: number;
    totalEarnings?: number;
    tripsCompleted?: number;
    rating?: number;
}

export interface Driver extends User { role: 'driver'; }
export interface Guide extends User { role: 'guide'; }

export interface TouristSpot {
    id: string;
    name: string;
    description: string;
    history: string;
    image: string;
    city: string;
}

// *** MODIFIED: Add selectedSpotNames to the Booking interface ***
export interface Booking {
    _id: string;
    customerEmail: string;
    driverEmail: string;
    guideEmail: string | null;
    route: string;
    date: string;
    time: string;
    passengers: number;
    selectedSpots: string[];
    selectedSpotNames: string[]; // <-- ADD THIS LINE
    totalCost: number;
    paymentMethod: 'phonepay' | 'cash';
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    driverPickupLocation?: string;
    guidePickupLocation?: string;
    createdAt: string;
}

export interface BookingFormData {
    from: string;
    to: string;
    date: string;
    time: string;
    passengers: number;
    selectedSpots: string[];
    selectedSpotNames?: string[]; // Add this to be sent to backend
    selectedCar?: Driver;
    selectedGuide?: Guide;
    paymentMethod: 'phonepay' | 'cash';
    driverPickupLocation?: string;
    guidePickupLocation?: string;
    customerName?: string;
}