import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

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
