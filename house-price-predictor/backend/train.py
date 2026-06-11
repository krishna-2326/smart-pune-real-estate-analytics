import os
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import xgboost as xgb

def main():
    print("Starting Model Training Pipeline...")
    
    # 1. Load Dataset from absolute path
    csv_path = "c:/Users/Krishna Gite/Desktop/pune_house/pune_house_prices.csv"
    print(f"Loading dataset directly from: {csv_path}")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Could not find the dataset at the specified path: {csv_path}")
        
    df = pd.read_csv(csv_path)
    
    # Drop 'id' column if it exists
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
        
    print(f"Dataset shape: {df.shape}")
    print("Columns:", df.columns.tolist())
    
    # 2. Encode categorical columns
    encoder = LabelEncoder()
    df['area_encoded'] = encoder.fit_transform(df['area'])
    
    # Save the encoder
    backend_dir = os.path.dirname(os.path.abspath(__file__)) if __file__ else "."
    encoder_path = os.path.join(backend_dir, "encoder.pkl")
    with open(encoder_path, "wb") as f:
        pickle.dump(encoder, f)
    print(f"Saved LabelEncoder to {encoder_path}")
    
    # 3. Feature Engineering
    print("Performing feature engineering...")
    df['sqft_per_room'] = df['square_feet'] / (df['num_bedrooms'] + df['num_bathrooms'] + 1)
    df['property_age'] = 2026 - df['year_built']
    df['sqft_x_beds'] = df['square_feet'] * df['num_bedrooms']
    df['sqft_x_baths'] = df['square_feet'] * df['num_bathrooms']
    
    # Define feature columns
    feature_cols = [
        'area_encoded', 'square_feet', 'num_bedrooms', 'num_bathrooms', 
        'year_built', 'has_garage', 'sqft_per_room', 'property_age', 
        'sqft_x_beds', 'sqft_x_baths'
    ]
    X = df[feature_cols]
    y = df['price']
    
    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Standard Scaling
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save the scaler
    scaler_path = os.path.join(backend_dir, "scaler.pkl")
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    print(f"Saved StandardScaler to {scaler_path}")
    
    X_train_scaled_df = pd.DataFrame(X_train_scaled, columns=feature_cols)
    X_test_scaled_df = pd.DataFrame(X_test_scaled, columns=feature_cols)
    
    # 5. Define Models with Regularization to prevent overfitting
    models = {
        "XGBoost": xgb.XGBRegressor(
            n_estimators=120, 
            learning_rate=0.07, 
            max_depth=4,             # Limit depth to prevent complex overfitting
            subsample=0.8,           # Use 80% of rows for each tree
            colsample_bytree=0.8,    # Use 80% of columns for each tree
            reg_lambda=15.0,         # L2 regularization strength
            reg_alpha=5.0,           # L1 regularization strength
            random_state=42,
            n_jobs=-1
        ),
        "Random Forest": RandomForestRegressor(
            n_estimators=100, 
            max_depth=8,             # Limit depth to control complexity
            min_samples_split=12,    # Minimum samples required to split node
            min_samples_leaf=6,      # Minimum samples required at leaf node
            random_state=42,
            n_jobs=-1
        ),
        "Linear Regression": LinearRegression()
    }
    
    metrics = {}
    trained_models = {}
    
    # Train and evaluate each model
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_scaled_df, y_train)
        
        # Training evaluation
        train_preds = model.predict(X_train_scaled_df)
        train_r2 = r2_score(y_train, train_preds)
        
        # Testing evaluation
        test_preds = model.predict(X_test_scaled_df)
        test_r2 = r2_score(y_test, test_preds)
        test_mae = mean_absolute_error(y_test, test_preds)
        
        print(f"{name} -> Train R2: {train_r2:.4f}, Test R2: {test_r2:.4f}, Test MAE: {test_mae:.2f}")
        
        metrics[name] = {
            "r2_score": float(test_r2),
            "mae": float(test_mae)
        }
        trained_models[name] = model
        
    # Select the best performing model based on Test R2 score
    best_model_name = max(metrics, key=lambda k: metrics[k]["r2_score"])
    best_model = trained_models[best_model_name]
    best_r2 = metrics[best_model_name]["r2_score"]
    best_mae = metrics[best_model_name]["mae"]
    
    print(f"\nBest Performing Model: {best_model_name} with Test R2: {best_r2:.4f}")
    
    # Save the best model
    model_path = os.path.join(backend_dir, "house_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(best_model, f)
    print(f"Saved best model ({best_model_name}) to {model_path}")
    
    # 6. Extract Feature Importances for the best model
    ui_feature_names = {
        'area_encoded': 'Location (Encoded)',
        'square_feet': 'Square Feet',
        'num_bedrooms': 'Bedrooms',
        'num_bathrooms': 'Bathrooms',
        'year_built': 'Year Built',
        'has_garage': 'Has Garage',
        'sqft_per_room': 'Sqft per Room',
        'property_age': 'Property Age',
        'sqft_x_beds': 'Sqft x Beds Interaction',
        'sqft_x_baths': 'Sqft x Baths Interaction'
    }
    
    importances = []
    if hasattr(best_model, "feature_importances_"):
        raw_importances = best_model.feature_importances_
        total_imp = np.sum(raw_importances)
        if total_imp > 0:
            raw_importances = raw_importances / total_imp
        for col, imp in zip(feature_cols, raw_importances):
            importances.append({
                "feature": ui_feature_names[col],
                "importance": float(imp)
            })
    elif best_model_name == "Linear Regression":
        raw_importances = np.abs(best_model.coef_)
        total_imp = np.sum(raw_importances)
        if total_imp > 0:
            raw_importances = raw_importances / total_imp
        for col, imp in zip(feature_cols, raw_importances):
            importances.append({
                "feature": ui_feature_names[col],
                "importance": float(imp)
            })
            
    importances = sorted(importances, key=lambda x: x['importance'], reverse=True)
    
    # 7. Save metadata and metrics
    metadata = {
        "best_model": best_model_name,
        "best_r2": best_r2,
        "best_mae": best_mae,
        "models": [
            {"name": name, "r2_score": m["r2_score"], "mae": m["mae"]}
            for name, m in metrics.items()
        ],
        "feature_importances": importances,
        "areas": sorted(df['area'].unique().tolist())
    }
    
    metrics_path = os.path.join(backend_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"Saved model metrics and metadata to {metrics_path}")
    print("Training pipeline completed successfully!")

if __name__ == "__main__":
    main()
