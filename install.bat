@echo off
title PromptHouse Evo Studio Setup
echo ===================================================
echo 🚀 PromptHouse Evo Studio Setup
echo ===================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed on this system.
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo 📦 Installing dependencies (npm install)...
call npm install

if not exist .env (
    echo 📁 Creating .env configuration file...
    copy .env.example .env
    echo .env file created!
) else (
    echo 📁 .env file already exists. Skipping creation.
)

echo.
echo ===================================================
echo ✅ Setup Complete! 
echo ===================================================
echo Double-click "launcher.bat" to start the application.
echo.
pause
