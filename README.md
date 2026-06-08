# Smart Pune Real Estate Analytics Platform 🏠📈

**Live Demo**: [https://smart-pune-real-estate-analytics.vercel.app/](https://smart-pune-real-estate-analytics.vercel.app/)

A high-performance, full-stack real estate analytics dashboard and machine learning valuation engine for Pune properties. This platform allows users to estimate property prices using an advanced XGBoost regression model and explore location benchmarks, historical trends, side-by-side area comparisons, and budget-based investment options.

---

## 🚀 Key Features

1. **🏠 ML Valuation Engine**: Estimates house values based on location, built-up area (sqft), BHK, bathrooms, age, and garage facilities using a trained **XGBoost Regressor** ($R^2$ Score: **`0.9967`**).
2. **📊 Location Analytics**: Visualizes average property values, price per sqft, and BHK distributions across major Pune zones (Koregaon Park, Kalyani Nagar, Viman Nagar, Hinjewadi, and Pimpri-Chinchwad).
3. **📈 Price Appreciation Trends**: Interactive line charts showing price tracking (2018-2024) and YoY compound growth rates.
4. **🔍 Side-by-Side Comparison**: Metrics-rich tool comparing average price, size, building age, minimum/maximum price bounds, and historical appreciation between two selected areas.
5. **💡 Budget Recommender**: A recommendation engine that analyzes your budget, warns you if your budget is below market entry level, and dynamically recommends the best BHK and location matches.

---

## 🛠️ Technology Stack

- **Frontend**: React (ES6+), Tailwind CSS v4, Recharts, Lucide Icons, Vite
- **Backend API**: FastAPI (Python), Uvicorn
- **Machine Learning**: XGBoost, Scikit-Learn (Random Forest, Linear Regression, StandardScaler, LabelEncoder)
- **Data Engineering**: Pandas, NumPy

---

## 📂 Project Architecture

```
smart-pune-real-estate-analytics/
├── house-price-predictor/
│   ├── backend/
│   │   ├── main.py            # FastAPI prediction & analytics REST API
│   │   ├── train.py           # ML Model training, feature engineering, & serialization
│   │   ├── house_model.pkl    # Serialized best XGBoost model
│   │   ├── scaler.pkl         # Serialized StandardScaler preprocessor
│   │   ├── encoder.pkl        # Serialized LabelEncoder for areas
│   │   ├── model_metrics.json # Stored benchmark metrics & feature importances
│   │   └── requirements.txt   # Python packages
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx        # Glassmorphic React dashboard layout
│       │   ├── index.css      # Core styles & Tailwind CSS v4 variables
│       │   ├── main.jsx       # React mount point
│       │   └── favicon.svg    # App tab icon
│       ├── package.json       # Node dependencies
│       └── postcss.config.js  # PostCSS Tailwind adapter
├── pune_house_prices.csv      # Real estate dataset (15,000 records)
├── start.bat                  # One-click Windows startup script
└── README.md                  # Project documentation (Root)
```

---

## ⚙️ Installation & Local Setup

### 1. Backend & Machine Learning Pipeline
1. Navigate to the backend directory:
   ```bash
   cd house-price-predictor/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the ML pipeline to process data and train the models:
   ```bash
   python train.py
   ```
4. Start the API server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Frontend Development Server
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

*(Alternatively, on Windows, simply double-click the `start.bat` file in the root directory to run both servers simultaneously).*

---

## ☁️ Deployment Guide

### 1. Backend (FastAPI) on Render
1. Sign in to [Render](https://render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Root Directory**: `house-price-predictor/backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Click **Deploy Web Service**.

### 2. Frontend (React) on Vercel
1. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub repository.
3. Configure the project parameters:
   - **Root Directory**: `house-price-predictor/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set an Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `<YOUR_RENDER_BACKEND_URL>`
5. Click **Deploy**.
