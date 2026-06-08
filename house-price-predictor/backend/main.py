import os
import json
import pickle
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd

# Define directories and paths
backend_dir = os.path.dirname(os.path.abspath(__file__)) if __file__ else "."
model_path = os.path.join(backend_dir, "house_model.pkl")
encoder_path = os.path.join(backend_dir, "encoder.pkl")
scaler_path = os.path.join(backend_dir, "scaler.pkl")
metrics_path = os.path.join(backend_dir, "model_metrics.json")
dataset_path = "c:/Users/Krishna Gite/Desktop/pune_house/pune_house_prices.csv"

# Initialize FastAPI App
app = FastAPI(title="Smart Pune Real Estate Analytics API", version="2.2.0")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models, dataset, and cached stats
model = None
encoder = None
scaler = None
metadata = None
df_raw = None

# Cached analytics
market_summary_cache = {}
area_analytics_cache = {}
trends_cache = {}

def load_resources():
    global model, encoder, scaler, metadata, df_raw
    
    # Check if model files exist
    if not os.path.exists(model_path) or not os.path.exists(encoder_path) or not os.path.exists(scaler_path) or not os.path.exists(metrics_path):
        raise RuntimeError("Model files not found. Please run train.py first to train models and save scaling configs.")
        
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    with open(encoder_path, "rb") as f:
        encoder = pickle.load(f)
        
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
        
    with open(metrics_path, "r") as f:
        metadata = json.load(f)
        
    print("ML Resources loaded successfully.")
    
    # Load dataset for analytical queries
    if os.path.exists(dataset_path):
        df_raw = pd.read_csv(dataset_path)
        print(f"Dataset loaded successfully from: {dataset_path} (shape: {df_raw.shape})")
        compute_cached_analytics()
    else:
        print(f"Warning: Raw dataset not found at {dataset_path}. Analytics endpoints will be degraded.")

def compute_cached_analytics():
    global df_raw, market_summary_cache, area_analytics_cache, trends_cache
    if df_raw is None:
        return
        
    # Copy to avoid side-effects
    df = df_raw.copy()
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
        
    # Calculate price per sqft
    df['price_per_sqft'] = df['price'] / df['square_feet']
    
    # 1. Market Summary
    avg_price = float(df['price'].mean())
    
    # Area prices
    area_prices = df.groupby('area')['price'].mean()
    cheapest_area = str(area_prices.idxmin())
    cheapest_price = float(area_prices.min())
    expensive_area = str(area_prices.idxmax())
    expensive_price = float(area_prices.max())
    
    # Popular BHK
    popular_bhk = int(df['num_bedrooms'].mode()[0])
    
    market_summary_cache = {
        "total_properties": int(len(df)),
        "average_price": avg_price,
        "cheapest_area": cheapest_area,
        "cheapest_price": cheapest_price,
        "expensive_area": expensive_area,
        "expensive_price": expensive_price,
        "popular_bhk": popular_bhk
    }
    
    # 2. Area Analytics
    area_groups = df.groupby('area')
    area_stats = []
    for area_name, group in area_groups:
        area_stats.append({
            "area": str(area_name),
            "avg_price": float(group['price'].mean()),
            "avg_price_per_sqft": float(group['price_per_sqft'].mean()),
            "avg_size": float(group['square_feet'].mean()),
            "garage_pct": float(group['has_garage'].mean() * 100)
        })
        
    # Sort for affordable vs expensive list
    area_stats_sorted = sorted(area_stats, key=lambda x: x['avg_price'])
    affordable_areas = area_stats_sorted[:5]
    expensive_areas = area_stats_sorted[-5:][::-1]
    
    # BHK distribution
    bhk_groups = df.groupby('num_bedrooms')
    bhk_distribution = []
    for bhk_num, group in bhk_groups:
        bhk_distribution.append({
            "bhk": int(bhk_num),
            "count": int(len(group)),
            "avg_price": float(group['price'].mean())
        })
        
    area_analytics_cache = {
        "area_stats": area_stats,
        "affordable_areas": affordable_areas,
        "expensive_areas": expensive_areas,
        "bhk_distribution": bhk_distribution
    }
    
    # 3. Trends Analysis
    trend_group = df.groupby(['year_built', 'area'])['price'].mean().unstack().fillna(0)
    
    # Convert pivot table to list of dicts for Recharts
    trend_data = []
    for year in sorted(trend_group.index.tolist()):
        row = {"year": int(year)}
        for area_col in trend_group.columns:
            row[str(area_col)] = float(trend_group.loc[year, area_col])
        trend_data.append(row)
        
    # YoY growth rate per area
    min_year = df['year_built'].min()
    max_year = df['year_built'].max()
    
    early_years = df[df['year_built'] <= min_year + 5]
    recent_years = df[df['year_built'] >= max_year - 5]
    
    early_prices = early_years.groupby('area')['price'].mean()
    recent_prices = recent_years.groupby('area')['price'].mean()
    
    growth_rates = []
    for area_name in df['area'].unique():
        area_str = str(area_name)
        ep = early_prices.get(area_name, 1)
        rp = recent_prices.get(area_name, 0)
        growth_pct = ((rp - ep) / ep) * 100 if ep > 0 else 0.0
        growth_rates.append({
            "area": area_str,
            "growth_rate_pct": float(growth_pct),
            "early_price": float(ep),
            "recent_price": float(rp)
        })
        
    # Best areas to invest (sorted by growth rate descending)
    best_investments = sorted(growth_rates, key=lambda x: x['growth_rate_pct'], reverse=True)
    
    trends_cache = {
        "trend_data": trend_data,
        "growth_rates": growth_rates,
        "best_investments": best_investments[:5]
    }
    
    print("Analytics metrics calculated and cached.")

