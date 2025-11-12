import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # API Keys
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
    IQAIR_API_KEY = os.getenv('IQAIR_API_KEY', '')
    
    # Model paths
    MODEL_PATH = os.path.join('..', 'ml_model', 'aqi_model.pkl')
    SCALER_PATH = os.path.join('..', 'ml_model', 'scaler.pkl')
    FEATURES_PATH = os.path.join('..', 'ml_model', 'feature_names.pkl')
    
    # MongoDB (optional)
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/aqi_db')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')