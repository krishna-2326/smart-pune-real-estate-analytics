@echo off
title Smart Pune Real Estate Analytics Platform Launcher
echo =======================================================
echo  Starting Smart Pune Real Estate Analytics Platform...
echo =======================================================
echo.

echo [1/2] Launching Backend FastAPI Server...
start "FastAPI Backend Server" cmd /k "cd house-price-predictor\backend && uvicorn main:app --port 8000"

echo [2/2] Launching Frontend React Dev Server...
start "Vite React Frontend" cmd /k "cd house-price-predictor\frontend && npm.cmd run dev"

echo.
echo =======================================================
echo  Success! Both servers are launching in separate windows.
echo  - Backend API will run on http://localhost:8000
echo  - Frontend Web UI will run on http://localhost:5173
echo =======================================================
echo.
echo Press any key to close this launcher.
pause > nul
