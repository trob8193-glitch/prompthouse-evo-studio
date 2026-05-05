import { StateView } from '../components/primitives.jsx';
import { SovereignTabs } from '../components/SovereignTabs.jsx';

import { CodeForgeView, MobileArchView, MissionControlView, ChainBuilderView, ExportLabView } from '../views.jsx';
import { IntentAnalyzerView, PromptDNAView, TemplateLibraryView, AutoRepairView, LiveChatView } from '../ai-views.jsx';
import { BotStageView, AgentCtlView, selectLead, MasterPromptVaultView } from '../v3-views.jsx';
import { ProofLedgerView, CanonMemoryView, WitnessConsoleView, DeadSurfaceHunterView, MaturityScoreView, ForgePipelineView } from '../proof-os-views.jsx';
import { AutonomousBuilderView } from '../autonomous-views.jsx';
import { AutonomousSelfBuildCommandCenter } from '../autonomous-command-center.jsx';
import { EvoCopilotSidebar } from "../evo-copilot-sidebar.jsx";
import { RealExecutionView } from '../real-execution-views.jsx';
import { SelfBuildForgeView } from '../self-build-forge-view.jsx';
import { VectorMemoryView, TemporalForesightView, RecursiveSwarmView, EntropyLockView, RealitySynthesisView, TruthAuditorView, CommandDeckView, MergeCourtView, PatternMirrorView, PromptGenomeView, DeadHunterView, SingularityCoreView, ProofVaultView, OmegaRealityView, SovereignFinalityView } from '../new-features-views.jsx';
import { AgentBridgeView } from '../agent-bridge-views.jsx';
import { PerformanceMonitor } from '../components/PerformanceMonitor.jsx';
import { BotAutomationDeck } from '../components/BotAutomationDeck.jsx';
import { EvoExchangeView } from '../evo-exchange-view.jsx';
import { EvoLiveForgePreview } from '../components/liveforge/EvoLiveForgePreview.jsx';
import { ForgeRenderConsoleView } from '../forge-render-views.jsx';
import { ForgeLabView } from '../forge-views.jsx';
import { ForgeTermView } from '../forge-term-view.jsx';
import { NightForgeView } from '../nightforge-view.jsx';
import { ToolAutogenView } from '../tool-autogen-view.jsx';
import { PatternMinerView } from '../pattern-miner-view.jsx';
import { PromptLinkView } from '../promptlink-views.jsx';
import { ProofToValueView } from '../proof-to-value-view.jsx';
import { RareCapabilitiesView } from '../rare-capabilities-view.jsx';
import { WorkTwinVaultView } from '../worktwin-view.jsx';
import PastMVPConsole from '../past-mvp-console.jsx';
import { ChromeExtensionView } from '../chrome-extension-views.jsx';
import { CommerceRailView } from '../commerce-rail-view.jsx';
import { DeployRailView } from '../deploy-rail-view.jsx';
import { ForgeRailView } from '../forge-rail-view.jsx';
import { EvoDuelEngineView } from '../evo-duel-engine-view.jsx';
import { AIPromptGeneratorView } from '../ai-prompt-generator-view.jsx';
import { StudioGradingSystemView, SelfReleaseGateView } from '../studio-grading-release-views.jsx';
import { BotRosterView } from '../v3-views.jsx';
import { SovereignIntelligenceDashboard } from './SovereignIntelligenceDashboard.jsx';
import { ExtensionCockpitView } from './ExtensionCockpitView.jsx';
import { GlobalAPISettingsView } from './GlobalAPISettingsView.jsx';


// ─── SCREEN TEMPLATES ────────────────────────────────────────────────────────

function ScreenTemplate({ title, subtitle, children, state = 'idle', errorMsg }) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <header className="mb-[var(--space-24)]">
        <h1 className="font-[var(--text-page-title)] text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="font-[var(--text-body)] text-[var(--text-secondary)] mt-1">{subtitle}</p>}
      </header>
      
      {state !== 'idle' && state !== 'success' ? (
         <div className="flex-1 flex items-center justify-center">
           <StateView state={state} message={errorMsg} />
         </div>
      ) : (
         <div className="flex-1 overflow-y-auto pb-10 space-y-[var(--space-24)]">
           {children}
         </div>
      )}
    </div>
  );
}

// ─── 16 CORE FEATURE MODULES ─────────────────────────────────────────────────

