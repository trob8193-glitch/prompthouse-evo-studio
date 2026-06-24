import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * PH EVO STUDIO — MAIN ENTRY POINT
 * ═══════════════════════════════════════════════════════════════
 * This is the physical entry point for the studio dashboard.
 * It initializes the React root and launches the Evo Studio UI.
 */

import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const app = <App />;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{app}</ClerkProvider> : app}
  </React.StrictMode>
);
