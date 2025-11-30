// client/src/pages/Contact.tsx
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Users, Headphones } from 'lucide-react';
import axios from 'axios'; 

const API_URL = 'http://localhost:5000/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.message) {
        alert('Please fill out all required fields (Name, Email, Message).');
        setStatus('error');
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/contact`, formData);
        
        // Success
        alert(response.data.message); 
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

    } catch (error) {
        console.error('Contact form submission failed:', error);
        
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Failed to send message. Please try again later.';

        alert(errorMessage);
        setStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Contact Azure Journeys</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help you plan your perfect journey. Get in touch with our team 
            for any questions, bookings, or special requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
             <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                {[
                    {
                        icon: Phone,
                        title: 'Phone',
                        content: '+91-9908383609',
                        subContent: 'Mon-Sat 9AM-5PM',
                        color: 'bg-green-100 text-green-600'
                    },
                    {
                        icon: Mail,
                        title: 'Email',
                        content: 'prajnasree396@gmail.com',
                        subContent: 'We reply within 24 hours',
                        color: 'bg-blue-100 text-blue-600'
                    },
                    {
                        icon: MapPin,
                        title: 'student',
                        content: 'Bhimavaram,Andhra Pradesh 534202',
                        subContent: 'Andhra Pradesh 500001',
                        color: 'bg-purple-100 text-purple-600'
                    },
                    {
                        icon: Clock,
                        title: 'Help Hours',
                        content: 'Mon - Sat: 9:00 AM - 5:00 PM',
                        subContent: 'Sunday: 10:00 AM - 3:00 PM',
                        color: 'bg-orange-100 text-orange-600'
                    }
                ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                            <p className="text-gray-700 mb-1">{item.content}</p>
                            <p className="text-sm text-gray-500">{item.subContent}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Customer Services</h3>
                <div className="space-y-4">
                {[
                    { icon: Headphones, text: '24/7 Customer Support' },
                    { icon: Users, text: 'Dedicated Travel Consultants' }
                ].map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <service.icon className="h-5 w-5 text-blue-200" />
                        <span className="text-blue-100">{service.text}</span>
                    </div>
                ))}
                </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">New Booking Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please describe your inquiry or provide any additional details..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transform transition-all duration-200 flex items-center justify-center space-x-2 
                    ${status === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800 hover:scale-105'}`}
                >
                  <Send className="h-5 w-5" />
                  <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section (Unchanged) */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'How do I book a trip?',
                answer: 'Simply sign up, choose your destination, select your car and guide, and make payment. Our team will handle the rest!'
              },
              {
                question: 'Can I cancel or modify my booking?',
                answer: 'Yes, you can cancel or modify your booking up to 24 hours before your trip date without any charges.'
              },
              {
                question: 'Are your drivers licensed and insured?',
                answer: 'All our drivers are fully licensed, verified, and our vehicles are comprehensively insured for your safety.'
              },
              {
                question: 'Do you provide customized tour packages?',
                answer: 'Yes, we offer customized packages based on your preferences, budget, and duration. Contact us for details.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}