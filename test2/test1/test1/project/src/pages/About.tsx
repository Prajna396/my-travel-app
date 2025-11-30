import React from 'react';
import { MapPin, Users, Award, Clock, Heart, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About Azure Journeys</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are passionate about creating unforgettable travel experiences across India, 
            connecting travelers with the rich culture, history, and natural beauty of our incredible country.
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our Twist on Travel:<br></br>
                Get a unique set of tourist spots every time you book.<br></br>
                Each location comes with its own story, history, and charm.<br></br>
                Friendly drivers and guides to make your trip smooth and insightful.<br></br>
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Today, we pride ourselves on offering personalized, authentic experiences that go beyond 
                typical tourist destinations. Our network of professional drivers and expert guides ensures 
                that every journey with us is safe, educational, and memorable.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">Passion for Travel Excellence</span>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1674612570450-d188d7aac8b3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="travel experience"
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Safety First',
                description: 'Your safety is our top priority. All our drivers are verified, and vehicles are regularly maintained.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: Users,
                title: 'Cultural Authenticity',
                description: 'We connect you with local culture through authentic experiences and knowledgeable guides.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for excellence in every aspect of your journey, from booking to destination.',
                color: 'bg-purple-100 text-purple-600'
              }
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>



      </div>
    </div>
  );
}