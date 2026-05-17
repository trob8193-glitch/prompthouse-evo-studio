import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import TopBar from './components/TopBar.jsx';
import { Navigation } from './components/Navigation.jsx';
import { useSovereignStore } from './store.js';
import {
  getEvolutionClientId,
  fetchEvolutionProfile,
  sendEvolutionSignal,
  applyEvolutionVariables
} from './evolution-runtime.js';

// ─── Page Components (lazy-safe imports) ─────────────────────
import SovereignIntelligenceDashboard from './features/SovereignIntelligenceDashboard.jsx';
import SovereignChat from './features/SovereignChat.jsx';
import GlobalAPISettingsView from './features/GlobalAPISettingsView.jsx';
import MetricsView from './features/MetricsView.jsx';
import { EvoEyesView } from './features/EvoEyesView.jsx';
import ConnectionManager from './features/ConnectionManager.jsx';
import SaasBuilderView from './features/SaasBuilderView.jsx';
import { Terminal } from './components/Terminal.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { EvoEyes } from './components/EvoEyes.jsx';
import { GhostEditor } from './components/GhostEditor.jsx';
import { WitnessConsole } from './features/WitnessConsole.jsx';
import { Zap } from 'lucide-react';
import { AuthSentry } from './features/AuthSentry.jsx';
import EvoPulseGridView from './features/EvoPulseGridView.jsx';
import SingularityEngineOverlay from './components/SingularityEngineOverlay.jsx';

import ProofCenterView from './features/ProofCenterView.jsx';
import DeploymentCenterView from './features/DeploymentCenterView.jsx';

// Existing feature screens from features/index.jsx
import {
  WorkspaceShell, PromptRegistry, ExecutionQueue,
  ProofConsole, ForgeLabs, EvoDuelArena, AIGeneratorHub,
  GradingAndRelease, CommerceCore, FeatureFoundry,
} from './features/index.jsx';

export const PAGE_MAP = {
  'dashboard': SovereignIntelligenceDashboard,
  'chat': SovereignChat,
  'workspace': WorkspaceShell,
  'prompt-registry': PromptRegistry,
  'forge-labs': ForgeLabs,
  'duel-arena': EvoDuelArena,
  'ai-generator': AIGeneratorHub,
  'evopulse-grid': EvoPulseGridView,
  'execution-queue': ExecutionQueue,
  'proof-console': ProofConsole,
  'proof-center': ProofCenterView,
  'deployment-center': DeploymentCenterView,
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
  const activePage = useSovereignStore((s) => s.activePage);
  const terminalOpen = useSovereignStore((s) => s.terminalOpen);
  const setEvolutionProfile = useSovereignStore((s) => s.setEvolutionProfile);
  const applyEvolutionRuntime = useSovereignStore((s) => s.applyEvolutionRuntime);
  const singularityActive = useSovereignStore((s) => s.singularityActive);
  const setSingularityActive = useSovereignStore((s) => s.setSingularityActive);
  const checkAuth = useSovereignStore((s) => s.checkAuth);
  const isAuthenticated = useSovereignStore((s) => s.isAuthenticated);

  React.useEffect(() => {
    const clientId = getEvolutionClientId();
    evolutionClientIdRef.current = clientId;
    let active = true;

    const bootstrap = async () => {
      try {
        const payload = await fetchEvolutionProfile(clientId);
        if (!active) return;
        if (payload?.profile) setEvolutionProfile(payload.profile);
        if (payload?.runtime) {
          applyEvolutionRuntime(payload.runtime);
          applyEvolutionVariables(payload.runtime.cssVariables, payload.runtime.layoutHints);
        }
      } catch {
        // Evolution runtime is optional; studio stays functional without it.
      }
    };

    bootstrap();
    return () => { active = false; };
  }, [setEvolutionProfile, applyEvolutionRuntime]);

  React.useEffect(() => {
    const clientId = evolutionClientIdRef.current || getEvolutionClientId();
    let active = true;

    const tick = async () => {
      try {
        const payload = await sendEvolutionSignal({
          clientId,
          page: activePage || 'dashboard',
          action: 'navigation_sync',
          intensity: 0.6,
          complexity: activePage === 'forge-labs' || activePage === 'workspace' ? 0.95 : 0.55
        });
        if (!active) return;
        if (payload?.profile) setEvolutionProfile(payload.profile);
        if (payload?.runtime) {
          applyEvolutionRuntime(payload.runtime);
          applyEvolutionVariables(payload.runtime.cssVariables, payload.runtime.layoutHints);
        }
      } catch {
        // Keep UI responsive even if runtime evolution signal fails.
      }
    };

    tick();
    const timer = setInterval(tick, 25000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activePage, setEvolutionProfile, applyEvolutionRuntime]);

  return (
    <ErrorBoundary fallbackMessage="The studio encountered a critical error.">
      <AuthSentry>
        <div style={{
          display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
          background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          overflow: 'hidden',
        }}>
          
          {singularityActive && <WitnessConsole />}
          <SingularityEngineOverlay />
          <TopBar />

          
          {/* Toggle Singularity Engine - The Unified HUD */}
          <button 
            onClick={() => setSingularityActive(true)} 
            className="absolute top-16 right-4 z-50 bg-indigo-900/40 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border border-indigo-500/50 hover:bg-indigo-800/50 shadow-lg shadow-indigo-500/10 flex items-center gap-2 group transition-all"
          >
            <Zap size={14} className="group-hover:scale-125 transition-transform" />
            Manifest Singularity Engine
          </button>

          <EvoEyes />

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Navigation />

            <main style={{
              flex: 1, overflow: 'auto', position: 'relative',
              background: '#0a0e1a', paddingBottom: terminalOpen ? 300 : 32,
            }}>
              <Toolbar />
              
              <div style={{ padding: 28, position: 'relative', zIndex: 1, height: '100%' }}>
                {/* Ambient Background Asset */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'url(/assets/generated_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center',
                  opacity: 0.15, pointerEvents: 'none', zIndex: 0
                }} />
                <PageRenderer />
              </div>
            </main>
          </div>

          <Terminal />
          <NotificationToasts />
        </div>
      </AuthSentry>
    </ErrorBoundary>
  );
}
