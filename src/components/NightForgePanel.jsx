import React, { useEffect, useState } from 'react';
import { getNightForgeStatus, runNightForgeCycle } from '../nightforge.js';

export function NightForgePanel() {
  const [state, setState] = useState(null);
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      const status = await getNightForgeStatus();
      setState(status.state || null);
      setLast(status.state?.lastResult || null);
    } catch {
      // Keep panel quiet when bridge is offline.
    }
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, []);

  const runNow = async () => {
    setLoading(true);
    try {
      const result = await runNightForgeCycle({
        includeProviders: ['evo_lm', 'openai', 'gemini'],
        train: true,
        useLiveStudio: true,
        mode: 'cost_guarded',
      });
      setLast({
        id: result.id,
        diagnostics: result.diagnostics?.summary,
        costSummary: result.costSummary,
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 border-t border-gray-800 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-300 font-mono tracking-wider flex items-center">
          <span className="text-indigo-400 mr-2">NF</span>
          NIGHTFORGE DAEMON
        </h3>
        <span className={`px-2 py-0.5 text-[10px] rounded border ${state?.active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-400 border-gray-600'}`}>
          {state?.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      <div className="space-y-3 text-[11px]">
        <div className="bg-gray-800 border border-gray-700 rounded p-3">
          <div className="text-gray-400 mb-1">Cycle Stats</div>
          <div className="text-gray-300">Success: {state?.successfulCycles ?? 0} • Failed: {state?.failedCycles ?? 0}</div>
          <div className="text-gray-500 mt-1">Last: {state?.lastCycleAt || '—'}</div>
          <div className="text-gray-500">Next: {state?.nextCycleAt || '—'}</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded p-3">
          <div className="text-gray-400 mb-1">Last Result</div>
          {last ? (
            <>
              <div className="text-gray-300">ID: {last.id}</div>
              <div className="text-gray-500 mt-1">Modules: {last.diagnostics?.modules_scanned ?? '—'} • Errors: {last.diagnostics?.modules_error ?? '—'}</div>
              <div className="text-gray-500">Credits: {last.costSummary?.creditsUsed ?? '—'} • Saved tokens: {last.costSummary?.estimatedSavedTokens ?? '—'}</div>
            </>
          ) : <div className="text-gray-500">No cycle result yet.</div>}
        </div>

        <button
          onClick={runNow}
          disabled={loading}
          className="w-full text-[10px] text-indigo-300 hover:text-indigo-100 px-2 py-2 bg-indigo-900/30 border border-indigo-500/30 rounded transition-colors"
        >
          {loading ? 'RUNNING CYCLE...' : 'RUN CYCLE NOW'}
        </button>
      </div>
    </div>
  );
}
