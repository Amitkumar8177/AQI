import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const PredictionForm = ({ onPredict, loading }) => {
  const [formData, setFormData] = useState({
    'PM2.5': '25',
    'PM10': '40',
    'NO2': '20',
    'SO2': '10',
    'CO': '0.5',
    'O3': '30',
  });

  const pollutantInfo = {
    'PM2.5': { label: 'PM2.5', unit: 'μg/m³', description: 'Fine particulate matter' },
    'PM10': { label: 'PM10', unit: 'μg/m³', description: 'Coarse particulate matter' },
    'NO2': { label: 'NO₂', unit: 'μg/m³', description: 'Nitrogen dioxide' },
    'SO2': { label: 'SO₂', unit: 'μg/m³', description: 'Sulfur dioxide' },
    'CO': { label: 'CO', unit: 'mg/m³', description: 'Carbon monoxide' },
    'O3': { label: 'O₃', unit: 'μg/m³', description: 'Ozone' },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const values = Object.entries(formData).map(([key, val]) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        toast.error(`Invalid value for ${pollutantInfo[key].label}: must be a positive number.`);
        return null;
      }
      return [key, num];
    });

    if (values.some(v => v === null)) return; // Stop if any validation failed

    const pollutants = Object.fromEntries(values);
    onPredict(pollutants);
  };

  const handleRandomize = () => {
    const random = {
      'PM2.5': (Math.random() * 100 + 5).toFixed(1), // 5-105
      'PM10': (Math.random() * 150 + 10).toFixed(1), // 10-160
      'NO2': (Math.random() * 80 + 5).toFixed(1),   // 5-85
      'SO2': (Math.random() * 50 + 1).toFixed(1),   // 1-51
      'CO': (Math.random() * 2 + 0.1).toFixed(2),  // 0.1-2.1
      'O3': (Math.random() * 100 + 10).toFixed(1),  // 10-110
    };
    setFormData(random);
    toast.success('Generated random values!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="card"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predict AQI</h2>
            <p className="text-sm text-gray-500">Enter pollutant values manually</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Random Values
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {Object.entries(pollutantInfo).map(([key, info]) => (
          <div key={key} className="group">
            <label className="block mb-2 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 text-lg">{info.label}</span>
                <span className="text-sm text-gray-400">{info.unit}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{info.description}</span>
            </label>
            <input
              type="number"
              step="0.01"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="input-field group-hover:border-blue-300"
              required
              min="0"
            />
          </div>
        ))}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Calculate AQI
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default PredictionForm;