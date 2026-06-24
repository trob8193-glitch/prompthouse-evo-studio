import React from 'react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { Zap } from 'lucide-react';
/**
 * PH EVO STUDIO — THE FOUNDRY DECK (UI FUSION)
 * ═══════════════════════════════════════════════════════════════
 * Physically embeds the EVOGENAGE platform into the Studio.
 * Anchored via a Drift-Audit Handshake.
 */

export const FoundryDeck = () => {
  const foundryUrl = "http://localhost:5174";

  return (
    <IDEPageLayout
      title="Evogenage Foundry"
      description="Physically embeds the EVOGENAGE platform into the Studio. Anchored via a Drift-Audit Handshake."
      icon={Zap}
      actions={
        <div className="flex gap-2">
          <span className="text-[10px] text-green-400 font-mono">● LIVE_SINGULARITY</span>
          <span className="text-[10px] text-slate-500">PORT: 5174</span>
        </div>
      }
    >
      <div className="w-full h-[calc(100vh-250px)] relative border-cyan-500/30/50 rounded-3xl overflow-hidden shadow-2xl">
        <iframe 
          src={foundryUrl}
          className="w-full h-full border-none bg-slate-950"
          title="Evogenage Foundry"
        />
        
        <div className="absolute bottom-4 right-4 p-3 bg-black/80 border-amber-500/40 rounded-2xl shadow-2xl pointer-events-none">
          <p className="text-[10px] text-amber-500/80 italic font-mono">
            "DriftGuard: VERIFIED. Logic Parity: 100%."
          </p>
        </div>
      </div>
    </IDEPageLayout>
  );
};
