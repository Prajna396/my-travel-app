export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'driver' | 'guide';
  profileImage?: string;
}

export interface Driver extends User {
  role: 'driver';
  carNumber: string;
  carModel: string;
  carImage: string;
  pricePerDay: number;
  totalEarnings: number;
  tripsCompleted: number;
  rating: number;
}

export interface Guide extends User {
  role: 'guide';
  languages: string[];
  experience: string;
  rating: number;
  pricePerDay: number;
  totalEarnings: number;
  tripsCompleted: number;
  profileImage: string;
}

export interface Customer extends User {
  role: 'customer';
  bookings: Booking[];
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  history: string;
  image: string;
  city: string;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  spots: TouristSpot[];
  status: 'upcoming' | 'ongoing' | 'completed';
  passengers: number;
  totalCost: number;
}

export interface Booking {
  id: string;
  customerId: string;
  driverId: string;
  guideId?: string;
  trip: Trip;
  car: Driver;
  guide?: Guide;
  paymentMethod: 'phonepay' | 'cash';
  totalAmount: number;
  status: 'confirmed' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface BookingFormData {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  selectedSpots: string[];
  selectedCar?: Driver;
  selectedGuide?: Guide;
  paymentMethod: 'phonepay' | 'cash';
}