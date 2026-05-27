#!/bin/bash
clear
echo "══════════════════════════════════════════════════════════════════"
echo "           PROMPTHOUSE EVO STUDIO - AUTOMATED LAUNCHER"
echo "══════════════════════════════════════════════════════════════════"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Please install Node.js (v18+) from https://nodejs.org"
    exit 1
fi

# 2. Check and Install Dependencies
if [ ! -d "node_modules" ]; then
    echo "[SETUP] node_modules not found. Installing dependencies..."
    npm install
else
    echo "[SETUP] node_modules detected. Skipping npm install."
fi

# 3. Setup .env
if [ ! -f ".env" ]; then
    echo "[SETUP] No .env file detected. Creating .env from template..."
    cp .env.example .env
    echo "[WARN] A default .env has been created. Open it later and add your API Keys!"
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " SELECT RUNTIME MODE:"
echo " [1] Standard Web Development (User Mode)"
echo "     - Starts Vite Frontend (http://localhost:5173)"
echo "     - Starts Express API Bridge (http://localhost:3001)"
echo ""
echo " [2] Autonomous Swarm (Developer Mode)"
echo "     - Starts Vite Frontend + Express Bridge"
echo "     - Starts ALL 15+ Daemons (Singularity, Crucible, Watchdogs, etc.)"
echo "══════════════════════════════════════════════════════════════════"
echo ""

read -p "Enter choice [1 or 2]: " mode

if [ "$mode" = "1" ]; then
    echo "[LAUNCH] Starting Standard User Mode..."
    npm run dev:user
elif [ "$mode" = "2" ]; then
    echo "[LAUNCH] Starting Autonomous Developer Swarm..."
    npm run dev:dev
else
    echo "Invalid choice. Defaulting to Standard Mode..."
    npm run dev:user
fi
