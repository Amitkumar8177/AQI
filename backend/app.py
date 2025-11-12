from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import joblib
import numpy as np
import requests
import pandas as pd  # <--- ADD THIS IMPORT
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=app.config['CORS_ORIGINS'])

# ============================================
# LOAD ML MODEL
# ============================================
try:
    model = joblib.load(app.config['MODEL_PATH'])
    scaler = joblib.load(app.config['SCALER_PATH'])
    feature_names = joblib.load(app.config['FEATURES_PATH'])
    print("✅ ML Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    scaler = None
    feature_names = None

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_aqi_info(aqi):
    """Get AQI category, color, and health advice"""
    # ... (This function remains unchanged)
    if aqi <= 50:
        return {
            'category': 'Good',
            'color': '#10b981',
            'emoji': '😊',
            'level': 1,
            'description': 'Air quality is satisfactory, and air pollution poses little or no risk.',
            'health_advice': 'Enjoy outdoor activities!'
        }
    elif aqi <= 100:
        return {
            'category': 'Moderate',
            'color': '#fbbf24',
            'emoji': '😐',
            'level': 2,
            'description': 'Air quality is acceptable. However, there may be a risk for some people.',
            'health_advice': 'Sensitive individuals should consider limiting prolonged outdoor exertion.'
        }
    elif aqi <= 150:
        return {
            'category': 'Unhealthy for Sensitive Groups',
            'color': '#fb923c',
            'emoji': '😷',
            'level': 3,
            'description': 'Members of sensitive groups may experience health effects.',
            'health_advice': 'Children, elderly, and people with respiratory issues should limit outdoor activities.'
        }
    elif aqi <= 200:
        return {
            'category': 'Unhealthy',
            'color': '#ef4444',
            'emoji': '😨',
            'level': 4,
            'description': 'Everyone may begin to experience health effects.',
            'health_advice': 'Avoid prolonged outdoor exertion. Wear a mask if going outside.'
        }
    elif aqi <= 300:
        return {
            'category': 'Very Unhealthy',
            'color': '#a855f7',
            'emoji': '😱',
            'level': 5,
            'description': 'Health alert: everyone may experience serious health effects.',
            'health_advice': 'Avoid all outdoor activities. Keep windows closed. Use air purifiers.'
        }
    else:
        return {
            'category': 'Hazardous',
            'color': '#7c2d12',
            'emoji': '☠️',
            'level': 6,
            'description': 'Health warning of emergency conditions. The entire population is affected.',
            'health_advice': 'Stay indoors. Seal windows and doors. Evacuate if advised.'
        }

def calculate_pollutant_contribution(pollutants):
    """Calculate individual pollutant contributions to AQI"""
    # ... (This function remains unchanged)
    contributions = {}
    total = 0
    
    # Simplified contribution calculation
    weights = {
        'PM2.5': 4.0,
        'PM10': 0.8,
        'NO2': 0.5,
        'SO2': 0.3,
        'CO': 0.1,
        'O3': 1.5
    }
    
    for pollutant, value in pollutants.items():
        if pollutant in weights:
            contribution = value * weights[pollutant]
            contributions[pollutant] = contribution
            total += contribution
    
    # Convert to percentages
    if total > 0:
        contributions = {k: (v/total)*100 for k, v in contributions.items()}
    
    return contributions

# ============================================
# NEW: IQAIR & OPENWEATHERMAP API FUNCTIONS (Refactored)
# ============================================

def get_realtime_aqi_iqair(city=None, lat=None, lon=None):
    """Fetch real-time AQI data from IQAir AirVisual API."""
    api_key = app.config['IQAIR_API_KEY']
    if not api_key:
        return None # Return None if key is not set

    try:
        data = None
        if lat is not None and lon is not None:
            # Try nearest_city endpoint with lat/lon first
            url = f'http://api.airvisual.com/v2/nearest_city?lat={lat}&lon={lon}&key={api_key}'
            response = requests.get(url)
            response.raise_for_status()
            if response.json()['status'] == 'success':
                data = response.json()
                print(f"IQAir data found for nearest_city ({lat}, {lon})")
            else:
                print(f"IQAir nearest_city failed for lat={lat}, lon={lon}: {response.json().get('data', 'Unknown error')}")

        if data is None and city:
            # Fallback to city endpoint if nearest_city fails or no lat/lon
            # Note: IQAir city endpoint is less reliable without state/country
            url = f'http://api.airvisual.com/v2/city?city={city}&state=&country=&key={api_key}'
            response = requests.get(url)
            response.raise_for_status()
            if response.json()['status'] == 'success':
                data = response.json()
                print(f"IQAir data found for city: {city}")
            else:
                print(f"IQAir city query failed for {city}: {response.json().get('data', 'Unknown error')}")
                data = None # Ensure data is None if city query fails too

        if data is None or not data['data']['current']['pollution']:
            return None # No successful data retrieval

        aqi_data = data['data']
        pollution = aqi_data['current']['pollution']
        
        aqi = pollution['aqius'] # US AQI
        
        aqi_info = get_aqi_info(aqi)

        pollutants = {
            'PM2.5': pollution.get('p2', 0), # IQAir uses p2 for PM2.5
            'PM10': pollution.get('p1', 0),  # IQAir uses p1 for PM10
            'NO2': pollution.get('n2', 0),
            'SO2': pollution.get('s2', 0),
            'CO': pollution.get('co', 0),
            'O3': pollution.get('o3', 0),
        }

        # IQAir gives coordinates as [lon, lat], convert to [lat, lon]
        coordinates = {'lat': aqi_data['location']['coordinates'][1], 'lon': aqi_data['location']['coordinates'][0]}

        full_city_name = aqi_data['city']
        if aqi_data.get('state'):
            full_city_name += f", {aqi_data['state']}"
        full_city_name += f", {aqi_data['country']}"

        return {
            'success': True,
            'source': 'iqair',
            'city': full_city_name,
            'coordinates': coordinates,
            'aqi': aqi,
            'category': aqi_info['category'],
            'color': aqi_info['color'],
            'emoji': aqi_info['emoji'],
            'description': aqi_info['description'],
            'health_advice': aqi_info['health_advice'],
            'pollutants': pollutants,
            'timestamp': datetime.now().isoformat()
        }

    except requests.exceptions.RequestException as e:
        print(f"IQAir API Request Error: {e}")
        return None
    except Exception as e:
        print(f"Error parsing IQAir data: {e}")
        return None

def get_realtime_aqi_openweathermap(city='London', lat=None, lon=None):
    """Fetch real-time AQI data from OpenWeatherMap API."""
    api_key = app.config['OPENWEATHER_API_KEY']
    
    if not api_key:
        print("OpenWeatherMap API key is missing.")
        return None # Return None if key is not set

    try:
        # Resolve coordinates if not provided
        if lat is None or lon is None:
            geo_url = f'http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={api_key}'
            geo_response = requests.get(geo_url)
            geo_data = geo_response.json()
            
            if not geo_data:
                print(f"City '{city}' not found by OpenWeatherMap geocoding.")
                return None
            
            lat = geo_data[0]['lat']
            lon = geo_data[0]['lon']
            city = geo_data[0]['name'] # Use the city name returned by geocoding
        
        url = f'http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        aqi = data['list'][0]['main']['aqi']
        components = data['list'][0]['components']
        
        # Convert OpenWeatherMap's 1-5 scale to our estimated EPA AQI scale
        aqi_mapping = {1: 25, 2: 75, 3: 125, 4: 175, 5: 250}
        aqi_value = aqi_mapping.get(aqi, 75) # Default to Moderate if not found
        
        aqi_info = get_aqi_info(aqi_value)
        
        pollutants = {
            'PM2.5': components.get('pm2_5', 0),
            'PM10': components.get('pm10', 0),
            'NO2': components.get('no2', 0),
            'SO2': components.get('so2', 0),
            'CO': components.get('co', 0) / 1000,  # Convert to mg/m³ if needed, OWM is usually in μg/m³
            'O3': components.get('o3', 0)
        }
        
        return {
            'success': True,
            'source': 'openweathermap',
            'city': city,
            'coordinates': {'lat': lat, 'lon': lon},
            'aqi': aqi_value,
            'category': aqi_info['category'],
            'color': aqi_info['color'],
            'emoji': aqi_info['emoji'],
            'description': aqi_info['description'],
            'health_advice': aqi_info['health_advice'],
            'pollutants': pollutants,
            'timestamp': datetime.now().isoformat()
        }
        
    except requests.exceptions.RequestException as e:
        print(f"OpenWeatherMap API Request Error: {e}")
        return None
    except Exception as e:
        print(f"Error parsing OpenWeatherMap data: {e}")
        return None

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # ... (This function remains unchanged)
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict_aqi():
    """Predict AQI based on pollutant values"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Prepare input with defaults for weather parameters
        input_data = {
            'PM2.5': float(data['PM2.5']),
            'PM10': float(data['PM10']),
            'NO2': float(data['NO2']),
            'SO2': float(data['SO2']),
            'CO': float(data['CO']),
            'O3': float(data['O3']),
            'Temperature': float(data.get('Temperature', 25)),
            'Humidity': float(data.get('Humidity', 60)),
            'Wind_Speed': float(data.get('Wind_Speed', 5)),
            'Pressure': float(data.get('Pressure', 1013))
        }
        
        # --- FIX FOR USERWARNING: Create a Pandas DataFrame with explicit feature names ---
        # This ensures the input to the model matches the training data format and order
        if feature_names is None:
            return jsonify({'error': 'ML model features not loaded.'}), 500

        predict_df = pd.DataFrame([input_data], columns=feature_names)

        # Make prediction
        if 'Linear' in str(type(model)): # Check if the model is LinearRegression
            # For Linear Regression, input needs to be scaled
            features_scaled = scaler.transform(predict_df) # Pass DataFrame to scaler
            prediction = model.predict(features_scaled)[0]
        else:
            # For tree-based models like RandomForest, input does not need to be scaled
            # and can be a DataFrame directly (recommended to avoid UserWarning)
            prediction = model.predict(predict_df)[0]
        
        prediction = max(0, min(500, prediction))  # Clamp between 0-500
        
        # Get AQI info
        aqi_info = get_aqi_info(prediction)
        
        # Calculate pollutant contributions
        pollutants_for_contribution = {k: v for k, v in input_data.items() if k in required_fields}
        contributions = calculate_pollutant_contribution(pollutants_for_contribution)
        
        return jsonify({
            'success': True,
            'aqi': round(prediction, 1),
            'category': aqi_info['category'],
            'color': aqi_info['color'],
            'emoji': aqi_info['emoji'],
            'level': aqi_info['level'],
            'description': aqi_info['description'],
            'health_advice': aqi_info['health_advice'],
            'pollutants': input_data,
            'contributions': contributions,
            'timestamp': datetime.now().isoformat()
        })
        
    except ValueError as e:
        return jsonify({'error': f'Invalid input values: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/realtime', methods=['GET'])
def get_realtime_aqi():
    """
    Fetch real-time AQI data.
    Prioritizes IQAir, falls back to OpenWeatherMap.
    """
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        city = request.args.get('city', 'London')
        
        # --- Try IQAir first ---
        iqair_data = get_realtime_aqi_iqair(city=city, lat=lat, lon=lon)
        if iqair_data and iqair_data.get('success'):
            return jsonify(iqair_data)
            
        # --- FALLBACK: If IQAir fails or key not set, use OpenWeatherMap ---
        print("Falling back to OpenWeatherMap...")
        openweathermap_data = get_realtime_aqi_openweathermap(city=city, lat=lat, lon=lon)
        if openweathermap_data and openweathermap_data.get('success'):
            return jsonify(openweathermap_data)
        
        # If both fail, return an error
        return jsonify({
            'success': False,
            'error': 'Failed to fetch real-time AQI data from both IQAir and OpenWeatherMap APIs. Check API keys and network connection.'
        }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """Generate AQI forecast for next 24 hours (simulated)"""
    # ... (This function remains unchanged)
    try:
        city = request.args.get('city', 'London')
        current_aqi = request.args.get('current_aqi', 75, type=float)
        
        # Generate simulated forecast
        forecast = []
        base_time = datetime.now()
        
        for i in range(24):
            # Add random variation
            variation = np.random.normal(0, 10)
            aqi = max(0, min(500, current_aqi + variation))
            aqi_info = get_aqi_info(aqi)
            
            forecast.append({
                'time': (base_time + timedelta(hours=i)).isoformat(),
                'hour': (base_time + timedelta(hours=i)).strftime('%H:%M'),
                'aqi': round(aqi, 1),
                'category': aqi_info['category'],
                'color': aqi_info['color']
            })
            
            # Slight trend for next iteration
            current_aqi = aqi
        
        return jsonify({
            'success': True,
            'city': city,
            'forecast': forecast,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/historical', methods=['GET'])
def get_historical():
    """Generate historical AQI data (simulated)"""
    # ... (This function remains unchanged)
    try:
        days = request.args.get('days', 7, type=int)
        
        historical = []
        base_aqi = np.random.uniform(50, 150)
        
        for i in range(days * 24):
            date = datetime.now() - timedelta(hours=(days * 24 - i))
            
            # Create realistic variation
            hour = date.hour
            # Higher pollution during rush hours
            if hour in [7, 8, 9, 17, 18, 19]:
                variation = np.random.normal(20, 10)
            else:
                variation = np.random.normal(0, 15)
            
            aqi = max(0, min(500, base_aqi + variation))
            aqi_info = get_aqi_info(aqi)
            
            historical.append({
                'timestamp': date.isoformat(),
                'date': date.strftime('%Y-%m-%d'),
                'hour': date.strftime('%H:%M'),
                'aqi': round(aqi, 1),
                'category': aqi_info['category'],
                'color': aqi_info['color']
            })
        
        # Group by day for daily averages
        daily_avg = {}
        for record in historical:
            date = record['date']
            if date not in daily_avg:
                daily_avg[date] = []
            daily_avg[date].append(record['aqi'])
        
        daily_data = [
            {
                'date': date,
                'aqi': round(np.mean(values), 1),
                'min': round(min(values), 1),
                'max': round(max(values), 1)
            }
            for date, values in daily_avg.items()
        ]
        
        return jsonify({
            'success': True,
            'hourly': historical,
            'daily': sorted(daily_data, key=lambda x: x['date']),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cities', methods=['GET'])
def get_cities():
    """Get list of major cities with AQI data"""
    # ... (This function remains unchanged)
    cities = [
        {'name': 'London', 'country': 'UK', 'lat': 51.5074, 'lon': -0.1278},
        {'name': 'New York', 'country': 'USA', 'lat': 40.7128, 'lon': -74.0060},
        {'name': 'Delhi', 'country': 'India', 'lat': 28.7041, 'lon': 77.1025},
        {'name': 'Beijing', 'country': 'China', 'lat': 39.9042, 'lon': 116.4074},
        {'name': 'Tokyo', 'country': 'Japan', 'lat': 35.6762, 'lon': 139.6503},
        {'name': 'Los Angeles', 'country': 'USA', 'lat': 34.0522, 'lon': -118.2437},
        {'name': 'Mumbai', 'country': 'India', 'lat': 19.0760, 'lon': 72.8777},
        {'name': 'Paris', 'country': 'France', 'lat': 48.8566, 'lon': 2.3522},
    ]
    
    return jsonify({
        'success': True,
        'cities': cities
    })

# ============================================
# RUN APP
# ============================================

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], port=5000)