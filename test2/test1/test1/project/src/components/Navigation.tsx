import React from 'react';
import { User, LogOut, Car, MapPin, User as UserIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface NavigationProps {
  user: UserType | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Navigation({ user, currentPage, onNavigate, onLogout }: NavigationProps) {
  const getNavigationItems = () => {
    if (!user) {
      return [
        { id: 'home', label: 'Home', icon: null },
        { id: 'about', label: 'About Us', icon: null },
        { id: 'contact', label: 'Contact Us', icon: null },
        { id: 'login', label: 'Login/Sign Up', icon: UserIcon }
      ];
    }

    const baseItems = [
      { id: 'home', label: 'Home', icon: null },
      { id: 'about', label: 'About Us', icon: null },
      { id: 'contact', label: 'Contact Us', icon: null }
    ];

    if (user.role === 'customer') {
      return [
        ...baseItems,
        { id: 'bookings', label: 'My Bookings', icon: null },
        { id: 'profile', label: 'Profile', icon: User }
      ];
    }

    return [
      ...baseItems,
      { id: 'profile', label: 'Profile', icon: User }
    ];
  };

  const items = getNavigationItems();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-200" />
              <span className="text-2xl font-bold text-white">Azure Journeys</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {user && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-blue-200 text-sm capitalize">{user.role}</p>
              </div>
              {user.role === 'driver' && (
                <Car className="h-6 w-6 text-blue-200" />
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}