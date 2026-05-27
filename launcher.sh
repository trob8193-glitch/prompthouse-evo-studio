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

echo "🌐 Triggering Smart Collision-Free Boot..."
echo ""

node scripts/smart_launcher.mjs
