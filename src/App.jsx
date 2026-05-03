import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './app/AppShell.jsx';

// Import the consolidated OS Feature Modules
import { 
  StudioDashboard, 
  WorkspaceShell, 
  EvoCastRouter, 
  PromptRegistry, 
  RealityTwinLedger, 
  ExecutionQueue,
  ProofConsole,
  LiveInspector,
  ConnectorBridge,
  CrashGauntlet,
  LanePacks,
  Sequencer,
  CommerceCore,
  SettingsView,
  EvoModelFoundry,
  ForgeLabs,
  SovereignControl,
  EvoDuelArena,
  AIGeneratorHub,
  GradingAndRelease,
  EvoModelConfig,
} from './features/index.jsx';

// ─── OS ROUTER ENTRY POINT ───────────────────────────────────────────────────

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* PUBLIC / ENTRY */}
        <Route path="/" element={<Navigate to="/studio/dashboard" replace />} />
        
        {/* MAIN APP (STUDIO) */}
        <Route path="/studio/dashboard" element={<StudioDashboard />} />
        <Route path="/studio/workspace" element={<WorkspaceShell />} />
        <Route path="/studio/execution" element={<ExecutionQueue />} />

        {/* PROMPT SYSTEM */}
        <Route path="/registry" element={<PromptRegistry />} />
        
        {/* CAST SYSTEM */}
        <Route path="/cast" element={<EvoCastRouter />} />

        {/* STUDIO OS */}
        <Route path="/os/reality-twin" element={<RealityTwinLedger />} />
        <Route path="/os/proof-console" element={<ProofConsole />} />
        <Route path="/os/inspector" element={<LiveInspector />} />
        <Route path="/os/connectors" element={<ConnectorBridge />} />
        <Route path="/os/gauntlet" element={<CrashGauntlet />} />
        <Route path="/os/lane-packs" element={<LanePacks />} />
        <Route path="/os/sequencer" element={<Sequencer />} />
        <Route path="/os/commerce" element={<CommerceCore />} />
        <Route path="/os/evo-foundry" element={<EvoModelFoundry />} />
        <Route path="/os/forge-labs" element={<ForgeLabs />} />
        <Route path="/os/sovereign-control" element={<SovereignControl />} />
        <Route path="/os/duel-arena" element={<EvoDuelArena />} />
        <Route path="/os/ai-generator" element={<AIGeneratorHub />} />
        <Route path="/os/grading" element={<GradingAndRelease />} />
        <Route path="/os/evo-model-config" element={<EvoModelConfig />} />


        {/* ACCOUNT */}
        <Route path="/settings" element={<SettingsView />} />
        
        {/* FALLBACK */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-full">
             <div className="text-center">
               <h2 className="text-[var(--error-color)] text-2xl font-bold mb-4">404 - Unknown Route</h2>
               <p className="text-[var(--text-secondary)] font-mono text-sm">Path not defined in OS Registry.</p>
             </div>
          </div>
        } />
      </Routes>
    </AppShell>
  );
}