export function StudioDashboard() {
  return (
    <ScreenTemplate title="Studio Dashboard" subtitle="Operator overview, active work, and performance metrics.">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--space-24)]">
        <PerformanceMonitor />
        <div className="flex flex-col gap-6">
          <AutonomousSelfBuildCommandCenter />
          <AutonomousBuilderView />
        </div>
      </div>
    </ScreenTemplate>
  );
}

export function WorkspaceShell() {
  return (
    <ScreenTemplate title="Workspace Shell" subtitle="The real cockpit for operating projects.">
      <MissionControlView />
      <div className="mt-6"><SelfBuildForgeView /></div>
    </ScreenTemplate>
  );
}

export function EvoCastRouter() {
  return (
    <ScreenTemplate title="Evo Cast Router" subtitle="11-role cast managed as separate working studio beings.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EvoCopilotSidebar />
          <div className="mt-6"><LiveChatView /></div>
        </div>
        <div className="lg:col-span-2">
          <BotStageView />
        </div>
      </div>
    </ScreenTemplate>
  );
}

export function PromptRegistry() {
  return (
    <ScreenTemplate title="Prompt Engineering & Registry" subtitle="Manage 300+ prompts like versioned product assets.">
      <MasterPromptVaultView />
      <div className="mt-6"><TemplateLibraryView /></div>
      <div className="mt-6"><PromptDNAView /></div>
      <div className="mt-6"><PromptGenomeView /></div>
    </ScreenTemplate>
  );
}

export function RealityTwinLedger() {
  return (
    <ScreenTemplate title="Reality Twin Ledger" subtitle="Track promised, built, blocked, verified truth.">
      <OmegaRealityView />
      <div className="mt-6"><RealitySynthesisView /></div>
    </ScreenTemplate>
  );
}

export function ExecutionQueue() {
  return (
    <ScreenTemplate title="Execution Queue" subtitle="Queued tasks, retries, approvals, rollbacks.">
      <RealExecutionView />
      <div className="mt-6"><ForgePipelineView /></div>
      <div className="mt-6"><DeployRailView /></div>
      <div className="mt-6"><ForgeRailView /></div>
    </ScreenTemplate>
  );
}

export function ProofConsole() {
  return (
    <ScreenTemplate title="Proof Console" subtitle="Multi-layer truth verification and immutable memory auditing.">
      <SovereignTabs tabs={[
        { id: 'ledger', label: 'Ledger & Memory', component: (
          <div className="space-y-6">
            <ProofLedgerView />
            <CanonMemoryView />
          </div>
        )},
        { id: 'auditor', label: 'Truth Auditor', component: (
          <div className="space-y-6">
            <TruthAuditorView />
            <WitnessConsoleView />
          </div>
        )},
        { id: 'vault', label: 'Proof Vault', component: (
          <div className="space-y-6">
            <MaturityScoreView />
            <ProofVaultView />
            <ProofToValueView />
          </div>
        )}
      ]} />
    </ScreenTemplate>
  );
}

export function LiveInspector() {
  return (
    <ScreenTemplate title="Live Surface Inspector" subtitle="Live routes, state, requests, runtime events, and traces.">
      <AgentCtlView />
      <div className="mt-6"><PatternMirrorView /></div>
      <div className="mt-6"><IntentAnalyzerView /></div>
    </ScreenTemplate>
  );
}

export function ConnectorBridge() {
  return (
    <ScreenTemplate title="Connector Bridge" subtitle="External tool capability truth. Trello, Slack, APIs.">
      <BotAutomationDeck />
      <div className="mt-6"><ExtensionCockpitView /></div>
      <div className="mt-6"><AgentBridgeView /></div>
    </ScreenTemplate>
  );
}

export function CrashGauntlet() {
  return (
    <ScreenTemplate title="Crash & Compatibility Gauntlet" subtitle="Stability and device/browser readiness.">
      <DeadHunterView />
      <div className="mt-6"><DeadSurfaceHunterView /></div>
      <div className="mt-6"><AutoRepairView /></div>
      <div className="mt-6"><EntropyLockView /></div>
    </ScreenTemplate>
  );
}

export function LanePacks() {
  return (
    <ScreenTemplate title="Lane Pack Forge" subtitle="Recurring product classes from strong defaults.">
      <CodeForgeView />
      <div className="mt-6"><VectorMemoryView /></div>
    </ScreenTemplate>
  );
}

