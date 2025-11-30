import React from 'react';
import { MapPin, Calendar, Users, Star, Car, User as UserIcon, ArrowRight, Camera } from 'lucide-react';
import { User } from '../types';
import EmployeeDashboard from '../components/employee/EmployeeDashboard';

interface HomeProps {
  user: User | null;
  onOpenBooking: () => void;
}

export default function Home({ user, onOpenBooking }: HomeProps) {
  if (user && (user.role === 'driver' || user.role === 'guide')) {
    return <EmployeeDashboard employee={user as any} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section
          className="relative overflow-hidden text-white bg-cover bg-center"
          style={{
            backgroundImage: "url('https://i.postimg.cc/NfSyq3Lk/Screenshot-20250618-155458-Chrome.jpg')"
          }}
      >
      <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
                  Discover India's Hidden Gems with 
                  <span className="text-blue-100 block drop-shadow-lg">Azure Journeys</span>
                </h1>
                <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white drop-shadow-lg">
                  Experience the beauty of India with our professional drivers and expert guides. 
                  From ancient temples to scenic landscapes, we'll take you on unforgettable journeys.
                </p>
            
            {user ? (
              <button
                onClick={onOpenBooking}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center space-x-2 mx-auto"
              >
                <Calendar className="h-6 w-6" />
                <span>Book Your Trip</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-white">Sign in to start booking your perfect journey</p>
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  Get Started Today
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Azure Journeys?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive travel solutions with experienced drivers and knowledgeable guides
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Car,
                title: 'Professional Drivers',
                description: 'Experienced drivers with clean, well-maintained vehicles for your safety and comfort',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: UserIcon,
                title: 'Expert Guides',
                description: 'Multilingual guides with deep knowledge of local culture, history, and attractions',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: MapPin,
                title: 'Curated Destinations',
                description: 'Handpicked tourist spots with rich history and breathtaking natural beauty',
                color: 'bg-purple-100 text-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Explore these amazing places with our expert guidance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: '1',
                name: 'Charminar',
                description: 'A historic monument and mosque located in Hyderabad, known as "The Arc de Triomphe of the East".',
                image: 'https://tse1.mm.bing.net/th/id/OIP.eHVfhrnqwNvgNHImWC1HZwHaJC?r=0&cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3',
              },
              {
                  id: '2',
                  name: 'Tirumala Venkateswara Temple',
                  description: 'A famous temple dedicated to Lord Venkateswara, the richest temple in the world.',
                  image: 'https://tse4.mm.bing.net/th/id/OIP.Nl00HnovM_zyHCwHRghm3AHaFj?r=0&cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3',
              },
              {
                  id: '3',
                  name: 'Borra Caves',
                  description: 'Magnificent limestone caves in the Ananthagiri Hills.',
                  image: 'https://www.holidify.com/images/compressed/attractions/attr_2194.jpg',
                },
              {
                  id: '4',
                  name: 'Kanaka Durga Temple',
                  description: 'A famous temple on Indrakeeladri hill, overlooking the Krishna River.',
                  image: 'https://www.visittemples.com/uploads/temple/image/kanagadurga10_1740787200.jpg'
              },
              {
                id: '5',
                name: 'Godavari Bridge',
                description: 'Commissioned in 1974, one of the longest bridges in Asia.',
                image: 'https://img.traveltriangle.com/blog/wp-content/uploads/2024/06/Godavari-Bridge-OG.jpg',
              }, 
              { 
                id: 6,
                name: 'RK Beach',
                image: 'https://saichintala.com/wp-content/uploads/2024/01/dji_fly_20240105_153110_708_1704514124071_photo.jpg?w=1024',
                description: 'Popular beach along the Bay of Bengal with scenic sunrise and local food stalls.'
              }

            ].map((destination, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-4">{destination.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <Camera className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      {user && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready for Your Next Adventure?</h2>
            <p className="text-xl mb-8">
              Book your personalized journey today and create memories that will last a lifetime
            </p>
            <button
              onClick={onOpenBooking}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center space-x-2 mx-auto"
            >
              <Calendar className="h-6 w-6" />
              <span>Start Your Journey</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}