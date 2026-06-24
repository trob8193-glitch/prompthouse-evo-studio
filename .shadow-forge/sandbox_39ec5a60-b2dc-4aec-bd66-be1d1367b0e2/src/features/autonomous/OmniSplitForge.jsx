import React from 'react';
import { SplitPaneLayout } from '../../components/layouts/SplitPaneLayout.jsx';

export default function OmniSplitForge() {
  const leftPane = (
    <div className="w-full h-full bg-[#0d0d0f] p-6 font-mono text-sm text-dim flex-col gap-4">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
        <span className="text-cyan-400 font-bold">src/core/omni.ts</span>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-black rounded">UTF-8</span>
        </div>
      </div>
      <textarea 
        className="flex-1 w-full bg-transparent resize-none outline-none text-gray-300"
        defaultValue={"// Omni Forge Logic\nexport function ignite() {\n  void('Igniting core systems...');\n  return true;\n}"}
      />
    </div>
  );

  const rightPane = (
    <div className="w-full h-full bg-void p-8 flex-col gap-4 items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black pointer-events-none"></div>
      
      <div className="relative z-10 glass-extreme p-12 rounded-full border-neon-glow flex-col items-center animate-pulse-slow">
        <div className="text-6xl mb-4">⚛️</div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Live Preview</h2>
        <p className="text-cyan-400 mt-2">Awaiting compilation...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full border-8 border-black overflow-hidden bg-black">
      <SplitPaneLayout leftPane={leftPane} rightPane={rightPane} initialLeftWidth={40} />
    </div>
  );
}
