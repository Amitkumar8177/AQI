import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

print("🚀 Starting AQI Model Training Pipeline...\n")

# ============================================
# 1. LOAD AND EXPLORE DATA
# ============================================
print("📂 Loading dataset...")
df = pd.read_csv('aqi_dataset.csv')

print(f"✅ Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"\n📊 First 5 rows:\n{df.head()}\n")

# Check for missing values
print(f"🔍 Missing values:\n{df.isnull().sum()}\n")

# ============================================
# 2. DATA PREPROCESSING
# ============================================
print("🧹 Preprocessing data...")

# Select features
feature_columns = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 
                   'Temperature', 'Humidity', 'Wind_Speed', 'Pressure']
target_column = 'AQI'

X = df[feature_columns]
y = df[target_column]

# Handle outliers (optional - cap extreme values)
for col in feature_columns:
    q99 = X[col].quantile(0.99)
    X[col] = X[col].clip(upper=q99)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"✅ Train set: {X_train.shape[0]} samples")
print(f"✅ Test set: {X_test.shape[0]} samples\n")

# Feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ============================================
# 3. MODEL TRAINING
# ============================================
print("🤖 Training models...\n")

models = {
    'Linear Regression': LinearRegression(),
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
}

results = {}

for name, model in models.items():
    print(f"Training {name}...")
    
    # Train model
    if name == 'Linear Regression':
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
    else:
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
    
    # Evaluate
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    results[name] = {
        'model': model,
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'predictions': y_pred
    }
    
    print(f"  ✓ MAE: {mae:.2f}")
    print(f"  ✓ RMSE: {rmse:.2f}")
    print(f"  ✓ R² Score: {r2:.4f}\n")

# ============================================
# 4. SELECT BEST MODEL
# ============================================
best_model_name = min(results, key=lambda x: results[x]['rmse'])
best_model = results[best_model_name]['model']

print(f"🏆 Best Model: {best_model_name}")
print(f"   MAE: {results[best_model_name]['mae']:.2f}")
print(f"   RMSE: {results[best_model_name]['rmse']:.2f}")
print(f"   R²: {results[best_model_name]['r2']:.4f}\n")

# ============================================
# 5. FEATURE IMPORTANCE (for tree-based models)
# ============================================
if best_model_name in ['Random Forest', 'Gradient Boosting']:
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("📊 Feature Importance:")
    print(feature_importance.to_string(index=False))
    print()

# ============================================
# 6. SAVE MODEL AND SCALER
# ============================================
print("💾 Saving model and scaler...")

joblib.dump(best_model, 'aqi_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

# Save feature names
joblib.dump(feature_columns, 'feature_names.pkl')

print("✅ Model saved as: aqi_model.pkl")
print("✅ Scaler saved as: scaler.pkl")
print("✅ Features saved as: feature_names.pkl\n")

# ============================================
# 7. VISUALIZATIONS
# ============================================
print("📈 Generating visualizations...\n")

plt.style.use('seaborn-v0_8-darkgrid')
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Plot 1: Actual vs Predicted
axes[0, 0].scatter(y_test, results[best_model_name]['predictions'], alpha=0.5)
axes[0, 0].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
axes[0, 0].set_xlabel('Actual AQI')
axes[0, 0].set_ylabel('Predicted AQI')
axes[0, 0].set_title(f'Actual vs Predicted AQI ({best_model_name})')

# Plot 2: Residuals
residuals = y_test - results[best_model_name]['predictions']
axes[0, 1].scatter(results[best_model_name]['predictions'], residuals, alpha=0.5)
axes[0, 1].axhline(y=0, color='r', linestyle='--')
axes[0, 1].set_xlabel('Predicted AQI')
axes[0, 1].set_ylabel('Residuals')
axes[0, 1].set_title('Residual Plot')

# Plot 3: Model Comparison
model_names = list(results.keys())
mae_scores = [results[m]['mae'] for m in model_names]
axes[1, 0].bar(model_names, mae_scores, color=['#3b82f6', '#10b981', '#f59e0b'])
axes[1, 0].set_ylabel('Mean Absolute Error')
axes[1, 0].set_title('Model Comparison (MAE)')
axes[1, 0].tick_params(axis='x', rotation=45)

# Plot 4: Feature Importance
if best_model_name in ['Random Forest', 'Gradient Boosting']:
    top_features = feature_importance.head(8)
    axes[1, 1].barh(top_features['feature'], top_features['importance'])
    axes[1, 1].set_xlabel('Importance')
    axes[1, 1].set_title('Top Feature Importance')
else:
    axes[1, 1].text(0.5, 0.5, 'Feature importance not available\nfor Linear Regression', 
                    ha='center', va='center', fontsize=12)
    axes[1, 1].axis('off')

plt.tight_layout()
plt.savefig('model_evaluation.png', dpi=300, bbox_inches='tight')
print("✅ Saved visualization: model_evaluation.png")

# ============================================
# 8. TEST PREDICTION
# ============================================
print("\n🧪 Testing prediction with sample data...\n")

sample_data = {
    'PM2.5': 35.5,
    'PM10': 50.0,
    'NO2': 20.0,
    'SO2': 5.0,
    'CO': 0.5,
    'O3': 30.0,
    'Temperature': 25.0,
    'Humidity': 60.0,
    'Wind_Speed': 5.0,
    'Pressure': 1013.0
}

sample_df = pd.DataFrame([sample_data])

if best_model_name == 'Linear Regression':
    sample_scaled = scaler.transform(sample_df)
    prediction = best_model.predict(sample_scaled)[0]
else:
    prediction = best_model.predict(sample_df)[0]

def get_aqi_category(aqi):
    if aqi <= 50:
        return "Good", "🟢"
    elif aqi <= 100:
        return "Moderate", "🟡"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups", "🟠"
    elif aqi <= 200:
        return "Unhealthy", "🔴"
    elif aqi <= 300:
        return "Very Unhealthy", "🟣"
    else:
        return "Hazardous", "🟤"

category, emoji = get_aqi_category(prediction)

print(f"Sample Input:")
for key, value in sample_data.items():
    print(f"  {key}: {value}")

print(f"\n{emoji} Predicted AQI: {prediction:.1f}")
print(f"   Category: {category}")

print("\n" + "="*50)
print("✅ MODEL TRAINING COMPLETE!")
print("="*50)