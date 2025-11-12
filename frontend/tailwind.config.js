/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as the default sans-serif font
      },
      colors: {
        'aqi-good': '#10b981',
        'aqi-moderate': '#fbbf24',
        'aqi-sensitive': '#fb923c',
        'aqi-unhealthy': '#ef4444',
        'aqi-very-unhealthy': '#a855f7',
        'aqi-hazardous': '#7c2d12',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 5s ease infinite alternate', // New animation
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        gradientShift: { // New keyframe for subtle background animation
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      },
    },
  },
  plugins: [],
}