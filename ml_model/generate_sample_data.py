import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Generate synthetic AQI dataset
np.random.seed(42)

def calculate_aqi(pm25, pm10, no2, so2, co, o3):
    """Calculate AQI based on pollutant levels (simplified EPA formula)"""
    # Simplified AQI calculation (PM2.5 dominant)
    aqi_pm25 = pm25 * 4.0
    aqi_pm10 = pm10 * 0.8
    aqi_no2 = no2 * 0.5
    aqi_so2 = so2 * 0.3
    aqi_co = co * 0.1
    aqi_o3 = o3 * 1.5
    
    # Take maximum AQI
    aqi = max(aqi_pm25, aqi_pm10, aqi_no2, aqi_so2, aqi_co, aqi_o3)
    return min(aqi, 500)  # Cap at 500

# Generate 10000 samples
n_samples = 10000

data = {
    'PM2.5': np.random.gamma(2, 15, n_samples),  # Fine particulate matter
    'PM10': np.random.gamma(3, 20, n_samples),   # Coarse particulate matter
    'NO2': np.random.gamma(2, 10, n_samples),    # Nitrogen dioxide
    'SO2': np.random.gamma(1.5, 5, n_samples),   # Sulfur dioxide
    'CO': np.random.gamma(1, 0.5, n_samples),    # Carbon monoxide
    'O3': np.random.gamma(2, 12, n_samples),     # Ozone
    'Temperature': np.random.normal(25, 10, n_samples),
    'Humidity': np.random.uniform(30, 90, n_samples),
    'Wind_Speed': np.random.gamma(2, 3, n_samples),
    'Pressure': np.random.normal(1013, 10, n_samples),
}

df = pd.DataFrame(data)

# Calculate AQI
df['AQI'] = df.apply(lambda row: calculate_aqi(
    row['PM2.5'], row['PM10'], row['NO2'], 
    row['SO2'], row['CO'], row['O3']
), axis=1)

# Add timestamps
start_date = datetime.now() - timedelta(days=365)
df['Timestamp'] = [start_date + timedelta(hours=i) for i in range(n_samples)]

# Save dataset
df.to_csv('aqi_dataset.csv', index=False)
print(f"✅ Generated dataset with {n_samples} samples")
print(f"📊 AQI Statistics:\n{df['AQI'].describe()}")
print(f"\n📁 Saved to: aqi_dataset.csv")