import React from 'react';
import SovereignIntelligenceDashboard from './features/SovereignIntelligenceDashboard';
import { Log } from './core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — APP ROOT (WEB SAFE)
 * ═══════════════════════════════════════════════════════════════
 * This is the primary container for the studio UI. 
 * The Live Watcher and Universal Bridge are managed by the 
 * Node.js PromptBridge server, not the browser.
 */

function App() {
  React.useEffect(() => {
    Log.info('🧿 [App] Sovereign Dashboard Mounted.');
  }, []);

  return (
    <div className="App">
      <SovereignIntelligenceDashboard />
    </div>
  );
}

export default App;