# Startup handler
@app.on_event("startup")
def startup_event():
    try:
        load_resources()
    except Exception as e:
        print(f"Startup Warning: {str(e)}")

# Pydantic models
class PredictionRequest(BaseModel):
    area: str = Field(..., example="Viman Nagar")
    square_feet: float = Field(..., gt=0, example=1500)
    num_bedrooms: int = Field(..., ge=1, le=10, example=3)
    num_bathrooms: int = Field(..., ge=1, le=10, example=3)
    year_built: int = Field(..., ge=1980, le=2026, example=2015)
    has_garage: bool = Field(..., example=True)

class PredictionResponse(BaseModel):
    predicted_price: float
    model_used: str
    r2_score: float

# REST API Endpoints

@app.get("/")
def read_root():
    return {"message": "Smart Pune Real Estate Analytics API is running!"}

@app.get("/metadata")
def get_metadata():
    if metadata is None:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Model files not available: {str(e)}")
    return metadata

@app.get("/api/market-summary")
def get_market_summary():
    if not market_summary_cache:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Analytics data not ready.")
    return market_summary_cache

@app.get("/api/area-analytics")
def get_area_analytics():
    if not area_analytics_cache:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Analytics data not ready.")
    return area_analytics_cache

@app.get("/api/trends")
def get_trends():
    if not trends_cache:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Analytics data not ready.")
    return trends_cache

@app.get("/api/compare")
def compare_areas(
    area1: str = Query(..., description="First area to compare"),
    area2: str = Query(..., description="Second area to compare")
):
    global df_raw, trends_cache
    if df_raw is None:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Database not loaded.")
            
    df = df_raw.copy()
    df['price_per_sqft'] = df['price'] / df['square_feet']
    df['property_age'] = 2026 - df['year_built']
    
    # Calculate stats for Area 1
    grp1 = df[df['area'].str.lower() == area1.lower()]
    # Calculate stats for Area 2
    grp2 = df[df['area'].str.lower() == area2.lower()]
    
    if len(grp1) == 0:
        raise HTTPException(status_code=400, detail=f"Area '{area1}' was not found in our records.")
    if len(grp2) == 0:
        raise HTTPException(status_code=400, detail=f"Area '{area2}' was not found in our records.")
        
    # Get growth rates if cached
    growth1 = 0.0
    growth2 = 0.0
    if trends_cache and "growth_rates" in trends_cache:
        for rate in trends_cache["growth_rates"]:
            if rate["area"].lower() == area1.lower():
                growth1 = rate["growth_rate_pct"]
            if rate["area"].lower() == area2.lower():
                growth2 = rate["growth_rate_pct"]
                
    # Most common BHK count
    popular_bhk1 = int(grp1['num_bedrooms'].mode()[0]) if len(grp1) > 0 else 0
    popular_bhk2 = int(grp2['num_bedrooms'].mode()[0]) if len(grp2) > 0 else 0
        
    return {
        "area1": {
            "name": str(grp1['area'].iloc[0]),
            "avg_price": float(grp1['price'].mean()),
            "avg_price_per_sqft": float(grp1['price_per_sqft'].mean()),
            "avg_size": float(grp1['square_feet'].mean()),
            "garage_pct": float(grp1['has_garage'].mean() * 100),
            "avg_beds": float(grp1['num_bedrooms'].mean()),
            "avg_baths": float(grp1['num_bathrooms'].mean()),
            "avg_age": float(grp1['property_age'].mean()),
            "min_price": float(grp1['price'].min()),
            "max_price": float(grp1['price'].max()),
            "growth_rate_pct": growth1,
            "popular_bhk": popular_bhk1,
            "sample_count": int(len(grp1))
        },
        "area2": {
            "name": str(grp2['area'].iloc[0]),
            "avg_price": float(grp2['price'].mean()),
            "avg_price_per_sqft": float(grp2['price_per_sqft'].mean()),
            "avg_size": float(grp2['square_feet'].mean()),
            "garage_pct": float(grp2['has_garage'].mean() * 100),
            "avg_beds": float(grp2['num_bedrooms'].mean()),
            "avg_baths": float(grp2['num_bathrooms'].mean()),
            "avg_age": float(grp2['property_age'].mean()),
            "min_price": float(grp2['price'].min()),
            "max_price": float(grp2['price'].max()),
            "growth_rate_pct": growth2,
            "popular_bhk": popular_bhk2,
            "sample_count": int(len(grp2))
        }
    }