export function Sequencer() {
  return (
    <ScreenTemplate title="Timeline Sequencer" subtitle="Sequence onboarding, build flows, approvals, launch flows.">
      <ChainBuilderView />
      <div className="mt-6"><TemporalForesightView /></div>
    </ScreenTemplate>
  );
}

export function CommerceCore() {
  return (
    <ScreenTemplate title="Product Commerce Core" subtitle="Support Prompt House as a sellable product.">
      <CommerceRailView />
    </ScreenTemplate>
  );
}

export function SettingsView() {
  return (
    <ScreenTemplate title="Studio Settings" subtitle="Account, preferences, security, and data.">
      <GlobalAPISettingsView />
      <div className="mt-6"><SovereignFinalityView /></div>
      <div className="mt-6"><SingularityCoreView /></div>
      <div className="mt-6"><RareCapabilitiesView /></div>
    </ScreenTemplate>
  );
}

// ─── NEW MODULES RECOVERED ───────────────────────────────────────────────────

export function EvoModelFoundry() {
  return (
    <ScreenTemplate title="Evo Model Foundry" subtitle="Evo LM training, prompt link ingestion, and pattern mining.">
      <EvoExchangeView />
      <div className="mt-6"><EvoLiveForgePreview /></div>
      <div className="mt-6"><PromptLinkView /></div>
      <div className="mt-6"><PatternMinerView /></div>
    </ScreenTemplate>
  );
}

export function ForgeLabs() {
  return (
    <ScreenTemplate title="Forge Labs" subtitle="Live synthesis, autonomous repair, and tool generation.">
      <SovereignTabs tabs={[
        { id: 'forge', label: 'Live Forge', component: (
          <div className="space-y-6">
            <EvoLiveForgePreview />
            <ForgeRenderConsoleView />
          </div>
        )},
        { id: 'autonomy', label: 'NightForge & Repair', component: (
          <div className="space-y-6">
            <NightForgeView />
            <AutoRepairView />
          </div>
        )},
        { id: 'tools', label: 'Tool Foundry', component: (
          <div className="space-y-6">
            <ToolAutogenView />
            <ForgeLabView />
            <ForgeTermView />
          </div>
        )}
      ]} />
    </ScreenTemplate>
  );
}

// ─── ADDITIONAL RECOVERED MODULES ──────────────────────────────────────────

export function EvoDuelArena() {
  return (
    <ScreenTemplate title="Evo Duel Arena" subtitle="21-bot competitive evaluation engine. Prompts split by bot specialty. Winners scored & graded.">
      <EvoDuelEngineView />
    </ScreenTemplate>
  );
}

export function AIGeneratorHub() {
  return (
    <ScreenTemplate title="AI Generator Hub" subtitle="6-layer prompt stack builder, live AI generation, and domain-specific output.">
      <AIPromptGeneratorView />
      <div className="mt-6"><EvoLiveForgePreview /></div>
    </ScreenTemplate>
  );
}

export function GradingAndRelease() {
  return (
    <ScreenTemplate title="Grading & Self-Release" subtitle="User prompt scoring, studio maturity grading, and 12-gate self-release checker.">
      <StudioGradingSystemView />
      <div className="mt-6"><SelfReleaseGateView /></div>
      <div className="mt-6"><MaturityScoreView /></div>
    </ScreenTemplate>
  );
}

export function EvoModelConfig() {
  return (
    <ScreenTemplate title="Evo LM Model Config" subtitle="Create, configure, and manage Evo LM model definitions, training ingestion, and inference routing.">
      <EvoExchangeView />
      <div className="mt-6"><BotRosterView /></div>
      <div className="mt-6"><ToolAutogenView /></div>
    </ScreenTemplate>
  );
}

export function SovereignControl() {
  return (
    <ScreenTemplate title="Sovereign Control" subtitle="Maximum Executed Recursive Autonomy + Sovereign Intelligence.">
      <SovereignTabs tabs={[
        { id: 'intel', label: 'Intelligence Deck', component: (
          <div className="space-y-6">
            <SovereignIntelligenceDashboard />
            <CommandDeckView />
          </div>
        )},
        { id: 'swarm', label: 'Recursive Swarm', component: (
          <div className="space-y-6">
            <RecursiveSwarmView />
            <MergeCourtView />
          </div>
        )},
        { id: 'governance', label: 'Governance & Finality', component: (
          <div className="space-y-6">
            <SovereignFinalityView />
            <WorkTwinVaultView />
            <PastMVPConsole />
          </div>
        )}
      ]} />
    </ScreenTemplate>
  );
}
