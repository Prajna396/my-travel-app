import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Driver } from '../types'; // Assuming User and Driver types are here
import { CheckCircle, XCircle, FileText, User as UserIcon } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/data';
const BACKEND_BASE_URL = 'http://localhost:5000'; 

interface DriverReviewState {
    drivers: Driver[];
    loading: boolean;
    error: string | null;
}

export default function DriverReview() {
    const [state, setState] = useState<DriverReviewState>({
        drivers: [],
        loading: true,
        error: null,
    });

    // Function to fetch all drivers from the backend
    const fetchDrivers = async () => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const response = await axios.get<Driver[]>(`${API_URL}/drivers`);
            setState(s => ({ ...s, drivers: response.data, loading: false }));
        } catch (error) {
            console.error("Error fetching drivers:", error);
            setState(s => ({ 
                ...s, 
                loading: false, 
                error: "Failed to load drivers. Check server connection." 
            }));
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    // Function to call the verification endpoint
    const handleVerify = async (email: string) => {
        const confirmVerify = window.confirm(`Are you sure you want to verify the license for ${email}?`);
        if (!confirmVerify) return;

        setState(s => ({ ...s, loading: true }));
        try {
            await axios.put(`${API_URL}/verify-license/${email}`);
            
            // Re-fetch the data to update the status in the list
            fetchDrivers();
            window.alert(`Driver ${email} verified successfully.`);
        } catch (error) {
            console.error("Verification failed:", error);
            setState(s => ({ 
                ...s, 
                loading: false, 
                error: `Failed to verify license for ${email}.` 
            }));
        }
    };

    const renderVerificationStatus = (driver: Driver) => {
        if (!driver.drivingLicenseUrl) {
            return <span className="text-red-500 flex items-center space-x-1"><XCircle className="w-4 h-4" /> <span>Missing Document</span></span>;
        }
        if (driver.licenseVerified) {
            return <span className="text-green-600 flex items-center space-x-1 font-semibold"><CheckCircle className="w-4 h-4" /> <span>Verified</span></span>;
        }
        return <span className="text-yellow-600 flex items-center space-x-1"><XCircle className="w-4 h-4" /> <span>Pending Review</span></span>;
    };

    if (state.loading) return <div className="p-8 text-center text-xl text-blue-600">Loading Drivers...</div>;
    if (state.error) return <div className="p-8 text-center text-xl text-red-600">{state.error}</div>;
    
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-2">Driver License Review</h1>

                <div className="space-y-6">
                    {state.drivers.map((driver) => (
                        <div key={driver.email} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                {/* Driver Info */}
                                <div className="col-span-1">
                                    <div className="flex items-center space-x-3">
                                        <UserIcon className="w-6 h-6 text-blue-600" />
                                        <span className="font-semibold text-lg text-gray-900">{driver.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{driver.email}</p>
                                </div>

                                {/* Vehicle & License Plate */}
                                <div className="col-span-1 text-gray-700">
                                    <p>Car: {driver.carModel || 'N/A'}</p>
                                    <p>Plate: {driver.carNumber || 'N/A'}</p>
                                </div>

                                {/* Status */}
                                <div className="col-span-1">
                                    {renderVerificationStatus(driver)}
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-end">
                                    {driver.drivingLicenseUrl && (
                                        <a 
                                            href={`${BACKEND_BASE_URL}${driver.drivingLicenseUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center justify-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>View Doc</span>
                                        </a>
                                    )}
                                    
                                    {!driver.licenseVerified && driver.drivingLicenseUrl && (
                                        <button 
                                            onClick={() => handleVerify(driver.email)}
                                            className="inline-flex items-center justify-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Mark Verified</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {state.drivers.length === 0 && !state.loading && (
                        <p className="text-center text-gray-500">No drivers registered yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
