import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Search, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

// currentAQI prop is passed to help highlight the currently selected city.
const RealTimeMap = ({ onCitySelect, currentAQI }) => { 
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Removed `initialLoad` state here. It's no longer needed in this component.

  // Effect to load the list of cities ONCE when RealTimeMap component mounts.
  useEffect(() => {
    const loadCitiesList = async () => {
      try {
        const response = await apiService.getCities();
        setCities(response.cities);
      } catch (error) {
        console.error('Error loading cities:', error);
        toast.error('Failed to load city list.');
      }
    };
    loadCitiesList();
  }, []); // Empty dependency array: runs only once on mount of RealTimeMap.

  // handleCityClick is now purely for user interaction
  const handleCityClick = async (city) => {
    if (loading) return; // Prevent multiple clicks while data is already loading

    setLoading(true);
    setSelectedCity(city); // Keep track of which city was clicked to show spinner
    
    try {
      const data = await apiService.getRealTimeAQI(city.name, city.lat, city.lon);
      onCitySelect(data); // Call the prop function to update currentAQI in Dashboard
      toast.success(`Loaded data for ${city.name}`);
    } catch (error) {
      console.error('Error fetching real-time AQI:', error);
      toast.error(`Failed to load data for ${city.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAQIColor = (aqi) => {
    if (!aqi) return '#cbd5e1'; 
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#fbbf24';
    if (aqi <= 150) return '#fb923c';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#7c2d12';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global AQI Monitor</h2>
          <p className="text-sm text-gray-500">Check air quality worldwide</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search cities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
        {filteredCities.length > 0 ? (
          filteredCities.map((city) => (
            <motion.button
              key={city.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCityClick(city)}
              disabled={loading}
              className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group
                ${currentAQI?.city === city.name && currentAQI?.source !== 'prediction' // Only highlight real-time cities
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${currentAQI?.city === city.name && currentAQI?.source !== 'prediction' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <div>
                  <div className="font-semibold text-gray-800">{city.name}</div>
                  <div className="text-sm text-gray-500">{city.country}</div>
                </div>
              </div>
              {loading && selectedCity?.name === city.name ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: getAQIColor(city.aqi || (Math.random() * 200 + 10)) }}
                >
                  {city.aqi ? city.aqi : '--'}
                </div>
              )}
            </motion.button>
          ))
        ) : (
          <div className="md:col-span-2 text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No cities found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RealTimeMap;