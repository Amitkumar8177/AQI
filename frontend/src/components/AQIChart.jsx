import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react'; // Added Info icon

const AQIChart = ({ data, type = 'area', title = "24-Hour Forecast", description = "Predicted AQI over the next day" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card flex items-center justify-center min-h-[350px]">
        <div className="text-center text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold">No chart data available</p>
          <p className="text-sm text-gray-400">Please select data source or wait for data fetch.</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const getCategory = (aqi) => {
        if (aqi <= 50) return { text: 'Good', color: '#10b981' };
        if (aqi <= 100) return { text: 'Moderate', color: '#fbbf24' };
        if (aqi <= 150) return { text: 'Unhealthy (SG)', color: '#fb923c' };
        if (aqi <= 200) return { text: 'Unhealthy', color: '#ef4444' };
        if (aqi <= 300) return { text: 'Very Unhealthy', color: '#a855f7' };
        return { text: 'Hazardous', color: '#7c2d12' };
      };
      
      const category = getCategory(value);
      
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-extrabold" style={{ color: category.color }}>
            {value} AQI
          </p>
          <p className="text-md font-semibold mt-1" style={{ color: category.color }}>
            {category.text}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="hour" stroke="#9ca3af" tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAqi)"
              activeDot={{ r: 6, stroke: '#3b82f6', fill: '#fff' }}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="aqi" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        );
      
      default: // line chart
        return (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="hour" stroke="#9ca3af" tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#14b8a6" // Teal color for diversity
              strokeWidth={3}
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6, stroke: '#14b8a6', fill: '#fff' }}
            />
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>

      {/* AQI Scale Reference */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          AQI Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'Good', color: '#10b981', range: '0-50' },
            { label: 'Moderate', color: '#fbbf24', range: '51-100' },
            { label: 'USG', color: '#fb923c', range: '101-150' }, // Unhealthy for Sensitive Groups
            { label: 'Unhealthy', color: '#ef4444', range: '151-200' },
            { label: 'V. Unhealthy', color: '#a855f7', range: '201-300' },
            { label: 'Hazardous', color: '#7c2d12', range: '300+' },
          ].map((item) => (
            <div key={item.label} className="text-center p-2 rounded-lg bg-gray-50">
              <div
                className="h-2 rounded-full mb-1"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="text-xs font-semibold text-gray-700 leading-tight">
                {item.label}
              </div>
              <div className="text-xs text-gray-400">{item.range}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AQIChart;