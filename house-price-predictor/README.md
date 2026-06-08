# Pune House Price Predictor Web App

A modern, full-stack real estate price prediction dashboard for Pune properties. It utilizes machine learning models to estimate house values based on location, built-up area, number of bedrooms/bathrooms, construction year, and garage availability.

## Tech Stack
- **Frontend**: React + Tailwind CSS v4 + Recharts (for charts) + Lucide (for icons) + Vite (build tool)
- **Backend**: FastAPI + Uvicorn
- **Machine Learning**: Scikit-Learn (Random Forest, Linear Regression) + XGBoost

---

## Project Structure

```
house-price-predictor/
├── backend/
│   ├── main.py            # FastAPI Application & Predictor API
│   ├── train.py           # ML Model Training & Evaluation pipeline
│   ├── house_model.pkl    # Serialized best-performing ML model
│   ├── encoder.pkl        # Serialized LabelEncoder for location names
│   ├── model_metrics.json # Performance metrics and feature importances
│   └── requirements.txt   # Backend python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # React Main App (Dashboard UI)
│   │   ├── index.css      # Core styles & Tailwind CSS v4 theme config
│   │   ├── main.jsx       # React Entry point
│   │   └── favicon.svg    # Tab icon
│   └── package.json       # Frontend packages & scripts
└── README.md              # Documentation
```

---

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+ & npm

### 1. Backend Setup & Model Training
First, navigate to the `backend` directory, install python packages, train the models, and run the API server.

```bash
# Go to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the training pipeline (trains XGBoost, Random Forest, & Linear Regression)
# Evaluates each model, choose the best one, and saves outputs.
python train.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
The backend API documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
In a new terminal, navigate to the `frontend` directory, install package dependencies, and start the Vite development server.

```bash
# Go to frontend directory
cd frontend

# Install package dependencies
npm install

# Start the development server
npm run dev
```
Open your browser and navigate to the address shown in the output (usually `http://localhost:5173`).

---

## API Endpoints

### 1. `GET /metadata`
Returns lists of supported areas, trained model metrics comparison, selected best model, and feature importances.
- **Response Format**:
```json
{
  "best_model": "Linear Regression",
  "best_r2": 0.812,
  "best_mae": 580000.0,
  "models": [
    { "name": "XGBoost", "r2_score": 0.8954, "mae": 425000.0 },
    ...
  ],
  "feature_importances": [
    { "feature": "Square Feet", "importance": 0.48 },
    ...
  ],
  "areas": ["Baner", "Hinjewadi", ...]
}
```

### 2. `POST /predict`
Estimates the valuation based on inputted features.
- **Request Format**:
```json
{
  "area": "Viman Nagar",
  "square_feet": 1500.0,
  "num_bedrooms": 3,
  "num_bathrooms": 2,
  "year_built": 2015,
  "has_garage": true
}
```
- **Response Format**:
```json
{
  "predicted_price": 5432100.0,
  "model_used": "XGBoost",
  "r2_score": 0.8954
}
```
