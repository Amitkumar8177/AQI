import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
  });
  const [activeTab, setActiveTab] = useState('realtime');
  const [selectedCity, setSelectedCity] = useState({
    name: 'London',
    lat: 51.5074,
    lon: -0.1278,
    country: 'GB',
  });

  // Initial load
  useEffect(() => {
    loadRealTimeData(selectedCity);
    loadForecast(selectedCity);
    loadHistorical(selectedCity);
    // eslint-disable-next-line
  }, []);

  // When city changes and in realtime tab, reload data
  useEffect(() => {
    if (activeTab === 'realtime' && selectedCity) {
      loadRealTimeData(selectedCity);
      loadForecast(selectedCity);
      loadHistorical(selectedCity);
    }
    // eslint-disable-next-line
  }, [selectedCity, activeTab]);

  const loadRealTimeData = async (city) => {
    setLoading((prev) => ({ ...prev, realtime: true }));
    try {
      const data = await apiService.getRealTimeAQI(city.name, city.lat, city.lon);
      setCurrentAQI(data);
      toast.success(`Loaded AQI for ${city.name}`);
    } catch (error) {
      toast.error('Failed to load real-time AQI');
    } finally {
      setLoading((prev) => ({ ...prev, realtime: false }));
    }
  };

  const loadForecast = async (city) => {
    setLoading((prev) => ({ ...prev, forecast: true }));
    try {
      const data = await apiService.getForecast(city.name, currentAQI?.aqi || 75);
      setForecastData(data.forecast);
    } catch (error) {
      // handle error
    } finally {
      setLoading((prev) => ({ ...prev, forecast: false }));
    }
  };

  const loadHistorical = async (city) => {
    try {
      const data = await apiService.getHistorical(7);
      setHistoricalData(data.daily);
    } catch (error) {
      // handle error
    }
  };

  const handlePrediction = async (pollutants) => {
    setLoading((prev) => ({ ...prev, prediction: true }));
    try {
      const data = await apiService.predictAQI(pollutants);
      setCurrentAQI(data);
      setActiveTab('prediction');
      toast.success('AQI predicted successfully!');
    } catch (error) {
      toast.error('Failed to predict AQI');
    } finally {
      setLoading((prev) => ({ ...prev, prediction: false }));
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setActiveTab('realtime');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'realtime' && selectedCity) {
      loadRealTimeData(selectedCity);
      loadForecast(selectedCity);
      loadHistorical(selectedCity);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-signature text-purple-600 tracking-wider">AQI Monitor</h1>
            <p className="text-sm text-gray-600">Air Quality Index Prediction & Monitoring</p>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'realtime', label: 'Real-time Data' },
            { id: 'prediction', label: 'Predict AQI' },
            { id: 'forecast', label: 'Forecast' },
            { id: 'historical', label: 'Historical' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'realtime' && (
              <>
                <AQICard data={currentAQI} loading={loading.realtime} />
                <AQIChart data={forecastData} type="area" />
              </>
            )}
            {activeTab === 'prediction' && (
              <>
                <AQICard data={currentAQI} loading={loading.prediction} />
                {currentAQI && <HealthAdvice aqi={currentAQI.aqi} category={currentAQI.category} />}
              </>
            )}
            {activeTab === 'forecast' && (
              <AQIChart data={forecastData} type="line" />
            )}
            {activeTab === 'historical' && (
              <AQIChart data={historicalData} type="bar" />
            )}
          </div>
          <div className="space-y-6">
            {activeTab === 'prediction' ? (
              <PredictionForm onPredict={handlePrediction} loading={loading.prediction} />
            ) : (
              <RealTimeMap onCitySelect={handleCitySelect} />
            )}
            {currentAQI && activeTab !== 'prediction' && (
              <HealthAdvice aqi={currentAQI.aqi} category={currentAQI.category} />
            )}
          </div>
        </div>
        {currentAQI?.contributions && (
          <div className="card mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Pollutant Contribution
            </h3>
            <div className="space-y-3">
              {Object.entries(currentAQI.contributions)
                .sort(([, a], [, b]) => b - a)
                .map(([pollutant, percentage]) => (
                  <div key={pollutant}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-700">{pollutant}</span>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              AQI 
            </p>
            <p className="text-sm text-gray-500">
              Data sources: OpenWeatherMap API | Model: Random Forest Regressor
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;