import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, ArrowRight, Star, Phone, History, CreditCard } from 'lucide-react';
import { BookingFormData, Driver, Guide, TouristSpot } from '../../types';

const API_URL = 'https://my-travel-app-api.onrender.com/api';

interface TripBookingProps {
    userEmail: string;
    onClose: () => void;
    onBookingComplete: (booking: BookingFormData) => void;
    onShowMessage: (text: string, type: string) => void;
    customerName: string;
}

export default function TripBooking({ userEmail, onClose, onBookingComplete, onShowMessage, customerName }: TripBookingProps) {
    const [step, setStep] = useState(1);
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [allGuides, setAllGuides] = useState<Guide[]>([]);
    const [availableSpots, setAvailableSpots] = useState<TouristSpot[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    
    const [formData, setFormData] = useState<BookingFormData>({
        from: '',
        to: '',
        date: '',
        time: '',
        passengers: 1,
        selectedSpots: [], // This will store IDs
        selectedCar: undefined,
        selectedGuide: undefined,
        paymentMethod: 'cash',
        driverPickupLocation: '',
        guidePickupLocation: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [driversRes, guidesRes, spotsRes] = await Promise.all([
                    fetch(`${API_URL}/data/drivers`),
                    fetch(`${API_URL}/data/guides`),
                    fetch(`${API_URL}/data/touristspots`)
                ]);
                const driversData = await driversRes.json();
                const guidesData = await guidesRes.json();
                const spotsData = await spotsRes.json();
                
                setAllDrivers(driversData);
                setAllGuides(guidesData);
                
                const uniqueCities = [...new Set(spotsData.map((spot: TouristSpot) => spot.city))];
                setCities(uniqueCities as string[]);
            } catch (error) {
                console.error('Failed to fetch data from API:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchSpots = async () => {
            if (formData.from && formData.to) {
                try {
                    const spotsRes = await fetch(`${API_URL}/data/touristspots/bycities?from=${formData.from}&to=${formData.to}`);
                    const spotsData = await spotsRes.json();
                    setAvailableSpots(spotsData);
                } catch (error) {
                    console.error('Failed to fetch spots by cities:', error);
                }
            }
        };
        fetchSpots();
    }, [formData.from, formData.to]);
    
    // *** NEW: Get the full name of each selected spot ***
    const selectedSpotNames = availableSpots
        .filter(spot => formData.selectedSpots.includes(spot.id))
        .map(spot => spot.name);

    const totalCarCost = formData.selectedCar ? formData.selectedCar.pricePerDay : 0;
    const totalGuideCost = formData.selectedGuide ? formData.selectedGuide.pricePerDay : 0;
    const totalCost = totalCarCost + totalGuideCost;
    const costPerPerson = formData.passengers > 1 ? Math.ceil((totalCarCost / formData.passengers) + totalGuideCost) : totalCost;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleComplete = async () => {
        try {
            // *** MODIFIED: Add selectedSpotNames to the payload sent to the backend ***
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userEmail, 
                    customerName, 
                    bookingDetails: { ...formData, selectedSpotNames } 
                }),
            });
            const data = await response.json();
            if (response.ok) {
                onBookingComplete(formData);
                onClose();
                onShowMessage(data.message, 'success');
            } else {
                onShowMessage(data.message || 'Booking failed.', 'error');
            }
        } catch (error) {
            console.error('Network error while booking:', error);
            onShowMessage('Network error. Please try again.', 'error');
        }
    };
    
    const toggleSpot = (spotId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedSpots: prev.selectedSpots.includes(spotId)
                ? prev.selectedSpots.filter(id => id !== spotId)
                : [...prev.selectedSpots, spotId]
        }));
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Book Your Journey</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }` }>
                  {num}
                </div>
                {num < 5 && (
                  <div className={`w-16 h-1 ml-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Trip Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select
                    value={formData.from}
                    onChange={(e) => setFormData({...formData, from: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select departure city</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select
                    value={formData.to}
                    onChange={(e) => setFormData({...formData, to: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select destination</option>
                    {cities.filter(city => city !== formData.from).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.passengers}
                    onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tourist Spots */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Select Tourist Spots between {formData.from} and {formData.to}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableSpots.length > 0 ? (
                  availableSpots.map(spot => (
                    <div
                      key={spot.id}
                      onClick={() => toggleSpot(spot.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        formData.selectedSpots.includes(spot.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <h4 className="font-semibold text-lg mb-2">{spot.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{spot.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <History className="h-4 w-4 mr-1" />
                        <span>{spot.history}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No tourist spots available for this route.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Car Selection and Driver Pickup */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Choose Your Car & Pickup</h3>
              
              {!formData.selectedCar && (
                <p className="text-gray-500 mb-4">
                  Please select a car for your trip. Click on a car below to choose.
                </p>
              )}
              
              <div className="space-y-4">
                {allDrivers.length > 0 ? (
                  allDrivers.map((driver) => (
                    <div
                      key={driver.carNumber}
                      onClick={() => setFormData({ ...formData, selectedCar: driver })}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        formData.selectedCar?.carNumber === driver.carNumber
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <img
                          src={driver.carImage}
                          alt={driver.carModel}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{driver.carModel}</h4>
                          <p className="text-gray-600">Driver: {driver.name}</p>
                          <p className="font-bold text-blue-600">{driver.carNumber}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{driver.rating}</span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {driver.phone}
                          </p>
                          <p className="text-xl font-bold text-green-600">₹{driver.pricePerDay}/day</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No cars available at the moment.</p>
                )}
              </div>

              {/* New: Driver Pickup Location Input */}
              {formData.from && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver Pickup Location</label>
                  <input
                    type="text"
                    value={formData.driverPickupLocation}
                    onChange={(e) => setFormData({...formData, driverPickupLocation: e.target.value})}
                    placeholder={`e.g., ${formData.from} city center`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Guide Selection and Pickup */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Choose Your Guide (Optional)</h3>
              
              <div
                className={`border-2 rounded-xl p-4 mb-4 cursor-pointer transition-all ${
                  !formData.selectedGuide ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({...formData, selectedGuide: undefined})}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!formData.selectedGuide}
                    readOnly
                    className="mr-3"
                  />
                  <span className="text-gray-700">Skip guide selection - explore on your own</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {allGuides.map(guide => (
                  <div
                    key={guide.guideNumber}
                    onClick={() => setFormData({...formData, selectedGuide: guide})}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      formData.selectedGuide?.guideNumber === guide.guideNumber
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <img
                        src={guide.profileImage}
                        alt={guide.name}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{guide.name}</h4>
                        <p className="text-gray-600">Languages: {guide.languages.join(', ')}</p>
                        <p className="text-sm text-gray-500 mt-1">{guide.experience}</p>
                        <p className="font-bold text-blue-600">{guide.guideNumber}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{guide.rating}</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">₹{guide.pricePerDay}/day</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New: Guide Pickup Location Input */}
              {formData.to && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guide Pickup Location</label>
                  <input
                    type="text"
                    value={formData.guidePickupLocation}
                    onChange={(e) => setFormData({...formData, guidePickupLocation: e.target.value})}
                    placeholder={`e.g., Near ${formData.to} city main temple`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

                    {step === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                            
                            {/* Trip Details Section */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h4 className="font-semibold mb-4">Trip Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="font-medium">Route:</span> {formData.from} → {formData.to}</div>
                                    <div><span className="font-medium">Date:</span> {formData.date}</div>
                                    <div><span className="font-medium">Time:</span> {formData.time}</div>
                                    <div><span className="font-medium">Passengers:</span> {formData.passengers}</div>
                                    
                                    {/* *** MODIFIED SECTION TO PRESERVE LAYOUT *** */}
                                    <div className="col-span-2">
                                        <span className="font-medium">Selected Spots:</span>
                                        {selectedSpotNames.length > 0 ? (
                                            <ul className="list-disc list-inside text-gray-600">
                                                {selectedSpotNames.map(name => <li key={name}>{name}</li>)}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-600"> None</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown Section */}
                            <div className="bg-blue-50 rounded-xl p-6">
                                <h4 className="font-semibold mb-4">Cost Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                    {formData.selectedCar && (
                                        <div className="flex justify-between">
                                            <span>Car ({formData.selectedCar.carModel})</span>
                                            <span>₹{totalCarCost}</span>
                                        </div>
                                    )}
                                    {formData.selectedGuide && (
                                        <div className="flex justify-between">
                                            <span>Guide ({formData.selectedGuide.name})</span>
                                            <span>₹{totalGuideCost}</span>
                                        </div>
                                    )}
                                    {formData.passengers > 1 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Car cost split among {formData.passengers} passengers</span>
                                            <span>₹{Math.ceil(totalCarCost / formData.passengers)} per person</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 font-semibold flex justify-between">
                                        <span>Total Cost {formData.passengers > 1 ? '(per person)' : ''}</span>
                                        <span>₹{costPerPerson}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Section */}
                            <div>
                                <h4 className="font-semibold mb-4">Payment Method</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                                        className={`p-4 border-2 rounded-xl flex items-center space-x-3 ${
                                            formData.paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                    >
                                        <CreditCard className="h-6 w-6 text-green-600" />
                                        <span>Cash at End</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        {step > 1 && (
                            <button onClick={handleBack} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                Previous
                            </button>
                        )}
                        <div className="ml-auto">
                            {step < 5 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && (!formData.from || !formData.to || !formData.date || !formData.time)) ||
                                        (step === 3 && !formData.selectedCar)
                                    }
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    <span>Next</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button onClick={handleComplete} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                    Confirm Booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}