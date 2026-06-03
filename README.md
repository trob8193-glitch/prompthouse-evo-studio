# 🚀 PromptHouse Evo Studio

Welcome to **PromptHouse Evo Studio** — the Sovereign Development Platform and IDE. This platform enables autonomous software generation, agentic development, and deep intelligence routing.

## 📖 Overview

PromptHouse Evo Studio is built on a highly optimized **React 19 / Vite 8** frontend powered by a robust Node.js **PromptBridge Server**. It includes a full **Evo SDK** allowing you to natively integrate external autonomous bots and agents.

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher

### 2. Environment Setup
Create a `.env` file in the root of the project by copying `.env.example`:
```bash
cp .env.example .env
```
Fill in the necessary API keys in your `.env` file:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GEMINI_API_KEY=AI...
```

### 3. Installation
Install the required dependencies:
```bash
npm install
```

### 4. Running the Studio
To launch the full studio, including the frontend UI, the API bridge, and all necessary background daemons:
```bash
npm run dev:all
```
Once booted, access the studio at:
- **Frontend**: http://127.0.0.1:5173
- **PromptBridge API**: http://127.0.0.1:3001

## 🏗️ Architecture

- **PromptBridge (`promptbridge-server.js`)**: The secure, rate-limited core Node.js server that handles AI routing, database operations, and websocket connections.
- **Sovereign Daemons (`src/core/daemons/`)**: Background processes including the Spider, Convergence, and Sentinel daemons that keep the system healthy and autonomous.
- **Frontend UI (`src/`)**: Built on React 19 and Vite 8, featuring an advanced Dashboard, Evo Copilot, and dynamic workspaces.
- **Evo SDK (`packages/evo-sdk/`)**: A native NPM package allowing external Node scripts to connect to the studio's Copilot via WebSockets.

## 🔌 Using the Evo SDK

You can easily add your own custom AI Agents to the Studio using the included SDK.

1. Navigate to the SDK folder: `cd packages/evo-sdk`
2. Run the example bot: `node examples/basic-bot.js`
3. Open the Evo Copilot in the Studio (`Cmd+K`), and your bot will instantly appear!

## 🛡️ Security
The PromptBridge is hardened with:
- **Helmet.js** for HTTP security headers
- **Express Rate Limiting** to prevent DDoS and API abuse
- **Database-level Authorization** for all generative routes

## 🧪 Testing

To run the suite of 370+ tests ensuring platform stability:
```bash
npm run test
```
