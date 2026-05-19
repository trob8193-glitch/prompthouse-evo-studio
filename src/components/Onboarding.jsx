import React, { useState, useEffect } from 'react';

 /**
  * Onboarding — Sovereign Implementation
  * Live status surface only (no unverified claims): reports current bridge health.
  */
export const Onboarding = ({ bridgeUrl = 'http://127.0.0.1:3001' }) => {
  const [state, setState] = useState({ status: 'initializing', data: null, error: null });

  useEffect(() => {
    fetch(bridgeUrl + '/status')
      .then(r => r.json())
      .then(data => setState({ status: 'active', data, error: null }))
      .catch(err => setState({ status: 'error', data: null, error: err.message }));
  }, [bridgeUrl]);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Onboarding</h2>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          state.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
          state.status === 'error' ? 'bg-red-500/20 text-red-400' :
          'bg-slate-800 text-slate-400'
        }`}>
          {state.status.toUpperCase()}
        </span>
      </div>
      {state.error && (
        <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {state.error}
        </div>
      )}
      <div className="mt-4 font-mono text-xs text-slate-400 bg-black/50 p-3 rounded-lg">
        BRIDGE: {state.status.toUpperCase()} | LAST_CHECK: {new Date().toLocaleString()}
        {state.data ? ` | UPTIME_MS: ${Number(state.data.uptimeMs || 0)}` : ''}
      </div>
    </div>
  );
};

export default Onboarding;
