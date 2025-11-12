import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Wind, 
  Cloud, // Changed Activity to Cloud for main AQI icon
  MapPin, 
  TrendingUp,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';

import AQICard from './AQICard';
import PredictionForm from './PredictionForm';
import AQIChart from './AQIChart';
import HealthAdvice from './HealthAdvice';
import RealTimeMap from './RealTimeMap';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [currentAQI, setCurrentAQI] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState({
    realtime: false,
    prediction: false,
    forecast: false,
    historical: false,
  });
  const [activeTab, setActiveTab] = useState('realtime');

  useEffect(() => {
    // Initial data load handled by RealTimeMap component's initial city selection
    // and subsequent calls to loadForecast and loadHistorical after initial currentAQI is set.
  }, []);

  useEffect(() => {
    if (currentAQI) {
      loadForecast(currentAQI.aqi);
      loadHistorical();
    }
  }, [currentAQI]);


  const loadRealTimeData = async (city = 'London') => {
    setLoading(prev => ({ ...prev, realtime: true }));
    try {
      const data = await apiService.getRealTimeAQI(city);
      setCurrentAQI(data);
      toast.success(`Loaded data for ${city}`);
    } catch (error) {
      toast.error('Failed to load real-time data');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, realtime: false }));
    }
  };

  const loadForecast = async (currentAqi) => {
    setLoading(prev => ({ ...prev, forecast: true }));
    try {
      const data = await apiService.getForecast(currentAQI?.city || 'London', currentAqi || 75);
      setForecastData(data.forecast);
    } catch (error) {
      console.error('Error loading forecast:', error);
      toast.error('Failed to load AQI forecast.');
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const loadHistorical = async () => {
    setLoading(prev => ({ ...prev, historical: true }));
    try {
      const data = await apiService.getHistorical(7);
      setHistoricalData(data.daily);
    } catch (error) {
      console.error('Error loading historical data:', error);
      toast.error('Failed to load historical AQI data.');
    } finally {
      setLoading(prev => ({ ...prev, historical: false }));
    }
  };

  const handlePrediction = async (pollutants) => {
    setLoading(prev => ({ ...prev, prediction: true }));
    try {
      const data = await apiService.predictAQI(pollutants);
      setCurrentAQI(data); // Update current AQI with predicted value
      setActiveTab('realtime'); // Switch to realtime to show the new AQI in card
      toast.success('AQI predicted successfully!');
    } catch (error) {
      toast.error('Failed to predict AQI');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, prediction: false }));
    }
  };

  const handleCitySelect = (data) => {
    setCurrentAQI(data);
    setActiveTab('realtime');
    // forecast and historical will reload via useEffect on currentAQI change
  };

  const handleRefresh = async () => {
    toast.loading('Refreshing data...');
    await loadRealTimeData(currentAQI?.city || 'London');
    await loadForecast(currentAQI?.aqi || 75);
    await loadHistorical();
    toast.dismiss(); // Dismiss loading toast
    toast.success('Data refreshed successfully!');
  };

  const handleExport = () => {
    if (!currentAQI) {
      toast.error('No data to export.');
      return;
    }
    const dataToExport = {
      currentAQI: currentAQI,
      forecast: forecastData,
      historical: historicalData,
      timestamp: new Date().toISOString()
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqi-data-${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 py-3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold gradient-text">
                  AQI Monitor
                </h1>
                <p className="text-sm text-gray-600">
                  Air Quality Index Prediction & Monitoring
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-gray-700" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                title="Export data"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Current AQI', value: currentAQI?.aqi || '--', icon: Cloud, color: 'blue' },
            { label: 'Category', value: currentAQI?.category || 'Loading...', icon: Wind, color: 'purple' },
            { label: 'Location', value: currentAQI?.city || 'Global', icon: MapPin, color: 'green' },
            { label: 'Source', value: currentAQI?.source || 'N/A', icon: AlertCircle, color: 'orange' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, ease: 'easeOut' }}
              className="card p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-xl shadow-sm`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ease: 'easeOut' }}
          className="flex gap-3 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:px-0"
        >
          {[
            { id: 'realtime', label: 'Current AQI & Forecast' },
            { id: 'prediction', label: 'Predict AQI' },
            { id: 'historical', label: 'Historical Trends' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-lg
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'realtime' && (
              <>
                <AQICard data={currentAQI} loading={loading.realtime} />
                <AQIChart data={forecastData} type="area" title="24-Hour Forecast" description="Predicted AQI over the next day" />
              </>
            )}
            
            {activeTab === 'prediction' && (
              <>
                <AQICard data={currentAQI} loading={loading.prediction} />
                {currentAQI && <HealthAdvice aqi={currentAQI.aqi} category={currentAQI.category} />}
              </>
            )}
            
            {activeTab === 'historical' && (
              <AQIChart data={historicalData} type="bar" title="Historical AQI Trends" description="Daily average AQI over the last 7 days" />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {activeTab === 'prediction' ? (
              <PredictionForm onPredict={handlePrediction} loading={loading.prediction} />
            ) : (
              <RealTimeMap onCitySelect={handleCitySelect} />
            )}
            
            {currentAQI && (activeTab === 'realtime' || activeTab === 'historical') && (
              <HealthAdvice aqi={currentAQI.aqi} category={currentAQI.category} />
            )}
          </div>
        </div>

        {/* Pollutants Breakdown */}
        {currentAQI?.contributions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ease: 'easeOut' }}
            className="card mt-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Pollutant Contribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {Object.entries(currentAQI.contributions)
                .sort(([, a], [, b]) => b - a)
                .map(([pollutant, percentage], index) => (
                  <div key={pollutant}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700 text-lg">{pollutant}</span>
                      <span className="text-sm text-gray-600 font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full shadow-sm"
                      ></motion.div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2 font-medium">
              Built with ❤️ using React, Flask, and Machine Learning
            </p>
            <p className="text-sm text-gray-500">
              Data sources: IQAir AirVisual API (Primary) & OpenWeatherMap API (Fallback) | Model: Random Forest Regressor
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;