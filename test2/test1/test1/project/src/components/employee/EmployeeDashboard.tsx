import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, MapPin, Star, Calendar, DollarSign, Users, Eye, CheckCircle } from 'lucide-react';
import { Driver, Guide, Booking } from '../../types';
import axios from 'axios';

const API_URL = 'https://my-travel-app-api.onrender.com/api';

interface EmployeeDashboardProps {
    employee: Driver | Guide;
}

export default function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
    const isDriver = employee.role === 'driver';
    const [allTrips, setAllTrips] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployeeTrips = useCallback(async () => {
        try {
            // No need to set loading to true here if it's just a refresh
            const response = await axios.get(`${API_URL}/bookings/${employee.email}?role=${employee.role}`);
            setAllTrips(response.data);
        } catch (err) {
            console.error("Error fetching employee trips:", err);
            setError("Failed to fetch trips. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [employee.email, employee.role]);

    useEffect(() => {
        fetchEmployeeTrips();
    }, [fetchEmployeeTrips]);

    const handleCompleteTrip = async (tripId: string) => {
        if (!window.confirm("Are you sure you want to mark this trip as completed? This cannot be undone.")) {
            return;
        }
        try {
            await axios.put(`${API_URL}/bookings/complete/${tripId}`);
            window.alert("Trip has been successfully marked as complete!");
            fetchEmployeeTrips(); // Refresh the list of trips to show the change
        } catch (err) {
            console.error("Failed to complete trip:", err);
            window.alert("Failed to update trip status. Please try again.");
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading dashboard data...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    const ongoingTrips = allTrips.filter(trip => trip.status === 'ongoing');
    const upcomingTrips = allTrips.filter(trip => trip.status === 'upcoming');
    const completedTrips = allTrips.filter(trip => trip.status === 'completed');

    const TripCard = ({ trip, colorClass }: { trip: Booking, colorClass: string }) => (
        <div key={trip._id} className={`border-l-4 ${colorClass} p-4 rounded-r-lg shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-lg">{trip.route}</h3>
                <span className="text-sm font-medium text-gray-600">{trip.date} at {trip.time}</span>
            </div>
            <div className="text-sm text-gray-600 space-y-3 mt-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><Users size={14} /><span>{trip.passengers} passengers</span></div>
                    <div className="flex items-center gap-1.5"><DollarSign size={14} /><span>₹{trip.totalCost}</span></div>
                </div>

                {trip.selectedSpotNames && trip.selectedSpotNames.length > 0 && (
                    <div>
                        <h4 className="font-semibold flex items-center gap-1.5 text-gray-800"><Eye size={14} /><span>Places to Visit:</span></h4>
                        <ul className="list-disc list-inside ml-5 text-gray-600">
                            {trip.selectedSpotNames.map(name => <li key={name}>{name}</li>)}
                        </ul>
                    </div>
                )}

                {trip.status === 'ongoing' && (
                    <button onClick={() => handleCompleteTrip(trip._id)} className="mt-2 w-full bg-green-500 text-white py-1.5 rounded-lg hover:bg-green-600 transition-colors font-semibold text-xs">
                        Mark as Completed
                    </button>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {employee.name}!</h1>
                            <p className="text-blue-200 capitalize">{isDriver ? 'Professional Driver' : 'Tourism Guide'}</p>
                            {isDriver && <p className="text-xl font-bold mt-2 bg-blue-700 inline-block px-4 py-2 rounded-lg">Car: {(employee as Driver).carNumber}</p>}
                            {!isDriver && <p className="text-lg mt-2">Languages: {(employee as Guide).languages?.join(', ')}</p>}
                        </div>
                        <div className="text-right">
                            <div className="bg-white/20 rounded-lg p-4">
                                <div className="flex items-center justify-center mb-2">
                                    <Star className="h-6 w-6 text-yellow-300 mr-1" />
                                    <span className="text-2xl font-bold">{employee.rating}</span>
                                </div>
                                <p className="text-blue-200 text-sm">Rating</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                                <p className="text-3xl font-bold text-green-600">₹{employee.totalEarnings?.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full"><DollarSign className="h-6 w-6 text-green-600" /></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Trips Completed</p>
                                <p className="text-3xl font-bold text-blue-600">{employee.tripsCompleted}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full"><MapPin className="h-6 w-6 text-blue-600" /></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                                <p className="text-3xl font-bold text-yellow-500">{employee.rating}/5</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full"><Star className="h-6 w-6 text-yellow-500" /></div>
                        </div>
                    </div>
                </div>

                {/* Trip Sections */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-6"><TrendingUp className="h-6 w-6 text-orange-600 mr-3" /><h2 className="text-xl font-bold text-gray-800">Ongoing Trips ({ongoingTrips.length})</h2></div>
                        <div className="space-y-4">{ongoingTrips.length > 0 ? ongoingTrips.map(trip => <TripCard key={trip._id} trip={trip} colorClass="border-orange-500 bg-orange-50" />) : <p className="text-gray-500">No ongoing trips.</p>}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-6"><Calendar className="h-6 w-6 text-blue-600 mr-3" /><h2 className="text-xl font-bold text-gray-800">Upcoming Trips ({upcomingTrips.length})</h2></div>
                        <div className="space-y-4">{upcomingTrips.length > 0 ? upcomingTrips.map(trip => <TripCard key={trip._id} trip={trip} colorClass="border-blue-500 bg-blue-50" />) : <p className="text-gray-500">No upcoming trips.</p>}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-6"><CheckCircle className="h-6 w-6 text-green-600 mr-3" /><h2 className="text-xl font-bold text-gray-800">Completed Trips ({completedTrips.length})</h2></div>
                        <div className="space-y-4">{completedTrips.length > 0 ? completedTrips.map(trip => <TripCard key={trip._id} trip={trip} colorClass="border-green-500 bg-green-50" />) : <p className="text-gray-500">No trips completed yet.</p>}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}