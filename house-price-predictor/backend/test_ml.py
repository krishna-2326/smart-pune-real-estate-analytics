import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import r2_score
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb

df = pd.read_csv("c:/Users/Krishna Gite/Desktop/pune_house/pune_house_prices.csv")
if 'id' in df.columns:
    df = df.drop(columns=['id'])

# Encode
le = LabelEncoder()
df['area_encoded'] = le.fit_transform(df['area'])

# 1. Base features R2
X = df[['area_encoded', 'square_feet', 'num_bedrooms', 'num_bathrooms', 'year_built', 'has_garage']]
y = df['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
base_r2 = r2_score(y_test, model.predict(X_test))
print(f"Base XGBoost R2: {base_r2:.4f}")

# 2. Outlier Removal (Price between 5th and 95th percentile)
p_low = df['price'].quantile(0.05)
p_high = df['price'].quantile(0.95)
df_clean = df[(df['price'] >= p_low) & (df['price'] <= p_high)]
X_c = df_clean[['area_encoded', 'square_feet', 'num_bedrooms', 'num_bathrooms', 'year_built', 'has_garage']]
y_c = df_clean['price']
X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_c, y_c, test_size=0.2, random_state=42)

model_c = xgb.XGBRegressor(n_estimators=100, random_state=42)
model_c.fit(X_train_c, y_train_c)
clean_r2 = r2_score(y_test_c, model_c.predict(X_test_c))
print(f"Cleaned Outliers R2: {clean_r2:.4f}")

# 3. Add Feature Engineering
df_eng = df.copy()
df_eng['sqft_per_room'] = df_eng['square_feet'] / (df_eng['num_bedrooms'] + df_eng['num_bathrooms'] + 1)
df_eng['age'] = 2026 - df_eng['year_built']
df_eng['sqft_x_beds'] = df_eng['square_feet'] * df_eng['num_bedrooms']
df_eng['sqft_x_baths'] = df_eng['square_feet'] * df_eng['num_bathrooms']

X_e = df_eng[['area_encoded', 'square_feet', 'num_bedrooms', 'num_bathrooms', 'year_built', 'has_garage', 'sqft_per_room', 'age', 'sqft_x_beds', 'sqft_x_baths']]
y_e = df_eng['price']
X_train_e, X_test_e, y_train_e, y_test_e = train_test_split(X_e, y_e, test_size=0.2, random_state=42)

model_e = xgb.XGBRegressor(n_estimators=100, random_state=42)
model_e.fit(X_train_e, y_train_e)
eng_r2 = r2_score(y_test_e, model_e.predict(X_test_e))
print(f"Engineered Features R2: {eng_r2:.4f}")
