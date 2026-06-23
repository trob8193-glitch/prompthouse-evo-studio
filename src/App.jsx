import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import AutonomousSelfRepairBoundary from './components/AutonomousSelfRepairBoundary.jsx';
import TopBar from './components/TopBar.jsx';
import { Navigation } from './components/Navigation.jsx';
import { useSovereignStore } from './store.js';
import PromptHouseCopyGuard from './components/PromptHouseCopyGuard.jsx';
import {
  getEvolutionClientId,
  fetchEvolutionProfile,
  sendEvolutionSignal,
  applyEvolutionVariables
} from './evolution-runtime.js';

// ─── Page Components (lazy-safe imports) ─────────────────────
import SovereignIntelligenceDashboard from './features/SovereignIntelligenceDashboard.jsx';
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
import AppMarket from './components/AppMarket.jsx';
import { EvoCopilot } from './components/EvoCopilot.jsx';

import ProofCenterView from './features/ProofCenterView.jsx';
import DeploymentCenterView from './features/DeploymentCenterView.jsx';
import LaunchProofView from './features/LaunchProofView.jsx';
import PromptBridgeSurfacesView from './features/PromptBridgeSurfacesView.jsx';
import {
  CostFirewallDashboard,
  ReviewLedgerView,
  ProofDocsView
} from './features/GovernanceCockpit.jsx';
import { SelfEvolutionDashboard } from './features/SelfEvolutionDashboard.jsx';

// Existing feature screens from features/index.jsx
import {
  WorkspaceShell, PromptRegistry, ExecutionQueue,
  ProofConsole, ForgeLabs, EvoDuelArena, AIGeneratorHub,
  GradingAndRelease, CommerceCore, FeatureFoundry, EvoCastRouter,
  ShadowTelemetryDashboard
} from './features/index.jsx';

import EvoDiffuserDashboard from './features/EvoDiffuserDashboard.jsx';
import EvoPixelatorDashboard from './features/EvoPixelatorDashboard.jsx';
import EvoLayoutDashboard from './features/EvoLayoutDashboard.jsx';
import ThemeEvolutionDashboard from './features/ThemeEvolutionDashboard.jsx';
import VisualPhysicsEditor from './components/VisualPhysicsEditor.jsx';
import MobileSingularityDashboard from './features/MobileSingularityDashboard.jsx';
import RealTimeValidationDashboard from './features/RealTimeValidationDashboard.jsx';
import CommerceDashboard from './features/CommerceDashboard.jsx';
import PricingCheckout from './features/PricingCheckout.jsx';
import StudioMarketplaceDashboard from './features/StudioMarketplaceDashboard.jsx';
import OmniBotRemote from './features/OmniBotRemote.jsx';
import OmniBondCommandCenter from './features/OmniBondCommandCenter.jsx';
import RareCapabilities from './features/RareCapabilities.jsx';
import TemporalTraceView from './features/TemporalTraceView.jsx';

// Previously unreachable views — now wired
import { NightForgeView } from './nightforge-view.jsx';
import { AutonomousSelfBuildCommandCenter } from './autonomous-command-center.jsx';
import { SelfBuildForgeView } from './self-build-forge-view.jsx';
import { EvoDuelEngineView } from './evo-duel-engine-view.jsx';
import { WorkTwinVaultView } from './worktwin-view.jsx';
import { ToolAutogenView } from './tool-autogen-view.jsx';
import { PatternMinerView } from './pattern-miner-view.jsx';
import { ChromeExtensionView } from './chrome-extension-views.jsx';
import { ForgeTermView } from './forge-term-view.jsx';
import { PromptLinkView } from './promptlink-views.jsx';
import { DeployRailView } from './deploy-rail-view.jsx';
import { CommerceRailView } from './commerce-rail-view.jsx';
import { AIPromptGeneratorView } from './ai-prompt-generator-view.jsx';

