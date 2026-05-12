import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { DISCOVERY_SERVER } from './core/interop/DiscoveryServer.js';
import { LIVE_WATCHER } from './core/interop/LiveWatcher.js';

// INITIALIZE SOVEREIGN CONNECTIVITY
if (typeof window !== 'undefined') {
  DISCOVERY_SERVER.start();
  LIVE_WATCHER.start();
}

/**
 * PH EVO STUDIO — MAIN ENTRY POINT
 * ═══════════════════════════════════════════════════════════════
 * This is the physical entry point for the studio dashboard.
 * It initializes the React root and launches the Sovereign UI.
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
