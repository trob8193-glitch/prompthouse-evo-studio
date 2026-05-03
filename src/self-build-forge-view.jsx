import React, { useMemo, useState } from 'react';
import { SELF_BUILD_BATCHES, SELF_BUILD_PACKS } from './self-build-manifests.js';

const PACK_PURPOSE = {
  antigravity_autonomous_blueprint_docx: {
    title: 'Antigravity Autonomous Blueprint',
    role: 'Mission law, autonomy levels, connector boundaries, MVP surfaces, and acceptance tests.',
    gate: 'Use as the top-level build constitution before any code expansion.',
  },
  bot_canon_pack_21: {
    title: '21 Bot Canon Pack',
    role: 'Public 11 bot identities plus 10 internal senior architecture bots and visual/voice canon.',
    gate: 'Keep public responders separate from internal senior team mode.',
  },
  studio_os_build_all: {
    title: 'Studio OS Build All',
    role: 'Web-first Next.js starter surfaces: Mission Control, Prompt Forge, App Forge, Bridge Hub, Proof Deck.',
    gate: 'Treat as reference architecture, not a replacement for this Vite build.',
  },
  native_studio_post_mvp: {
    title: 'Native Studio Post-MVP',
    role: 'Flutter/mobile-first reference package with Prompt Auth, PromptBase, saved missions, proof deck, and handoff docs.',
    gate: 'Use for mobile shell and native deploy path.',
  },
  native_studio_post_mvp_forgerail_local: {
    title: 'Native Studio + ForgeRail Local',
    role: 'Local ForgeRail install path, VS Code extension scaffold, MCP/OpenAPI connector designs, and Flutter handoff.',
    gate: 'Use after web/MVP surfaces are stable and proof-gated.',
  },
  forgerail_evo_lm_extension_foundry: {
    title: 'ForgeRail + Evo LM Extension Foundry',
    role: 'ForgeRail 5X, Evo LM orchestration, PromptLink protocol, ExtensionCapsule schema, and extension scaffolds.',
    gate: 'Use for Chrome/IDE/mobile/backend/provider extension lanes.',
  },
  real_execution_buildkit: {
    title: 'Real Execution BuildKit',
    role: 'PromptEnds, PromptLink, PromptShell, contracts, proof protocol, and real-logic scaffold lane.',
    gate: 'Use as the reality boundary: no fake completion, no fake deployment.',
  },
  native_studio_v1_2_builder_installed: {
    title: 'Native Studio v1.2 Builder Installed',
    role: 'Installed Flutter builder panel with templates, models, services, updated main.dart, and updated pubspec.yaml.',
    gate: 'Use as the latest native/builder-installed reference without overwriting the current Vite studio.',
  },
  studio_builder_module_v1_0: {
    title: 'Studio Builder Module v1.0',
    role: 'Visual block builder for custom Evo LMs, agents, PromptLink bridges, tests, exports, and proof receipts.',
    gate: 'Stage as standalone builder source until a dedicated Flutter/app merge is requested.',
  },
  forgeterm_terminal_module_v1_0: {
    title: 'ForgeTerm Terminal Module v1.0',
    role: 'PromptHouse-native embedded terminal pane with VirtualShell demo mode, PTY WebSocket backend scaffold, command policy, proof receipts, and terminal agent recipe.',
    gate: 'Stage as terminal reference; real shell execution requires a backend PTY bridge, sandbox, approval, redaction, and Proof Deck receipts.',
  },
};

const BUILD_SEQUENCE = [
  ['01', 'Blueprint Lock', 'Load the Antigravity blueprint as the mission law and boundary model.'],
  ['02', 'Bot Canon', 'Load the 21-bot canon; keep the 11 public bots visible and senior bots internal.'],
  ['03', 'Studio OS Surface', 'Merge web-first MVP surfaces into the existing studio instead of replacing it.'],
  ['04', 'Native Post-MVP', 'Blend mobile-first Prompt Auth, PromptBase, Proof Deck, and Flutter handoff paths.'],
  ['05', 'ForgeRail Local', 'Add local extension/build lanes with MCP, OpenAPI, VS Code, and Android Studio handoffs.'],
  ['06', 'Evo LM Foundry', 'Use PromptLink and ExtensionCapsule rules for studio extensions and Chrome extension growth.'],
  ['07', 'Evo Studio Builder', 'Load the visual block builder for custom Evo LMs, agents, bridges, tests, proof, and exports.'],
  ['08', 'ForgeTerm Terminal', 'Stage the embedded terminal pane, VirtualShell commands, PTY backend scaffold, command boundary policy, and terminal proof receipts.'],
  ['09', 'Real Execution', 'Gate every run with artifacts, audit logs, tests, receipts, rollback, and proof states.'],
  ['10', 'Current Build Merge', 'Keep this Vite studio alive, dark, autonomous, bot-animated, terminal-aware, and extension-ready.'],
];

const FIRE_ORDERS = [
  'FORGE:INTAKE -> canon check -> route -> spec -> build plan',
  'FORGE:PROMPT -> rewrite, constraints, variables, output contract, tests',
  'FORGE:APP_SPEC -> screens, components, data model, API contracts, code tasks',
  'FORGE:CONNECTORS -> discover, auth, scope, dry-run, approval, execute, proof',
  'FORGE:EXTENSION -> ExtensionCapsule, Chrome/IDE/mobile/backend lanes, install proof',
  'FORGE:BUILDER -> type picker -> block library -> flow canvas -> recipe inspector -> tests -> proof -> export',
  'FORGE:TERMINAL -> VirtualShell -> BoundaryFilter -> SovereignGate -> ShellBridge/PTY -> LedgerTrace -> Proof Deck',
  'FORGE:NATIVE -> Flutter shell, Prompt Auth, PromptBase, Proof Deck, release handoff',
  'FORGE:PROOF -> test report, screenshot/receipt, rollback path, ship gate',
];

