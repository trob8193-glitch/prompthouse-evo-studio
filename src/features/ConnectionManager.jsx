import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { 
  Globe, 
  Link2, 
  Zap, 
  Shield, 
  Activity, 
  Wifi, 
  Bluetooth, 
  RefreshCcw,
  Plus,
  ArrowRight
} from 'lucide-react';

const BRIDGE_URL = 'http://127.0.0.1:3001';

export default function ConnectionManager() {
  const { bondedNodes, addBondedNode } = useSovereignStore();
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetIp, setTargetIp] = useState('');
  const [bonding, setBonding] = useState(false);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/connections`);
      const data = await res.json();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleBond = async (e) => {
    e?.preventDefault();
    if (!targetIp || bonding) return;

    setBonding(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/terminal/bond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetIp }),
      });
      const data = await res.json();
      if (data.success) {
        addBondedNode(data.node);
        setTargetIp('');
        fetchConnections(); // Refresh list
      } else {
        alert(`Bonding Failed: ${data.error}`);
      }
    } catch (err) {
      alert(`System Error: ${err.message}`);
    } finally {
      setBonding(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'WIFI': return <Wifi size={14} />;
      case 'BLUETOOTH': return <Bluetooth size={14} />;
      case 'EVO': return <Zap size={14} className="text-pink-500" />;
      case 'IP': return <Activity size={14} className="text-emerald-500" />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <Link2 className="text-indigo-500" size={32} />
            SOVEREIGN BONDING <span className="text-indigo-500/50 text-sm not-italic font-mono ml-4">v3.1.2</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-[0.2em] font-bold">Distributed Node Orchestration & IPC</p>
        </div>
        <button onClick={fetchConnections} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-md border border-slate-800">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Bonding Input */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-1 rounded-xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
        <form onSubmit={handleBond} className="bg-[#0c0c0e] rounded-[10px] p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400/70 ml-1">Initiate Handshake (IP or URL)</label>
            <div className="relative group">
              <input 
                type="text" 
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
<<<<<<< HEAD
                ghostInput="e.g. 192.168.1.45:3001"
=======
                placeholder="e.g. 192.168.1.45:3001"
>>>>>>> main
                className="w-full bg-black/40 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all group-hover:border-slate-700"
              />
              <ArrowRight className="absolute right-4 top-3.5 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={16} />
            </div>
          </div>
          <button 
            type="submit"
            disabled={bonding || !targetIp}
            className="md:self-end h-[46px] px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {bonding ? <RefreshCcw size={14} className="animate-spin" /> : <Plus size={14} />}
            Bond Node
          </button>
        </form>
      </div>

      {/* Connection Grid */}
      <div className="space-y-8">
        {loading && !connections ? (
          <div className="flex items-center justify-center h-48 border border-dashed border-slate-800 rounded-xl">
            <Activity className="text-indigo-500 animate-pulse" />
          </div>
        ) : (
          Object.entries(connections || {}).map(([category, items]) => items.length > 0 && (
            <div key={category} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-800" /> {category.replace('_', ' ')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                  <div key={idx} className="group relative bg-[#0c0c0e] border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5">
                    {/* Status Dot */}
                    <div className={`absolute top-5 right-5 w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-900 rounded-lg text-slate-400 group-hover:text-indigo-400 transition-colors">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                        <span className="text-[9px] text-slate-600 font-mono tracking-tighter">{item.url || 'LOCAL ENDPOINT'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {item.description || 'Verified node participating in the Sovereign distributed network.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">Secured</span>
                      </div>
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
