import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { safeFetchBridge } from '../config/bridge-config.js';
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
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

export default function ConnectionManager() {
  const { bondedNodes, addBondedNode, addNotification } = useSovereignStore();
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetIp, setTargetIp] = useState('');
  const [bonding, setBonding] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [discoveredNodes, setDiscoveredNodes] = useState([]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const result = await safeFetchBridge('/api/connections');
      if (!result.ok) throw new Error(result.error || 'Connection inventory unavailable');
      setConnections(result.data);
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

  const handleBond = async (e, overrideTargetIp = null) => {
    e?.preventDefault();
    const finalTargetIp = overrideTargetIp || targetIp;
    if (!finalTargetIp || bonding) return;

    setBonding(true);
    try {
      const result = await safeFetchBridge('/api/terminal/bond', {
        method: 'POST',
        body: JSON.stringify({ target: finalTargetIp }),
      });
      const data = result.data || {};
      if (data.success) {
        addBondedNode(data.node);
        if (!overrideTargetIp) setTargetIp('');
        fetchConnections(); // Refresh list
      } else {
        addNotification({ msg: `Bonding Failed: ${data.error}`, type: 'error' });
      }
    } catch (err) {
      addNotification({ msg: `System Error: ${err.message}`, type: 'error' });
    } finally {
      setBonding(false);
    }
  };

  const handleWifiScan = async () => {
    setScanning(true);
    try {
      const result = await safeFetchBridge('/api/evo-wifi/scan');
      if (result.ok && result.data?.discovered) {
        setDiscoveredNodes(result.data.discovered);
      }
    } catch (err) {
      addNotification({ msg: `Wi-Fi Scan Failed: ${err.message}`, type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const handleBluetoothPair = async () => {
    if (!navigator.bluetooth) {
      addNotification({ msg: 'Web Bluetooth API is not supported in this browser.', type: 'error' });
      return;
    }
    
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      });
      
      // Successfully got a device, bond it in the backend
      const result = await safeFetchBridge('/api/terminal/bond', {
        method: 'POST',
        body: JSON.stringify({ 
          target: device.id || device.name || 'Bluetooth_Device',
          type: 'BLUETOOTH',
          name: device.name || 'Unknown Bluetooth Node'
        }),
      });
      
      if (result.data?.success) {
        addBondedNode(result.data.node);
        fetchConnections();
      } else {
        addNotification({ msg: 'Bluetooth handshake completed, but backend bonding failed.', type: 'error' });
      }
    } catch (err) {
      void('Bluetooth pairing cancelled or failed', err);
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
    <IDEPageLayout
      title={
        <>
          EVO STUDIO BONDING <span className="text-indigo-500/50 text-sm not-italic font-mono ml-4">v3.1.2</span>
        </>
      }
      description="Distributed Node Orchestration & IPC"
      icon={Link2}
      actions={
        <button onClick={fetchConnections} className="p-2 text-slate-400 hover:text-white transition-colors glass-extreme rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      }
    >
      <div className="flex-col gap-4 space-y-10 animate-in fade-in duration-500">
      {/* Bonding Input */}
      <div className="bg-linear-to-br from-indigo-500/10 to-transparent p-1 rounded-3xl border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
        <form onSubmit={handleBond} className="bg-[#0c0c0e] rounded-[10px] p-6 flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-neon-cyan/70 ml-1">Initiate Handshake (IP or URL)</label>
            <div className="relative group">
              <input 
                type="text" 
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                ghostInput="e.g. 192.168.1.45:3001"
                className="w-full bg-black/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-2xl px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all group-hover:border-cyan-500/30"
              />
              <ArrowRight className="absolute right-4 top-3.5 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={16} />
            </div>
          </div>
          <div className="flex-col md:flex-row gap-2 md:self-end">
            <button 
              type="button"
              onClick={handleWifiScan}
              disabled={scanning}
              className="h-[46px] px-6 bg-black/40 backdrop-blur-md border-white/5 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.1)] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
            >
              {scanning ? <RefreshCcw size={14} className="animate-spin" /> : <Wifi size={14} />}
              Auto-Discover
            </button>
            <button 
              type="button"
              onClick={handleBluetoothPair}
              className="h-[46px] px-6 bg-black/40 backdrop-blur-md border-white/5 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.1)] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
            >
              <Bluetooth size={14} className="text-neon-cyan" />
              BLE Pair
            </button>
            <button 
              type="submit"
              disabled={bonding || !targetIp}
              className="h-[46px] px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {bonding ? <RefreshCcw size={14} className="animate-spin" /> : <Plus size={14} />}
              Bond Node
            </button>
          </div>
        </form>
      </div>

      {/* Discovered Nodes List */}
      {discoveredNodes.length > 0 && (
        <div className="bg-[#0c0c0e] rounded-3xl border-indigo-500/30 p-6 space-y-4">
          <h3 className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.3em] flex items-center gap-2">
            <Wifi size={12} /> Discovered Local Nodes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {discoveredNodes.map((node, i) => (
              <div key={i} className="flex items-center justify-between p-3 glass-extreme rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                <div>
                  <div className="text-sm font-bold text-white">{node.name || 'Unknown Device'}</div>
                  <div className="text-[10px] font-mono text-slate-500">{node.ip}</div>
                </div>
                <button 
                  onClick={() => handleBond(null, node.ip)}
                  className="px-3 py-1.5 bg-indigo-600/20 text-neon-cyan hover:bg-indigo-600 hover:text-white rounded text-xs font-bold transition-colors"
                >
                  Bond
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Grid */}
      <div className="space-y-8">
        {loading && !connections ? (
          <div className="flex items-center justify-center h-48 border-dashed border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-3xl">
            <Activity className="text-indigo-500 animate-pulse" />
          </div>
        ) : (
          Object.entries(connections || {}).map(([category, items]) => items.length > 0 && (
            <div key={category} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-8 h-px bg-black/40 backdrop-blur-md border-white/5" /> {category.replace('_', ' ')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                  <div key={idx} className="group relative bg-[#0c0c0e] border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:border-indigo-500/40 rounded-3xl p-5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5">
                    {/* Status Dot */}
                    <div className={`absolute top-5 right-5 w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 glass-extreme border-neon-glow rounded-2xl text-slate-400 group-hover:text-neon-cyan transition-colors">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">{item.name}</h4>
                        <span className="text-[9px] text-slate-600 font-mono tracking-tighter">{item.url || 'LOCAL ENDPOINT'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {item.description || 'Verified node participating in the Evo Studio distributed network.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">Secured</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTargetIp(item.url || item.target || item.ip || '')}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
                      >
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
    </IDEPageLayout>
  );
}
