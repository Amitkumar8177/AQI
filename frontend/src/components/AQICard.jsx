import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Droplets, Gauge, AlertCircle } from 'lucide-react';

const AQICard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card flex items-center justify-center min-h-[300px]">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold">No data available</p>
          <p className="text-sm text-gray-400">Try selecting a city or predicting AQI.</p>
        </div>
      </div>
    );
  }

  // Helper to get Tailwind gradient classes based on AQI color
  const getGradient = (color) => {
    const gradients = {
      '#10b981': 'from-green-400 to-emerald-600', // Good
      '#fbbf24': 'from-yellow-400 to-amber-500', // Moderate
      '#fb923c': 'from-orange-400 to-orange-600', // Unhealthy for Sensitive Groups
      '#ef4444': 'from-red-400 to-red-600',       // Unhealthy
      '#a855f7': 'from-purple-400 to-purple-600', // Very Unhealthy
      '#7c2d12': 'from-red-900 to-orange-900',   // Hazardous
    };
    return gradients[color] || 'from-gray-400 to-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="card relative overflow-hidden flex flex-col justify-between" // Ensure card expands nicely
    >
      {/* Background decoration - subtle gradient blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full filter blur-3xl opacity-30 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-pink-100 to-red-100 rounded-full filter blur-3xl opacity-20 -ml-24 -mb-24"></div>
      
      <div className="relative z-10 flex flex-col h-full"> {/* Ensure content is on top and fills space */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {data.city || 'Current Location'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-5xl">{data.emoji}</div>
        </div>

        {/* Main AQI Display */}
        <div className="text-center my-8 flex-grow flex flex-col justify-center items-center"> {/* Centered and grows */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className={`inline-block bg-gradient-to-br ${getGradient(data.color)} rounded-full p-10 shadow-2xl`} // Rounded for a more modern feel
          >
            <div className="text-white">
              <div className="text-7xl font-black mb-2 leading-none">{data.aqi}</div> {/* Larger, bolder AQI */}
              <div className="text-xl font-bold opacity-90">AQI</div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: 'easeOut' }}
            className="mt-8"
          >
            <div className="text-3xl font-extrabold text-gray-900 mb-2">
              {data.category}
            </div>
            <p className="text-gray-600 max-w-md mx-auto">{data.description}</p>
          </motion.div>
        </div>

        {/* Health Advice Section */}
        {data.health_advice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100 mt-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Health Advice
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{data.health_advice}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pollutants Overview */}
        {data.pollutants && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ease: 'easeOut' }}
            className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {Object.entries(data.pollutants).map(([key, value], index) => {
              if (['Temperature', 'Humidity', 'Wind_Speed', 'Pressure'].includes(key)) {
                return null; // Skip non-pollutant weather data
              }
              return (
                <div
                  key={key}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="text-xs text-gray-500 mb-1 font-medium">{key}</div>
                  <div className="text-lg font-bold text-gray-800">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </div>
                  <div className="text-xs text-gray-400">μg/m³</div> {/* Assuming typical unit */}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AQICard;