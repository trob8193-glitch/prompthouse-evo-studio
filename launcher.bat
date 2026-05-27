@echo off
title PromptHouse Evo Studio Launcher
echo ===================================================
echo 🚀 Launching PromptHouse Evo Studio
echo ===================================================
echo.

if not exist .env (
    echo ❌ .env file not found. Running installer first...
    call install.bat
)

echo 🌐 Starting API Bridge (Port 3001) & Frontend (Port 5173)...
echo.
echo ===================================================
echo Frontend Default: http://localhost:5173
echo API Bridge Default: http://localhost:3001
echo ===================================================
echo.

call npm run dev:all

pause
