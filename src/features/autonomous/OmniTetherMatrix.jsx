import React from 'react';

export default function OmniTetherMatrix() {
  const bars = Array.from({ length: 40 }).map(() => Math.random() * 100);

  return (
    <div className="w-full h-full p-8 bg-black flex flex-col gap-4 gap-4 font-mono text-neon-gold border-8 border-yellow-900/30 rounded-3xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(255,184,0,0.1)]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAxODQsIDAsIDAuMSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>
      
      <header className="flex justify-between items-start border-b-2 border-yellow-500/20 pb-4 mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Omni-Tether Matrix</h2>
          <div className="text-xs text-yellow-600/80 mt-1">LVE_HEARTBEAT_FEED // SYS_ADMIN</div>
        </div>
        <div className="bg-yellow-500/10 px-4 py-2 border-yellow-500/30 text-xs font-bold animate-pulse-slow">
          [ FIREWALL_ACTIVE ]
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 gap-8 relative z-10">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-900/20 border-yellow-500/20 p-4 flex flex-col gap-4 gap-4 justify-center items-center">
            <span className="text-3xl font-black">2.4ms</span>
            <span className="text-[10px] text-yellow-600 uppercase mt-2">Latency</span>
          </div>
          <div className="bg-yellow-900/20 border-yellow-500/20 p-4 flex flex-col gap-4 gap-4 justify-center items-center">
            <span className="text-3xl font-black">0.02¢</span>
            <span className="text-[10px] text-yellow-600 uppercase mt-2">Burn Rate/m</span>
          </div>
          <div className="bg-yellow-900/20 border-yellow-500/20 p-4 flex flex-col gap-4 gap-4 justify-center items-center col-span-2">
            <span className="text-3xl font-black text-red-500 shadow-[0_0_10px_#ef4444]">0 BLOCKED</span>
            <span className="text-[10px] text-yellow-600 uppercase mt-2">Intrusions Prevented</span>
          </div>
        </div>

        <div className="flex-1 bg-yellow-900/10 border-yellow-500/20 p-6 flex flex-col gap-4 gap-4">
          <h3 className="text-xs font-bold text-yellow-600 uppercase mb-4">Live Tether Spikes</h3>
          <div className="flex-1 flex items-end gap-1">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 bg-yellow-500/20 hover:bg-yellow-400 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
