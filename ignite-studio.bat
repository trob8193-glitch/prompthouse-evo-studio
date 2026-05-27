@echo off
title PromptHouse Evo Studio - Launcher
echo ══════════════════════════════════════════════════════════════════
echo            PROMPTHOUSE EVO STUDIO - AUTOMATED LAUNCHER
echo ══════════════════════════════════════════════════════════════════
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js (v18+) from https://nodejs.org
    pause
    exit /b
)

:: 2. Check and Install Dependencies
if not exist node_modules (
    echo [SETUP] node_modules not found. Installing dependencies...
    call npm install
) else (
    echo [SETUP] node_modules detected. Skipping npm install.
)

:: 3. Setup .env
if not exist .env (
    echo [SETUP] No .env file detected. Creating .env from template...
    copy .env.example .env >nul
    echo [WARN] A default .env has been created. Open it later and add your API Keys!
)

echo.
echo ══════════════════════════════════════════════════════════════════
echo  SELECT RUNTIME MODE:
echo  [1] Standard Web Development (User Mode)
echo      - Starts Vite Frontend (http://localhost:5173)
echo      - Starts Express API Bridge (http://localhost:3001)
echo.
echo  [2] Autonomous Swarm (Developer Mode)
echo      - Starts Vite Frontend + Express Bridge
echo      - Starts ALL 15+ Daemons (Singularity, Crucible, Watchdogs, etc.)
echo ══════════════════════════════════════════════════════════════════
echo.

set /p mode="Enter choice [1 or 2]: "

if "%mode%"=="1" (
    echo [LAUNCH] Starting Standard User Mode...
    call npm run dev:user
) else if "%mode%"=="2" (
    echo [LAUNCH] Starting Autonomous Developer Swarm...
    call npm run dev:dev
) else (
    echo Invalid choice. Defaulting to Standard Mode...
    call npm run dev:user
)

pause
