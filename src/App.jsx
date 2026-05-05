console.log('── APP.JSX LOADED ──');
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './app/AppShell.jsx';
import { useEvoStore } from './store.js';

export default function App() {
  const { initializeStore, bridgeConnected, lastSync } = useEvoStore();

  React.useEffect(() => {
    console.log('── INITIALIZING SOVEREIGN PROTOCOL ──');
    initializeStore();
  }, [initializeStore]);

  // ── SOVEREIGN WATCHDOG ──
  // If bridge is lost for more than 10 seconds (2 pulse cycles), 
  // or if truth state is compromised, force lockdown.
  const isLockdown = !bridgeConnected;

  return (
    <BrowserRouter>
      {isLockdown && (
        <div className="fixed inset-0 z-[9999] bg-[#09090b]/90 backdrop-blur-2xl flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full p-12 bg-[#09090b] border border-red-500/20 rounded-[40px] shadow-[0_0_100px_rgba(239,68,68,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent animate-pulse" />
            
            <div className="w-24 h-24 mx-auto mb-10 relative">
              <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
              <div className="relative w-full h-full border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Truth State Compromised</h2>
            <p className="text-slate-500 font-mono text-[11px] uppercase tracking-[0.3em] mb-10 leading-relaxed">
              Bridge connection lost. <br/> 
              Re-establishing permanent handshake...
            </p>
            
            <div className="space-y-4">
              <div className="h-[2px] bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 animate-[loading_3s_ease-in-out_infinite]" style={{ width: '40%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold font-mono text-slate-700 uppercase">
                <span>Last Sync: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'NEVER'}</span>
                <span>Code: TRUTH_RECOVERY</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
