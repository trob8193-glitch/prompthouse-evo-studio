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
echo "📦 Bundling Extension Install Pack..."
mkdir -p "Evo_Studio_Install_Pack"
if [ -f "EXTENSIONS_INSTALL_GUIDE.md" ]; then
    cp "EXTENSIONS_INSTALL_GUIDE.md" "Evo_Studio_Install_Pack/"
fi
if [ -d "evo-extension" ]; then
    mkdir -p "Evo_Studio_Install_Pack/Browser_Extension"
    cp -r evo-extension/* "Evo_Studio_Install_Pack/Browser_Extension/"
fi
if [ -d "dist-electron" ]; then
    mkdir -p "Evo_Studio_Install_Pack/Desktop_App"
    cp -r dist-electron/* "Evo_Studio_Install_Pack/Desktop_App/"
fi
echo ""

echo "✅ Setup Complete! Run ./launcher.sh to start."
echo ""
