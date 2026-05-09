import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import TopBar from './components/TopBar.jsx';
import { Navigation } from './components/Navigation.jsx';
import { useSovereignStore } from './store.js';

// ─── Page Components (lazy-safe imports) ─────────────────────
import SovereignIntelligenceDashboard from './features/SovereignIntelligenceDashboard.jsx';
import SovereignChat from './features/SovereignChat.jsx';
import GlobalAPISettingsView from './features/GlobalAPISettingsView.jsx';
import MetricsView from './features/MetricsView.jsx';
import EvoEyesView from './features/EvoEyesView.jsx';
import ConnectionManager from './features/ConnectionManager.jsx';
import SaasBuilderView from './features/SaasBuilderView.jsx';
import { MatrixTerminal } from './components/MatrixTerminal.jsx';
import { TimeSlipLedger } from './components/TimeSlipLedger.jsx';
import { PulseResourceBar } from './components/PulseResourceBar.jsx';
import { NightForgePanel } from './components/NightForgePanel.jsx';
import { GodsEyeMap } from './components/GodsEyeMap.jsx';
import { GhostEditor } from './components/GhostEditor.jsx';

// Existing feature screens from features/index.jsx
import {
  WorkspaceShell, PromptRegistry, ExecutionQueue,
  ProofConsole, ForgeLabs, EvoDuelArena, AIGeneratorHub,
  GradingAndRelease, CommerceCore, FeatureFoundry,
} from './features/index.jsx';

/**
 * PH EVO STUDIO — APP ROOT (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Main layout shell: TopBar + Sidebar + Content area.
 * All navigation driven by Zustand store — no router needed.
 */

const PAGE_MAP = {
  'dashboard': SovereignIntelligenceDashboard,
  'chat': SovereignChat,
  'workspace': WorkspaceShell,
  'prompt-registry': PromptRegistry,
  'forge-labs': ForgeLabs,
  'duel-arena': EvoDuelArena,
  'ai-generator': AIGeneratorHub,
  'execution-queue': ExecutionQueue,
  'proof-console': ProofConsole,
  'evo-eyes': EvoEyesView,
  'metrics': MetricsView,
  'settings': GlobalAPISettingsView,
  'connections': ConnectionManager,
  'grading': GradingAndRelease,
  'commerce': CommerceCore,
  'foundry': FeatureFoundry,
  'saas-builder': SaasBuilderView,
  'ghost-editor': GhostEditor,
};

function PageRenderer() {
  const activePage = useSovereignStore((s) => s.activePage);
  const Component = PAGE_MAP[activePage] || SovereignIntelligenceDashboard;

  return (
    <ErrorBoundary key={activePage} fallbackMessage={`The "${activePage}" page encountered an error.`}>
      <Component />
    </ErrorBoundary>
  );
}

function NotificationToasts() {
  const notifications = useSovereignStore((s) => s.notifications);
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360,
    }}>
      {notifications.map((n) => (
        <div key={n.id} style={{
          padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: n.type === 'error' ? '#991b1b' : n.type === 'success' ? '#166534' : '#1e293b',
          color: '#f1f5f9', border: `1px solid ${n.type === 'error' ? '#dc262644' : n.type === 'success' ? '#22c55e44' : '#334155'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slideIn 0.2s ease-out',
        }}>
          {n.msg}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const startGlobalSync = useSovereignStore((s) => s.startGlobalSync);
  const stopGlobalSync = useSovereignStore((s) => s.stopGlobalSync);
  const [showGodsEye, setShowGodsEye] = React.useState(false);

  React.useEffect(() => {
    startGlobalSync();
    return () => stopGlobalSync();
  }, [startGlobalSync, stopGlobalSync]);

  return (
    <ErrorBoundary fallbackMessage="The studio encountered a critical error.">
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
        background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
      }}>
        <TopBar />
        {/* Toggle Gods Eye Map using a hidden hotkey or a small button below. For now, it's just available. */}
        <button onClick={() => setShowGodsEye(prev => !prev)} className="absolute top-16 right-4 z-50 bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/50 hover:bg-blue-800/50">
          Toggle God's Eye
        </button>
        {showGodsEye && <GodsEyeMap />}

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Navigation />

          <main style={{
            flex: 1, overflow: 'auto', padding: 28, position: 'relative',
            background: '#0a0e1a', paddingBottom: 60, // Leave room for matrix terminal
          }}>
            {/* Ambient Background Asset */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'url(/assets/generated_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.25, pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
              <PageRenderer />
            </div>
          </main>
          
          <div className="w-80 flex flex-col border-l border-gray-800 bg-[#0a0e1a] z-10 pointer-events-auto">
            <TimeSlipLedger />
            <NightForgePanel />
          </div>
        </div>

        <PulseResourceBar />

        <MatrixTerminal />
        <NotificationToasts />

        <style>{`
          @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .animate-spin { animation: spin 1s linear infinite; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { margin: 0; overflow: hidden; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #334155; }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}
