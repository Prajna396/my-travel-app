import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Edit, Car, Save, FileText, CheckCircle, XCircle, MapPin, LogOut, Clock, Star, DollarSign } from 'lucide-react';
import { User, Driver, Guide } from '../types';
import axios from 'axios';

const API_URL = 'https://my-travel-app-api.onrender.com/api/data/profile';
const BACKEND_BASE_URL = 'https://my-travel-app-api.onrender.com';

interface ProfileProps {
    user: User;
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onUserUpdate: (updatedUser: User) => void;
}

export default function Profile({ user, onLogout, onNavigate, onUserUpdate }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(user);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null);
    const [guideIdCardFile, setGuideIdCardFile] = useState<File | null>(null);

    useEffect(() => {
        setEditData(user);
    }, [user, isEditing]);

    const isDriver = user.role === 'driver';
    const isGuide = user.role === 'guide';
    const driver = user as Driver;
    const guide = user as Guide;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.name === 'drivingLicense') setDrivingLicenseFile(e.target.files[0]);
            if (e.target.name === 'guideIdCard') setGuideIdCardFile(e.target.files[0]);
        }
    };
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);
        const formData = new FormData();
        
        Object.keys(editData).forEach(key => {
            if (key === 'languages' && Array.isArray(editData[key])) {
                formData.append(key, editData[key].join(','));
            } else if (typeof editData[key] !== 'object' || editData[key] === null) {
                formData.append(key, editData[key]);
            }
        });
        
        if (drivingLicenseFile) formData.append('drivingLicense', drivingLicenseFile);
        if (guideIdCardFile) formData.append('guideIdCard', guideIdCardFile);

        try {
            const response = await axios.put<User>(`${API_URL}/${user.email}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            window.alert("Profile updated successfully!");
            onUserUpdate(response.data);
        } catch (error) {
            const err = error as any;
            setFormError(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
            setIsEditing(false);
        }
    };
    
    const VerificationBadge = ({ verified, hasDocument }: { verified?: boolean, hasDocument?: boolean }) => {
        if (hasDocument && verified) return <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-flex items-center"><CheckCircle size={14} className="mr-1" />Verified</span>;
        if (hasDocument && !verified) return <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-flex items-center"><Clock size={14} className="mr-1" />Pending</span>;
        return <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full inline-flex items-center"><XCircle size={14} className="mr-1" />Missing</span>;
    };
    
    const handleViewTrips = () => {
        onNavigate(user.role === 'customer' ? 'bookings' : 'home');
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleSave}>
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <UserIcon className="h-10 w-10 text-blue-600" />
                                </div>
                                <div className="flex-grow">
                                    <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                                    <p className="text-blue-600 capitalize">{user.role}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     {isDriver && <VerificationBadge verified={driver.licenseVerified} hasDocument={!!driver.drivingLicenseUrl} />}
                                     {isGuide && <VerificationBadge verified={guide.idCardVerified} hasDocument={!!guide.guideIdCardUrl} />}
                                </div>
                            </div>
                        </div>

                        {formError && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4" role="alert">{formError}</div>}

                        {/* Personal Information Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                                {!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-blue-600 font-semibold text-sm"><Edit size={16} /> Edit</button>}
                            </div>
                            <div className="space-y-4">
                                <div><label className="text-sm font-medium text-gray-600">Full Name</label>{isEditing ? <input name="name" value={editData.name || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2 text-gray-800">{user.name}</p>}</div>
                                <div><label className="text-sm font-medium text-gray-600">Email Address</label><p className="p-2 text-gray-500">{user.email}</p></div>
                                <div><label className="text-sm font-medium text-gray-600">Phone</label>{isEditing ? <input name="phone" value={editData.phone || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2 text-gray-800">{user.phone}</p>}</div>
                            </div>
                        </div>
                        
                        {/* FIX: This entire block will now only show for Drivers or Guides */}
                        {(isDriver || isGuide) && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                {isDriver && <>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Vehicle Information</h3>
                                    <div className="space-y-4">
                                        <div><label className="text-sm font-medium">Car Model</label>{isEditing ? <input name="carModel" value={editData.carModel || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2">{driver.carModel || 'N/A'}</p>}</div>
                                        <div><label className="text-sm font-medium">License Plate</label>{isEditing ? <input name="carNumber" value={editData.carNumber || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2">{driver.carNumber || 'N/A'}</p>}</div>
                                        <div><label className="text-sm font-medium">Price per Day (₹)</label>{isEditing ? <input name="pricePerDay" type="number" value={editData.pricePerDay || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2">{driver.pricePerDay || 'N/A'}</p>}</div>
                                        <div><label className="text-sm font-medium">Driving License Card</label>
                                            {isEditing ? <input type="file" name="drivingLicense" onChange={handleFileChange} className="w-full text-sm mt-1 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"/> : 
                                            <div className="p-2 flex justify-between items-center">{driver.drivingLicenseUrl ? <a href={`${BACKEND_BASE_URL}${driver.drivingLicenseUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold">View License</a> : 'Not uploaded'}</div>}
                                        </div>
                                    </div>
                                </>}
                                {isGuide && <>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Guide Information</h3>
                                    <div className="space-y-4">
                                        <div><label className="text-sm font-medium">Experience</label>{isEditing ? <textarea name="experience" value={editData.experience || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2">{guide.experience || 'N/A'}</p>}</div>
                                        <div><label className="text-sm font-medium">Languages</label>{isEditing ? <input name="languages" value={Array.isArray(editData.languages) ? editData.languages.join(', ') : (editData.languages || '')} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"/> : <p className="p-2">{guide.languages?.join(', ') || 'N/A'}</p>}</div>
                                        <div><label className="text-sm font-medium">Identity Card</label>
                                            {isEditing ? <input type="file" name="guideIdCard" onChange={handleFileChange} className="w-full text-sm mt-1 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"/> : 
                                            <div className="p-2 flex justify-between items-center">{guide.guideIdCardUrl ? <a href={`${BACKEND_BASE_URL}${guide.guideIdCardUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold">View ID Card</a> : 'Not uploaded'}</div>}
                                        </div>
                                    </div>
                                </>}
                            </div>
                        )}

                        {isEditing && (
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsEditing(false)} className="border px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"><Save size={16} />{loading ? 'Saving...' : 'Save'}</button>
                            </div>
                        )}
                    </form>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                    {(isDriver || isGuide) && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span>Total Earnings</span><span className="font-semibold">₹{user.totalEarnings || 0}</span></div>
                                <div className="flex justify-between"><span>Trips Completed</span><span className="font-semibold">{user.tripsCompleted || 0}</span></div>
                                <div className="flex justify-between"><span>Rating</span><span className="font-semibold">{user.rating || 0} / 5</span></div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button onClick={() => setIsEditing(true)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                                <Edit className="text-blue-600" size={20} /><span>Edit Profile</span>
                            </button>
                            <button onClick={handleViewTrips} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                                <MapPin className="text-green-600" size={20} /><span>View Trips</span>
                            </button>
                            <button onClick={onLogout} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                                <LogOut className="text-red-600" size={20} /><span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}