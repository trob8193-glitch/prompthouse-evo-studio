import React, { useState, useEffect } from 'react';
import { Shield, Server, Activity, Database, Zap, ArrowRight, AlertTriangle } from 'lucide-react';

export default function SingularityCommandCenter() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/singularity/status');
        const data = await res.json();
        if (data.success) {
          setStatus(data);
        } else {
          setError(data.error || 'Failed to fetch Singularity status');
        }
      } catch (e) {
        setError(e.message);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Ping every 5s
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-900/20 border-red-500/50 rounded-2xl">
        <AlertTriangle className="mx-auto mb-2" size={32} />
        <h2>Singularity Engine Disconnected</h2>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-8 text-center text-cyan-400 animate-pulse">
        <Zap className="mx-auto mb-2 animate-bounce" size={32} />
        <p>Connecting to Multi-Model Hive Mind...</p>
      </div>
    );
  }

  const { health, nodes, waterfallRoute, events } = status;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-fuchsia-400" />
            Singularity Command Center
          </h2>
          <p className="text-cyan-400/80 text-sm">Automated Multi-Model Failover & Routing</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full font-mono text-sm tracking-widest uppercase border ${health === 'OPTIMAL' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500' : 'bg-red-900/30 text-red-400 border-red-500'}`}>
          Hive Health: {health}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waterfall Routing Visualizer */}
        <div className="bg-black/40 border-cyan-900/50 rounded-3xl p-5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-400" />
            Live Waterfall Routing
          </h3>
          
          <div className="flex flex-col gap-4 gap-4 space-y-3">
            {waterfallRoute.map((nodeId, index) => {
              const node = nodes[nodeId];
              const isActive = index === 0; // In a real dashboard, we'd dynamically track which is currently handling load
              
              let bgColor = 'bg-gray-900/50';
              let borderColor = 'border-gray-700';
              let textColor = 'text-gray-400';
              
              if (node.status === 'ONLINE') {
                bgColor = isActive ? 'bg-cyan-900/40' : 'bg-green-900/20';
                borderColor = isActive ? 'border-cyan-500' : 'border-green-500/50';
                textColor = isActive ? 'text-cyan-300' : 'text-green-400';
              } else if (node.status === 'ERROR' || node.status === 'UNAUTHORIZED' || node.status === 'OFFLINE') {
                bgColor = 'bg-red-900/20';
                borderColor = 'border-red-500/50';
                textColor = 'text-red-400';
              } else if (node.status === 'ACTIVE_RESCUE') {
                bgColor = 'bg-fuchsia-900/40';
                borderColor = 'border-fuchsia-500';
                textColor = 'text-fuchsia-300';
              }

              return (
                <div key={nodeId} className="flex flex-col gap-4 gap-4">
                  <div className={`flex items-center justify-between p-3 rounded-2xl border ${bgColor} ${borderColor} transition-colors duration-500`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${node.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : node.status === 'ERROR' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                      <span className={`font-mono font-medium ${textColor}`}>
                        {nodeId.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-mono opacity-80 flex items-center gap-4">
                      <span>FAILS: {node.fails}</span>
                      <span className={`px-2 py-0.5 rounded ${node.status === 'ONLINE' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>{node.status}</span>
                    </div>
                  </div>
                  {index < waterfallRoute.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight size={16} className={`rotate-90 ${node.status === 'ERROR' ? 'text-red-500' : 'text-cyan-500/30'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Squad Roster */}
          <div className="bg-black/40 border-cyan-900/50 rounded-3xl p-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Shield size={18} className="text-fuchsia-400" />
              Sovereign Intelligence Squad
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(nodes).map(node => (
                <div key={node.id} className="bg-[#0a0f16] border-cyan-900/30 rounded p-3">
                  <div className="font-mono text-cyan-300 text-sm mb-1">{node.id.toUpperCase()}</div>
                  <div className="text-xs text-gray-400 h-8">{node.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Log */}
          <div className="bg-black/40 border-cyan-900/50 rounded-3xl p-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Database size={18} className="text-cyan-400" />
              Hive Event Log
            </h3>
            <div className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {events.length === 0 ? (
                <div className="text-gray-500 text-sm italic text-center mt-8">No failover events recorded.</div>
              ) : (
                events.map(evt => (
                  <div key={evt.id} className={`text-xs p-2 rounded font-mono ${evt.type === 'CATASTROPHIC_FAILURE' ? 'bg-red-900/30 text-red-300 border-red-500/30' : evt.type === 'IDE_BONDS_ACTIVATED' ? 'bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-500/30' : 'bg-cyan-900/10 text-cyan-400 border-cyan-900/30'}`}>
                    <div className="opacity-50 mb-1">{new Date(evt.timestamp).toLocaleTimeString()} [{evt.type}]</div>
                    <div>{evt.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
