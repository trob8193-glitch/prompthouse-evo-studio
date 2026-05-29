import React, { useState } from 'react';
import { Card, Button, StatusBadge } from '../components/primitives.jsx';
import { Network, FileCode2, PlayCircle, Loader2 } from 'lucide-react';

export function ApiHarvesterView() {
  const [url, setUrl] = useState('https://pokeapi.co/api/v2/pokemon/ditto');
  const [hookName, setHookName] = useState('usePokemonData');
  const [harvesting, setHarvesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const harvestApi = async () => {
    if (!url) return;
    setHarvesting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://127.0.0.1:3001/api/signals/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, name: hookName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Failed to harvest API.');
      }
    } catch (e) {
      setError('Bridge offline. Could not reach harvester engine.');
    } finally {
      setHarvesting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-10 p-8 max-w-7xl mx-auto">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <Network className="w-10 h-10 text-emerald-400" />
          <h1 className="text-4xl font-black tracking-tight text-white">Autonomous API Harvester</h1>
        </div>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase mt-4">
          Feed it a URL. It eats the JSON and spits out a fully-typed React Hook.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5 space-y-8">
          <Card className="p-8 border border-emerald-500/20 bg-slate-900/50 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
            <h3 className="text-lg font-bold text-white mb-6">Harvester Parameters</h3>
            
            <div className="space-y-6">
              <div className="field">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target API URL</label>
                <input 
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://api.example.com/data"
                />
              </div>
              
              <div className="field">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Generated Hook Name</label>
                <input 
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={hookName}
                  onChange={e => setHookName(e.target.value)}
                  placeholder="useMyApiData"
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={harvestApi} 
                  disabled={harvesting || !url}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 py-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {harvesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                  {harvesting ? 'HARVESTING SIGNAL...' : 'HARVEST API DATA'}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-emerald-500/5 border-emerald-500/20">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">How it works</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="text-emerald-500">1.</span> The Node backend reaches out to the public IP.
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500">2.</span> It downloads the raw JSON response payload.
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500">3.</span> It recursively analyzes the data schema to infer types.
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500">4.</span> It writes an asynchronous `useEffect` React Hook for you to instantly use in your generated apps.
              </li>
            </ul>
          </Card>
        </div>

        <div className="xl:col-span-7 space-y-8">
          <Card className="flex flex-col p-0 overflow-hidden bg-black/40 border border-slate-800 h-[600px]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Generated React Code</h3>
              </div>
              {result && <StatusBadge status="verified" label="HOOK READY" />}
            </div>
            
            <div className="flex-1 p-6 overflow-auto bg-[#0d1117] font-mono text-sm">
              {result ? (
                <pre className="text-emerald-300">
                  <code>{result.code}</code>
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Network className="w-16 h-16 mb-4 opacity-20" />
                  <p>Awaiting URL target...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