export const PAGE_MAP = {
  'dashboard': SovereignIntelligenceDashboard,
  'workspace': WorkspaceShell,
  'prompt-registry': PromptRegistry,
  'ai-generator': AIGeneratorHub,
  'evopulse-grid': EvoPulseGridView,
  'execution-queue': ExecutionQueue,
  'brain-surfaces': PromptBridgeSurfacesView,
  'proof-console': ProofConsole,
  'proof-center': ProofCenterView,
  'deployment-center': DeploymentCenterView,
  'evo-eyes': EvoEyesView,
  'evo-diffuser': EvoDiffuserDashboard,
  'evo-pixelator': EvoPixelatorDashboard,
  'evo-layout': EvoLayoutDashboard,
  'theme-evolution': ThemeEvolutionDashboard,
  'portfolio': AppMarket,
  'self-evolution': SelfEvolutionDashboard,
  'cost-firewall': CostFirewallDashboard,
  'review-ledger': ReviewLedgerView,
  'proof-docs': ProofDocsView,
  'metrics': MetricsView,
  'settings': GlobalAPISettingsView,
  'connections': ConnectionManager,
  'grading': GradingAndRelease,
  'commerce': CommerceCore,
  'saas-builder': SaasBuilderView,
  'ghost-editor': GhostEditor,
  'launch-proof': LaunchProofView,
  'visual-physics': VisualPhysicsEditor,
  'mobile-singularity': MobileSingularityDashboard,
  'realtime-validation': RealTimeValidationDashboard,
  'commerce-dashboard': CommerceDashboard,
  'pricing': PricingCheckout,
  'studio-marketplace': StudioMarketplaceDashboard,
  'omni-bond': OmniBondCommandCenter,
  'omni-bot': OmniBotRemote,
  'rare-capabilities': RareCapabilities,
  'temporal-trace': TemporalTraceView,
  'witness-console': WitnessConsole,
  'nightforge': NightForgeView,
  'autonomous-command': AutonomousSelfBuildCommandCenter,
  'self-build-forge': SelfBuildForgeView,
  'evo-duel': EvoDuelEngineView,
  'worktwin': WorkTwinVaultView,
  'tool-autogen': ToolAutogenView,
  'pattern-miner': PatternMinerView,
  'chrome-extension': ChromeExtensionView,
  'forge-terminal': ForgeTermView,
  'promptlink': PromptLinkView,
  'deploy-rail': DeployRailView,
  'commerce-rail': CommerceRailView,
  'ai-prompt-gen': AIPromptGeneratorView,
  'shadow-telemetry': ShadowTelemetryDashboard,

  // Layout schema mappings
  'sovereign-command-nexus': SovereignIntelligenceDashboard,
  'neural-topology-grid': EvoPulseGridView,
  'quantum-hologram-deck': PromptBridgeSurfacesView,
  'omni-tether-matrix': ConnectionManager,
  'void-terminal': ForgeTermView,
  'omni-split-forge': SaasBuilderView,
  'the-forge': ForgeLabs,
  'prompt-engine-room': PromptRegistry,
  'agent-command-roster': AIGeneratorHub,
  'nuclear-proof-os': ProofCenterView,
  'omni-marketplace-nexus': AppMarket,
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
  const evolutionClientIdRef = React.useRef(null);
  const activePage = useSovereignStore((s) => s.activePage);
  const terminalOpen = useSovereignStore((s) => s.terminalOpen);
  const setEvolutionProfile = useSovereignStore((s) => s.setEvolutionProfile);
  const applyEvolutionRuntime = useSovereignStore((s) => s.applyEvolutionRuntime);
  const singularityActive = useSovereignStore((s) => s.singularityActive);
  const setSingularityActive = useSovereignStore((s) => s.setSingularityActive);

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

  // Intercept the /remote route for external mobile devices
  if (typeof window !== 'undefined' && window.location.pathname === '/remote') {
    return (
      <ErrorBoundary fallbackMessage="OmniBot Remote encountered an error.">
        <OmniBotRemote />
      </ErrorBoundary>
    );
  }

  return (
    <AutonomousSelfRepairBoundary>
      <ErrorBoundary fallbackMessage="The studio encountered a critical error.">
        <AuthSentry>
        <div style={{
          display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
          background: 'var(--bg-void)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
          overflow: 'hidden',
        }}>
          <PromptHouseCopyGuard />
          {singularityActive && <WitnessConsole />}
          <SingularityEngineOverlay />
          {/* <TopBar /> */}

          <button 
            onClick={() => setSingularityActive(true)} 
            className="absolute top-16 right-4 z-50 bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center gap-2 group transition-all duration-300"
          >
            <Zap size={14} className="group-hover:scale-125 transition-transform" />
            Open Evo Singularity Engine
          </button>

          <EvoEyes />

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ zIndex: 9999 }}><Navigation /></div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <main style={{
                  flex: 1, overflow: 'hidden', position: 'relative',
                  background: 'var(--bg-void)', display: 'flex', flexDirection: 'column'
                }}>
                  <Toolbar />
                  
                  <div style={{ flex: 1, overflow: 'auto', padding: 28, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,240,255,0.06), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(138,43,226,0.06), transparent 50%)',
                      pointerEvents: 'none', zIndex: 0
                    }} />
                    <PageRenderer />
                    {/* Evo Copilot Overlay (Chat UI + Projector Base) */}
                    <EvoCopilot />
                  </div>
                </main>

                {/* Right Terminal Sidebar */}
                <div style={{
                  width: 380, borderLeft: '1px solid rgba(255,255,255,0.06)',
                  background: '#01050a', display: 'flex', flexDirection: 'column',
                  overflow: 'hidden', zIndex: 2
                }}>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <Terminal sidebarMode={true} />
                  </div>
                </div>
              </div>

            </div>
          </div>
          <NotificationToasts />
        </div>
      </AuthSentry>
    </ErrorBoundary>
    </AutonomousSelfRepairBoundary>
  );
}