@app.get("/api/recommend")
def recommend_properties(budget: float = Query(..., gt=0, description="User's total budget in ₹")):
    global df_raw
    if df_raw is None:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Database not loaded.")
            
    df = df_raw.copy()
    
    # Filter properties under budget
    in_budget_df = df[df['price'] <= budget]
    
    if len(in_budget_df) == 0:
        # Budget is too low. Find cheapest property in dataset
        cheapest_idx = df['price'].idxmin()
        cheapest_row = df.loc[cheapest_idx]
        return {
            "budget_status": "low",
            "message": f"Your budget is below the minimum entry price in Pune. The cheapest available property is in {cheapest_row['area']} starting at ₹{(cheapest_row['price']/100000):.1f} Lakhs.",
            "cheapest_area": cheapest_row['area'],
            "cheapest_price": float(cheapest_row['price']),
            "required_additional": float(cheapest_row['price'] - budget)
        }
        
    # Group by area to find best matches
    areas = df['area'].unique()
    candidates = []
    
    for area_name in areas:
        area_str = str(area_name)
        area_df = df[df['area'] == area_name]
        
        # Find the highest BHK in this area that is within budget on average
        bhk_prices = area_df.groupby('num_bedrooms')['price'].mean()
        valid_bhks = [bhk for bhk, price in bhk_prices.items() if price <= budget]
        
        if not valid_bhks:
            continue
            
        expected_bhk = max(valid_bhks)
        
        # Filter properties in this area with exactly this BHK count
        target_bhk_df = area_df[area_df['num_bedrooms'] == expected_bhk]
        
        # Calculate stats for this specific layout
        avg_p = target_bhk_df['price'].mean()
        avg_size = target_bhk_df['square_feet'].mean()
        
        # Value score = sqft per rupee
        value_score = avg_size / avg_p if avg_p > 0 else 0
        
        candidates.append({
            "area": area_str,
            "avg_price": float(avg_p),
            "expected_bhk": int(expected_bhk),
            "value_score": float(value_score),
            "avg_size": float(avg_size),
            "listings_count": int(len(target_bhk_df))
        })
        
    if not candidates:
        # Fallback if no matching BHK found
        cheapest_idx = df['price'].idxmin()
        cheapest_row = df.loc[cheapest_idx]
        return {
            "budget_status": "low",
            "message": f"Your budget is below the minimum entry price in Pune. The cheapest available property is in {cheapest_row['area']} starting at ₹{(cheapest_row['price']/100000):.1f} Lakhs.",
            "cheapest_area": cheapest_row['area'],
            "cheapest_price": float(cheapest_row['price']),
            "required_additional": float(cheapest_row['price'] - budget)
        }
        
    # Sort candidates:
    # 1. Recommendation: sort by avg_price descending (closest to budget, meaning they get the best possible property within budget)
    candidates_by_price = sorted(candidates, key=lambda x: x["avg_price"], reverse=True)
    best_recommendation = candidates_by_price[0]
    
    # 2. Value for money: sort by value score descending (sqft per rupee)
    candidates_by_value = sorted(candidates, key=lambda x: x["value_score"], reverse=True)
    value_for_money = candidates_by_value[0]
    
    return {
        "budget_status": "ok",
        "budget": budget,
        "recommendation": best_recommendation,
        "value_for_money": value_for_money,
        "candidates": candidates_by_price[:3]
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    global model, encoder, scaler, metadata
    
    # Load resources if not ready
    if model is None or encoder is None or scaler is None or metadata is None:
        try:
            load_resources()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Model resources not ready: {str(e)}")
            
    # Encode Area
    try:
        area_encoded = encoder.transform([request.area])[0]
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail=f"Area '{request.area}' is not supported. Please choose from: {metadata.get('areas', [])}"
        )
        
    # Encode Garage
    garage_encoded = 1 if request.has_garage else 0
    
    # Calculate engineered features
    square_feet = request.square_feet
    num_bedrooms = request.num_bedrooms
    num_bathrooms = request.num_bathrooms
    year_built = request.year_built
    
    sqft_per_room = square_feet / (num_bedrooms + num_bathrooms + 1)
    property_age = 2026 - year_built
    sqft_x_beds = square_feet * num_bedrooms
    sqft_x_baths = square_feet * num_bathrooms
    
    # Build raw feature array
    raw_features = np.array([[
        area_encoded,
        square_feet,
        num_bedrooms,
        num_bathrooms,
        year_built,
        garage_encoded,
        sqft_per_room,
        property_age,
        sqft_x_beds,
        sqft_x_baths
    ]])
    
    # Scale features
    try:
        scaled_features = scaler.transform(raw_features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scaling error: {str(e)}")
        
    # Run prediction
    try:
        prediction = model.predict(scaled_features)
        predicted_val = float(prediction[0])
        
        # Ensure price is non-negative
        predicted_val = max(0.0, predicted_val)
        
        return PredictionResponse(
            predicted_price=predicted_val,
            model_used=metadata["best_model"],
            r2_score=metadata["best_r2"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
