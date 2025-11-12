import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Predict AQI
  predictAQI: async (pollutants) => {
    const response = await api.post('/predict', pollutants);
    return response.data;
  },

  // Get real-time AQI
  getRealTimeAQI: async (city = 'London', lat = null, lon = null) => {
    const params = { city };
    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    }
    const response = await api.get('/realtime', { params });
    return response.data;
  },

  // Get forecast
  getForecast: async (city = 'London', currentAqi = 75) => {
    const response = await api.get('/forecast', {
      params: { city, current_aqi: currentAqi },
    });
    return response.data;
  },

  // Get historical data
  getHistorical: async (days = 7) => {
    const response = await api.get('/historical', {
      params: { days },
    });
    return response.data;
  },

  // Get cities list
  getCities: async () => {
    const response = await api.get('/cities');
    return response.data;
  },
};

export default api;