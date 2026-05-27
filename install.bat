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
echo 📦 Bundling Extension Install Pack...
if not exist "Evo_Studio_Install_Pack" mkdir "Evo_Studio_Install_Pack"
if exist "EXTENSIONS_INSTALL_GUIDE.md" copy /Y "EXTENSIONS_INSTALL_GUIDE.md" "Evo_Studio_Install_Pack\"
if exist "evo-extension" (
    if not exist "Evo_Studio_Install_Pack\Browser_Extension" mkdir "Evo_Studio_Install_Pack\Browser_Extension"
    xcopy /E /I /Y "evo-extension" "Evo_Studio_Install_Pack\Browser_Extension"
)
if exist "dist-electron" (
    if not exist "Evo_Studio_Install_Pack\Desktop_App" mkdir "Evo_Studio_Install_Pack\Desktop_App"
    xcopy /E /I /Y "dist-electron" "Evo_Studio_Install_Pack\Desktop_App"
)
echo.

echo.
echo ✅ Setup Complete! 
echo.
pause
