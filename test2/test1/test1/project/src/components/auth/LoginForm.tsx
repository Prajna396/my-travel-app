import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Lock, UserCheck, ArrowLeft, Send } from 'lucide-react';
import { User as UserType } from '../../types';
import axios from 'axios';

const API_URL = 'https://my-travel-app-api.onrender.com/api/auth';

interface LoginFormProps {
    onLogin: (user: UserType) => void;
    onClose: () => void;
    onShowMessage: (text: string, type: string) => void;
}

// --- Forgot Password Component ---
const ForgotPasswordForm = ({ onBack, onShowMessage }: { onBack: () => void, onShowMessage: (text: string, type: string) => void }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/forgot-password`, { email });
            onShowMessage('If an account with that email exists, a reset link has been sent.', 'success');
            onBack(); 
        } catch (error) {
            onShowMessage('Could not process the request. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Forgot Password?</h2>
                <p className="text-gray-600 mt-2">Enter your email to receive a reset link.</p>
            </div>
            
            <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    <Send className="h-5 w-5" />
                    <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                </button>
            </form>

            <div className="mt-6 text-center">
                <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center mx-auto">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                </button>
            </div>
        </>
    );
};
// --- End of Forgot Password Component ---


export default function LoginForm({ onLogin, onClose, onShowMessage }: LoginFormProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [role, setRole] = useState<'customer' | 'driver' | 'guide'>('customer');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

    useEffect(() => {
        if (role === 'driver' || role === 'guide') {
            setIsLogin(true);
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
        try {
            const response = await axios.post(endpoint, { ...formData, role });
            onShowMessage(isLogin ? 'Logged in successfully!' : 'Registered successfully!', 'success');
            onLogin(response.data);
            onClose();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Authentication failed.';
            onShowMessage(message, 'error');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getTitle = () => {
        if (role !== 'customer') return `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
        return isLogin ? 'Welcome Back' : 'Join Azure Journeys';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="p-8">
                    {isForgot ? (
                        <ForgotPasswordForm onBack={() => setIsForgot(false)} onShowMessage={onShowMessage} />
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">{getTitle()}</h2>
                                <p className="text-gray-600 mt-2">
                                    {role === 'customer' && !isLogin ? 'Create your account today' : 'Sign in to your account'}
                                </p>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['customer', 'driver', 'guide'] as const).map((r) => (
                                        <button key={r} type="button" onClick={() => setRole(r)} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${role === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <UserCheck className="h-5 w-5 mb-1" />
                                            <span className="text-xs font-medium capitalize">{r}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && role === 'customer' && (
                                    <>
                                        <div className="relative"><UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-lg" required /></div>
                                        <div className="relative"><Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-lg" required /></div>
                                    </>
                                )}
                                <div className="relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-lg" required /></div>
                                <div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-lg" required /></div>

                                {isLogin && <div className="text-right"><button type="button" onClick={() => setIsForgot(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</button></div>}

                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </button>
                            </form>

                            {role === 'customer' && (
                                <div className="mt-6 text-center">
                                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 font-medium">
                                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}