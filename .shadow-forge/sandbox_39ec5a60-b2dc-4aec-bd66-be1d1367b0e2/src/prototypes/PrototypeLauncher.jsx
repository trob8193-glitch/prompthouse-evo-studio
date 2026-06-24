import React from 'react';
import { useSovereignStore } from '../store.js';
import StudioAlpha from './StudioAlpha.jsx';
import StudioBeta from './StudioBeta.jsx';
import StudioGamma from './StudioGamma.jsx';
import StudioDelta from './StudioDelta.jsx';
import ThemeSynthesizer from './ThemeSynthesizer.jsx';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function PrototypeLauncher({ onExit }) {
  const globalTheme = useSovereignStore(s => s.globalTheme);
  const layout = globalTheme?.layout || 'alpha';

  // Autonomous Rendering driven by Hardware Evolution Daemon
  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur border-white/20 text-white rounded-2xl hover:bg-black/80 transition-all font-bold text-xs shadow-lg"
        >
          <ArrowLeft size={14} /> Exit Autonomous Explorer
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur border-indigo-500/50 text-indigo-300 rounded-2xl text-xs font-mono font-bold uppercase shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <RefreshCw size={12} className="animate-spin" />
          Hardware Daemon Controlling Reality: [ {layout.toUpperCase()} ]
        </div>
      </div>
      
      <div className="w-full h-full">
        {layout === 'alpha' && <StudioAlpha onBack={onExit} />}
        {layout === 'beta' && <StudioBeta onBack={onExit} />}
        {layout === 'gamma' && <StudioGamma onBack={onExit} />}
        {layout === 'delta' && <StudioDelta onBack={onExit} />}
        {layout !== 'alpha' && layout !== 'beta' && layout !== 'gamma' && layout !== 'delta' && <ThemeSynthesizer onBack={onExit} />}
      </div>
    </div>
  );
}
