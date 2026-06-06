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

echo 🌐 Triggering Smart Collision-Free Boot...
echo.

node scripts/smart_launcher.mjs

pause
