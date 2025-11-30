import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LoginForm from './components/auth/LoginForm';
import TripBooking from './components/customer/TripBooking';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import ResetPassword from './pages/ResetPassword';
import DriverReview from './pages/DriverReview';

import { User, BookingFormData } from './types';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState('home');
    const [showLogin, setShowLogin] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.split('?')[0];
            if (hash === '#/reset-password') {
                setCurrentPage('reset-password');
                setShowLogin(false);
            } else if (hash === '#/login' && !user) {
                setShowLogin(true);
            } else if (hash === '') {
                setCurrentPage('home');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [user]);

    const showMessage = (text: string, type: string) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleLogin = (userData: User) => {
        setUser(userData);
        setShowLogin(false);
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
        setCurrentPage(userData.role === 'customer' ? 'home' : 'profile');
        
        // *** FIX: REMOVED THE MESSAGE FROM THIS FUNCTION ***
        // The LoginForm will now handle showing the correct message.
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentPage('home');
        showMessage('Logged out successfully!', 'success');
    };

    const handleNavigation = (page: string) => {
        if (page === 'login' && !user) {
            setShowLogin(true);
        } else {
            setCurrentPage(page);
        }
    };
    
    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const handleBookingComplete = (booking: BookingFormData) => {
        setShowBooking(false);
        showMessage('Booking confirmed! Check your email for details.', 'success');
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home user={user} onOpenBooking={() => setShowBooking(true)} />;
            case 'about':
                return <About />;
            case 'contact':
                return <Contact />;
            case 'profile':
                return user ? <Profile user={user} onLogout={handleLogout} onNavigate={handleNavigation} onUserUpdate={handleUserUpdate} /> : <Home user={null} onOpenBooking={() => setShowLogin(true)} />;
            case 'bookings':
                return user && user.role === 'customer' ? <Bookings user={user} onOpenBooking={() => setShowBooking(true)} /> : <Home user={null} onOpenBooking={() => setShowLogin(true)} />;
            case 'reset-password':
                return <ResetPassword />;
            case 'driverReview':
                return <DriverReview />;
            default:
                return <Home user={user} onOpenBooking={() => setShowBooking(true)} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {message.text && (
                <div 
                    className={`fixed top-4 right-4 z-[100] p-4 rounded-lg shadow-lg text-white ${
                        message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {message.text}
                </div>
            )}
            <Navigation user={user} currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />
            
            {renderCurrentPage()}

            {showLogin && <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} onShowMessage={showMessage} />}

            {showBooking && user && (
                <TripBooking
                    userEmail={user.email}
                    customerName={user.name}
                    onClose={() => setShowBooking(false)}
                    onBookingComplete={handleBookingComplete}
                    onShowMessage={showMessage}
                />
            )}
        </div>
    );
}

export default App;