// client/src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://my-travel-app-api.onrender.com/api/auth';

// Helper to parse query parameters from the URL fragment (e.g., #/reset-password?token=...&email=...)
const getQueryParams = () => {
    // Uses location.hash to get parameters from the fragment (needed for single-page apps)
    const hash = window.location.hash;
    const queryString = hash.split('?')[1];
    if (!queryString) return {};
    
    return queryString.split('&').reduce((params: any, pair: string) => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value);
        return params;
    }, {});
};

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const queryParams = getQueryParams();
    const { token, email } = queryParams;

    // Check if token and email are present on load
    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Missing token or email in the reset link.');
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setStatus('error');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            setStatus('error');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/reset-password`, {
                email,
                token,
                newPassword: password,
            });

            setStatus('success');
            setMessage(response.data.message);

        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to reset password. Link may be expired.');
        }
    };

    const renderForm = () => {
        if (status === 'error' && message) {
            return (
                <div className="text-center p-8">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{message}</p>
                    <button onClick={() => window.location.hash = '/'} className="mt-4 text-blue-600 hover:underline">Go to Home</button>
                </div>
            );
        }

        if (status === 'success') {
            return (
                <div className="text-center p-8">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Success!</h2>
                    <p className="text-gray-600">{message}</p>
                    <button onClick={() => window.location.hash = '#/login'} className="mt-4 text-blue-600 hover:underline">Go to Login</button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
                    <p className="text-sm text-gray-500 mt-2">Account: {email}</p>
                </div>
                
                {/* New Password */}
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="password"
                        placeholder="New Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={status === 'loading'}
                    />
                </div>
                
                {/* Confirm Password */}
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={status === 'loading'}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                    {status === 'loading' ? 'Processing...' : 'Reset Password'}
                </button>
                
                {message && <p className="text-sm text-red-500 text-center">{message}</p>}
            </form>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                {renderForm()}
            </div>
        </div>
    );
}