import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Wind, AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';

const HealthAdvice = ({ aqi, category }) => {
  const getAdviceByCategory = () => {
    if (aqi <= 50) {
      return {
        icon: <Heart className="w-8 h-8" />,
        color: 'from-green-500 to-emerald-600',
        borderColor: 'border-green-200',
        bgColor: 'bg-green-50',
        titleColor: 'text-green-800',
        activities: [
          { activity: 'Outdoor Exercise', safe: true },
          { activity: 'Children Playing Outside', safe: true },
          { activity: 'Open Windows', safe: true },
          { activity: 'Sensitive Groups Outdoor', safe: true },
        ],
        recommendations: [
          'Enjoy all outdoor activities!',
          'Perfect time for exercise and sports.',
          'Open windows to air out your home.',
        ],
      };
    } else if (aqi <= 100) {
      return {
        icon: <Activity className="w-8 h-8" />,
        color: 'from-yellow-500 to-amber-600',
        borderColor: 'border-yellow-200',
        bgColor: 'bg-yellow-50',
        titleColor: 'text-yellow-800',
        activities: [
          { activity: 'Outdoor Exercise', safe: true },
          { activity: 'Children Playing Outside', safe: true },
          { activity: 'Open Windows', safe: true },
          { activity: 'Sensitive Groups Outdoor', safe: false },
        ],
        recommendations: [
          'Generally safe for most people.',
          'Sensitive individuals should limit prolonged outdoor exertion.',
          'Monitor your symptoms if you are unusually sensitive.',
        ],
      };
    } else if (aqi <= 150) {
      return {
        icon: <Wind className="w-8 h-8" />,
        color: 'from-orange-500 to-orange-600',
        borderColor: 'border-orange-200',
        bgColor: 'bg-orange-50',
        titleColor: 'text-orange-800',
        activities: [
          { activity: 'Outdoor Exercise', safe: false },
          { activity: 'Children Playing Outside', safe: false },
          { activity: 'Open Windows', safe: false },
          { activity: 'Sensitive Groups Outdoor', safe: false },
        ],
        recommendations: [
          'Sensitive groups should reduce heavy outdoor exertion.',
          'Children and the elderly should limit time outdoors.',
          'Consider indoor activities or wear a mask if going outside.',
          'Keep windows closed if air quality deteriorates.',
        ],
      };
    } else { // AQI > 150 (Unhealthy to Hazardous)
      return {
        icon: <AlertTriangle className="w-8 h-8" />,
        color: 'from-red-500 to-red-700',
        borderColor: 'border-red-200',
        bgColor: 'bg-red-50',
        titleColor: 'text-red-800',
        activities: [
          { activity: 'Outdoor Exercise', safe: false },
          { activity: 'Children Playing Outside', safe: false },
          { activity: 'Open Windows', safe: false },
          { activity: 'Sensitive Groups Outdoor', safe: false },
        ],
        recommendations: [
          'Avoid all outdoor physical activities.',
          'Keep windows and doors closed at all times.',
          'Use air purifiers indoors if available.',
          'Wear N95/KN95 masks if you must go outside.',
          'Monitor health symptoms closely and seek medical advice if needed.',
        ],
      };
    }
  };

  const advice = getAdviceByCategory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className={`p-3 bg-gradient-to-br ${advice.color} rounded-xl text-white shadow-md`}>
          {advice.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Recommendations</h2>
          <p className="text-sm text-gray-500">Based on current AQI: <span className="font-semibold" style={{color: advice.titleColor}}>{category}</span></p>
        </div>
      </div>

      {/* Activities Safety */}
      <div className={`${advice.bgColor} border-2 ${advice.borderColor} rounded-2xl p-6 mb-6`}>
        <h3 className={`font-extrabold ${advice.titleColor} mb-4 text-xl`}>Activities Status</h3>
        <div className="space-y-3">
          {advice.activities.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-gray-700 text-lg">
              <span>{item.activity}</span>
              <div className="flex items-center gap-2">
                {item.safe ? (
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <ShieldOff className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${
                  item.safe ? 'text-green-700' : 'text-red-700'
                }`}>
                  {item.safe ? 'Safe' : 'Avoid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="font-extrabold text-gray-800 mb-4 text-xl">What You Should Do</h3>
        <ul className="space-y-3">
          {advice.recommendations.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.08, ease: 'easeOut' }}
              className="flex items-start gap-3 text-gray-700 leading-relaxed"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${advice.color} mt-2 flex-shrink-0`}></div>
              <span>{rec}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* At-Risk Groups Callout */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" /> At-Risk Groups
        </h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          Children, elderly, pregnant women, and people with heart or lung conditions
          should take extra precautions and follow advice for sensitive groups at all times.
        </p>
      </div>
    </motion.div>
  );
};

export default HealthAdvice;