const PROOF_GATES = [
  'No existing build files removed.',
  'Imported packs staged under buildkit_import.',
  'Dark S+++++ mode remains active.',
  'Updated public/bots images are the active visual source.',
  'Builder packs are staged and indexed, not copied over current app files.',
  'ForgeTerm is staged and indexed; browser-only terminal mode cannot claim real OS shell execution.',
  'Writes/deploys/connectors remain permissioned and proof-gated.',
  'Market-ready claims require real build, test, deploy, security, and customer evidence.',
];

function shortPath(value, root) {
  return String(value || '').replace(root || '', 'import_root');
}

export function SelfBuildForgeView() {
  const [selectedPack, setSelectedPack] = useState(SELF_BUILD_PACKS[0]?.ImportKey);
  const selected = SELF_BUILD_PACKS.find((pack) => pack.ImportKey === selectedPack) || SELF_BUILD_PACKS[0];

  const totals = useMemo(() => ({
    batches: SELF_BUILD_BATCHES.length,
    packs: SELF_BUILD_PACKS.length,
    files: SELF_BUILD_PACKS.reduce((sum, pack) => sum + Number(pack.Files || 0), 0),
  }), []);

  const selectedPurpose = PACK_PURPOSE[selected?.Pack] || {
    title: selected?.Pack,
    role: 'Imported source pack staged for consolidation.',
    gate: 'Read and merge additively.',
  };

  const sampleFiles = String(selected?.Sample || '').split('; ').filter(Boolean).slice(0, 8);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between">
        <div>
          <div className="page-title">Self Build Forge</div>
          <div className="page-subtitle">Imported PromptHouse packs across batches, fired in merge order, blended into this studio without removing current build pieces.</div>
        </div>
        <span className="badge badge-green">{totals.batches} batches / {totals.packs} packs / {totals.files} files staged</span>
      </div>

      <div className="grid-3">
        <div className="card omnipotent-panel">
          <div className="card-title">Import Roots</div>
          <div className="card-body flex-col" style={{ paddingLeft: 0, paddingRight: 0 }}>
            {SELF_BUILD_BATCHES.map((batch) => (
              <div key={batch.id}>
                <div className="field-label">{batch.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>
                  {batch.manifest.root}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card omnipotent-panel">
          <div className="card-title">Load State</div>
          <div className="card-body flex-col" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <span className="badge badge-green">source packs imported</span>
            <span className="badge badge-green">builder packs staged</span>
            <span className="badge badge-cyan">ForgeTerm staged</span>
            <span className="badge badge-pink">S+++++ autonomous merge</span>
            <span className="badge badge-gold">proof gate required</span>
          </div>
        </div>
        <div className="card omnipotent-panel">
          <div className="card-title">Merge Boundary</div>
          <div className="card-body flex-col" style={{ paddingLeft: 0, paddingRight: 0 }}>
            {PROOF_GATES.slice(0, 4).map((gate) => (
              <div key={gate} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>OK {gate}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-builder">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Correct Fire Order</div>
            <div className="card-desc">This is the consolidated load/remaster sequence for the packs now staged locally.</div>
          </div>
          <div className="card-body flex-col">
            {BUILD_SEQUENCE.map(([step, title, detail]) => (
              <div key={step} style={{ display: 'grid', gridTemplateColumns: '42px 1fr', gap: 12, alignItems: 'start' }}>
                <div className="badge badge-gold" style={{ justifyContent: 'center' }}>{step}</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.45 }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Prompt Fire Orders</div>
            <div className="card-desc">Execution commands distilled from the imported packs and current studio constraints.</div>
          </div>
          <div className="card-body flex-col">
            {FIRE_ORDERS.map((order) => (
              <div key={order} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)', padding: '9px 10px', border: '1px solid var(--border-dim)', borderRadius: 8, background: 'var(--bg-void)' }}>
                {order}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-builder">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Imported Packs</div>
            <div className="card-desc">Click a source pack to inspect its role in the merge.</div>
          </div>
          <div className="card-body flex-col" style={{ maxHeight: 520, overflow: 'auto' }}>
            {SELF_BUILD_PACKS.map((pack) => {
              const purpose = PACK_PURPOSE[pack.Pack] || {};
              return (
                <button
                  key={pack.ImportKey}
                  className={`nav-item ${selectedPack === pack.ImportKey ? 'active' : ''}`}
                  style={{ width: '100%', alignItems: 'flex-start', gap: 10 }}
                  onClick={() => setSelectedPack(pack.ImportKey)}
                >
                  <span className="nav-icon">▣</span>
                  <span>
                    <strong>{purpose.title || pack.Pack}</strong>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{pack.BatchLabel} / {pack.Files} files</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card omnipotent-panel">
          <div className="card-header">
            <div>
              <div className="card-title">{selectedPurpose.title}</div>
              <div className="card-desc">{selectedPurpose.role}</div>
            </div>
          </div>
          <div className="card-body flex-col">
            <div>
              <div className="field-label">Gate</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedPurpose.gate}</div>
            </div>
            <div>
              <div className="field-label">Destination</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>
                {shortPath(selected?.Destination, selected?.BatchRoot)}
              </div>
            </div>
            <div>
              <div className="field-label">Sample Files</div>
              <div className="flex-col gap-8">
                {sampleFiles.map((file) => (
                  <div key={file} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', overflowWrap: 'anywhere' }}>
                    {shortPath(file, selected?.BatchRoot)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="field-label">Remaining Proof Gates</div>
              <div className="flex-col gap-8">
                {PROOF_GATES.slice(4).map((gate) => (
                  <div key={gate} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>REQUIRED {gate}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
