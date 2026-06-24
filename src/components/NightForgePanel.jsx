import React, { useEffect, useState } from 'react';
import { getNightForgeStatus, runNightForgeCycle } from '../nightforge.js';
import { BRIDGE_URL } from '../config/bridge-config.js';

export function NightForgePanel() {
  const [state, setState] = useState(null);
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [intents, setIntents] = useState([]);
  const [swarmPrompt, setSwarmPrompt] = useState('');
  const [swarmLoading, setSwarmLoading] = useState(false);
  const [health, setHealth] = useState(null);

  const refresh = async () => {
    try {
      const status = await getNightForgeStatus();
      setState(status.state || null);
      setLast(status.state?.lastResult || null);
    } catch {
      // Keep panel quiet when bridge is offline.
    }
  };

  const fetchIntents = async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/autonomy/intents`);
      if (res.ok) {
        const data = await res.json();
        setIntents(data.intents || []);
      }
    } catch (e) {
      console.warn("Failed to fetch intents:", e);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/agi/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    refresh();
    fetchIntents();
    fetchHealth();
    const timer = setInterval(() => {
      refresh();
      fetchIntents();
      fetchHealth();
    }, 10000);
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

  const runIntentScan = async () => {
    setLoading(true);
    try {
      await fetch(`${BRIDGE_URL}/api/autonomy/intent/scan`, { method: 'POST' });
      await fetchIntents();
    } catch (e) {
      console.warn("Intent scan failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerSwarm = async () => {
    if (!swarmPrompt.trim()) return;
    setSwarmLoading(true);
    try {
      await fetch(`${BRIDGE_URL}/api/evo-lm/swarm-build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: swarmPrompt })
      });
      setSwarmPrompt('');
    } catch (e) {
      console.warn("Swarm build failed:", e);
    } finally {
      setSwarmLoading(false);
    }
  };

  const sys = health?.systems || {};

  return (
    <div className="flex-1 bg-gray-900 border-t border-gray-800 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-300 font-mono tracking-wider flex items-center">
          <span className="text-neon-cyan mr-2">AGI</span>
          AUTONOMY COCKPIT v2
        </h3>
        <span className={`px-2 py-0.5 text-[10px] rounded border ${state?.active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-400 border-gray-600'}`}>
          {state?.active ? 'DAEMONS ONLINE' : 'STANDBY'}
        </span>
      </div>

      <div className="space-y-4 text-[11px]">

        {/* ══ AGI HEALTH PULSE ══ */}
        {health && (
          <div className="bg-gray-800 border-gray-700 rounded p-3">
            <div className="text-gray-400 mb-2 font-bold uppercase tracking-widest">
              Iron Man Suit v2 — {health.suitVersion}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Merge Court</span>
                <span className={sys.mergeCourt?.status === 'HEALTHY' ? 'text-emerald-400' : 'text-red-400'}>
                  {sys.mergeCourt?.status || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Daemon</span>
                <span className={sys.daemon?.status === 'OPERATIONAL' ? 'text-emerald-400' : 'text-yellow-400'}>
                  {sys.daemon?.status || 'COLD_START'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Evo Eyes</span>
                <span className="text-cyan-400">{sys.evoEyes?.status} ({sys.evoEyes?.totalAudits || 0})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Distillation</span>
                <span className={sys.distillationForge?.status === 'READY_TO_TRAIN' ? 'text-emerald-400' : 'text-yellow-400'}>
                  {sys.distillationForge?.totalPairs || 0}/50
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Circuit Breaker</span>
                <span className={sys.circuitBreaker?.status === 'ARMED' ? 'text-emerald-400' : 'text-red-400'}>
                  {sys.circuitBreaker?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">EvoNet Browser</span>
                <span className="text-emerald-400">{sys.evonetBrowser?.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* NightForge Section */}
        <div className="bg-gray-800 border-gray-700 rounded p-3">
          <div className="text-gray-400 mb-2 font-bold uppercase tracking-widest flex justify-between">
            <span>Cycle Engine</span>
            <button onClick={runNow} disabled={loading} className="text-neon-cyan hover:text-indigo-300">
              {loading ? 'Running...' : 'Force Run'}
            </button>
          </div>
          <div className="text-gray-300">Success: {state?.successfulCycles ?? 0} • Failed: {state?.failedCycles ?? 0}</div>
          <div className="text-gray-500 mt-1">Next: {state?.nextCycleAt || '—'}</div>
        </div>

        {/* Intent Daemon Section */}
        <div className="bg-gray-800 border-gray-700 rounded p-3 flex flex flex-col gap-4 gap-2">
          <div className="text-gray-400 font-bold uppercase tracking-widest flex justify-between">
            <span>Intent Daemon v2</span>
            <button onClick={runIntentScan} disabled={loading} className="text-cyan-400 hover:text-cyan-300">
              Force Scan
            </button>
          </div>
          <div className="text-gray-300">Active Proposals: {intents.length}</div>
          {intents.filter(i => i.urgency === 'CRITICAL').length > 0 && (
            <div className="text-red-400 text-[10px] font-bold">
              ⚠ {intents.filter(i => i.urgency === 'CRITICAL').length} CRITICAL intent(s) detected
            </div>
          )}
          {intents.slice(0, 3).map((intent, i) => (
            <div key={i} className="text-gray-500 truncate" title={intent.description}>
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                intent.urgency === 'CRITICAL' ? 'bg-red-500' :
                intent.urgency === 'HIGH' ? 'bg-orange-500' :
                intent.urgency === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></span>
              {intent.type}: {intent.target}
            </div>
          ))}
          {intents.length > 3 && <div className="text-gray-600 text-[10px]">+{intents.length - 3} more (See Dashboard)</div>}
        </div>

        {/* Swarm Orchestrator Section */}
        <div className="bg-gray-800 border-gray-700 rounded p-3 flex flex flex-col gap-4 gap-2">
          <div className="text-gray-400 font-bold uppercase tracking-widest">
            Swarm Orchestrator (Merge Court v2)
          </div>
          <textarea
            value={swarmPrompt}
            onChange={(e) => setSwarmPrompt(e.target.value)}
            disabled={swarmLoading}
            placeholder="Describe a full-stack feature..."
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 outline-none focus:border-cyan-500/50 resize-none h-16"
          />
          <button
            onClick={triggerSwarm}
            disabled={swarmLoading || !swarmPrompt.trim()}
            className="w-full text-[10px] text-cyan-300 hover:text-cyan-100 px-2 py-2 bg-cyan-900/30 border-cyan-500/30 rounded transition-colors disabled:opacity-50"
          >
            {swarmLoading ? 'SPAWNING SWARM AGENTS...' : 'BUILD VIA SWARM'}
          </button>
        </div>

      </div>
    </div>
  );
}
