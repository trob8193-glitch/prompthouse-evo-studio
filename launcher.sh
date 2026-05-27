#!/bin/bash

echo "==================================================="
echo "🚀 Launching PromptHouse Evo Studio"
echo "==================================================="
echo ""

if [ ! -f .env ]; then
  echo "❌ .env file not found. Running installer first..."
  chmod +x install.sh
  ./install.sh
fi

echo "🌐 Starting API Bridge (Port 3001) & Frontend (Port 5173)..."
echo ""
echo "==================================================="
echo "Frontend Default: http://localhost:5173"
echo "API Bridge Default: http://localhost:3001"
echo "==================================================="
echo ""

npm run dev:all
