import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, CreditCard, Clock, CheckCircle, AlertCircle, Eye, MapPin } from 'lucide-react';
import { Booking, User } from '../types'; 
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface BookingsProps {
    user: User; 
    onOpenBooking: () => void;
}

export default function Bookings({ user, onOpenBooking }: BookingsProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!user?.email || user.role !== 'customer') {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/bookings/${user.email}?role=${user.role}`);
            setBookings(response.data);
        } catch (err) {
            setError("Failed to fetch booking history. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    
    const handleCancelBooking = async (bookingId: string, route: string) => {
        if (!window.confirm(`Are you sure you want to cancel the trip for route: ${route}?`)) {
            return;
        }
        try {
            await axios.put(`${API_URL}/bookings/cancel/${bookingId}`);
            window.alert('Booking successfully cancelled!');
            fetchBookings();
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
                ? err.response.data.message 
                : 'Failed to cancel the trip.';
            window.alert(errorMessage);
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'upcoming') return 'bg-blue-100 text-blue-800';
        if (status === 'completed') return 'bg-green-100 text-green-800';
        if (status === 'cancelled') return 'bg-red-100 text-red-800'; 
        return 'bg-yellow-100 text-yellow-800'; // ongoing
    };
    
    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle className="h-4 w-4" />;
        if (status === 'cancelled') return <AlertCircle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'ongoing');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    if (loading) return <div className="text-center p-12 text-xl">Loading your journeys...</div>;
    if (error) return <div className="text-center p-12 text-xl text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">My Bookings</h1>
                    <p className="text-xl text-gray-600">Track and manage your travel bookings</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
                        <p className="text-gray-600 mb-6">Start your journey by booking your first trip!</p>
                        <button onClick={onOpenBooking} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Book a Trip</button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-700 mb-6">Upcoming Trips</h2>
                            {upcomingBookings.length > 0 ? upcomingBookings.map(booking => (
                                <div key={booking._id} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                    {/* Booking Card Content */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{booking.route}</h3>
                                            <p className="text-gray-500 text-sm">Booking ID: #{booking._id.slice(-6)}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}<span className="capitalize">{booking.status}</span>
                                        </span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-gray-700"><Calendar size={16} className="text-gray-400" /><span>{booking.date} at {booking.time}</span></div>
                                                <div className="flex items-center gap-2 text-gray-700"><Users size={16} className="text-gray-400" /><span>{booking.passengers} Passenger(s)</span></div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold flex items-center gap-2 text-gray-800"><Eye size={16} className="text-gray-400" /><span>Places to Visit</span></h4>
                                                {booking.selectedSpotNames?.length > 0 ? (
                                                    <ul className="list-disc list-inside ml-4 text-gray-600">{booking.selectedSpotNames.map(name => <li key={name}>{name}</li>)}</ul>
                                                ) : <p className="text-gray-500">No extra spots selected.</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 font-semibold"><CreditCard size={16} className="text-gray-400" /><span>Total: ₹{booking.totalCost}</span></div>
                                                {booking.status === 'upcoming' && <button onClick={() => handleCancelBooking(booking._id, booking.route)} className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 text-center">Cancel Booking</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500">No upcoming trips.</p>}
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-700 mb-6">Trip History</h2>
                            {pastBookings.length > 0 ? pastBookings.map(booking => (
                               <div key={booking._id} className="bg-white rounded-2xl shadow-lg p-6 mb-6 opacity-80">
                                    {/* Booking Card Content */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{booking.route}</h3>
                                            <p className="text-gray-500 text-sm">Booking ID: #{booking._id.slice(-6)}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}<span className="capitalize">{booking.status}</span>
                                        </span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-gray-700"><Calendar size={16} className="text-gray-400" /><span>{booking.date} at {booking.time}</span></div>
                                                <div className="flex items-center gap-2 text-gray-700"><Users size={16} className="text-gray-400" /><span>{booking.passengers} Passenger(s)</span></div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold flex items-center gap-2 text-gray-800"><Eye size={16} className="text-gray-400" /><span>Places Visited</span></h4>
                                                {booking.selectedSpotNames?.length > 0 ? (
                                                    <ul className="list-disc list-inside ml-4 text-gray-600">{booking.selectedSpotNames.map(name => <li key={name}>{name}</li>)}</ul>
                                                ) : <p className="text-gray-500">No extra spots selected.</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 font-semibold"><CreditCard size={16} className="text-gray-400" /><span>Total: ₹{booking.totalCost}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500">No past trips found.</p>}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}