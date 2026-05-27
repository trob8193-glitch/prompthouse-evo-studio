#!/bin/bash

echo "==================================================="
echo "🚀 PromptHouse Evo Studio Setup (macOS/Linux)"
echo "==================================================="
echo ""

# Check Node.js
if ! [ -x "$(command -v node)" ]; then
  echo "❌ ERROR: Node.js is not installed." >&2
  echo "Please install Node.js from https://nodejs.org/"
  exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ ! -f .env ]; then
  echo "📁 Creating .env configuration file..."
  cp .env.example .env
  echo ".env file created!"
else
  echo "📁 .env file already exists. Skipping creation."
fi

echo ""
echo "==================================================="
echo "✅ Setup Complete!"
echo "==================================================="
echo "Run './launcher.sh' to start the application."
echo ""
