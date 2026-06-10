import {
  TRIBRAIN_BRAINS,
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_CAPABILITY_MATRIX,
  TRIBRAIN_COMMAND_MODES,
} from '../tribrain/index.js';
import {
  getEnterpriseArchitectureStatus,
  getEnterpriseExpansionRoadmap,
} from '../architecture/EnterpriseArchitectureContract.js';

export const QUADBRAIN_NAME = 'PH Evo Studio QuadBrain';

export const QUADBRAIN_BRAINS = Object.freeze({
  ...TRIBRAIN_BRAINS,
  EXTERNAL_EXPERIENCE: 'external_experience_brain',
});

export const QUADBRAIN_SURFACES = Object.freeze({
  ACTIONS_GPT: 'actions_gpt',
  APPS_MCP_COCKPIT: 'apps_mcp_cockpit',
  STUDIO_NATIVE_PANEL: 'studio_native_panel',
  IDE_DESKTOP_BRIDGE: 'ide_desktop_bridge',
  ENTERPRISE_ARCHITECTURE_PANEL: 'enterprise_architecture_panel',
  PROOF_LEDGER_PANEL: 'proof_ledger_panel',
  CUSTOMER_AUDIT_REPORT: 'customer_audit_report',
  COST_FIREWALL_CONSOLE: 'cost_firewall_console',
  MEDIA_MODEL_GOVERNANCE_PANEL: 'media_model_governance_panel',
});

export const QUADBRAIN_ABILITY_CLASSES = Object.freeze({
  ...TRIBRAIN_ABILITY_CLASSES,
  VISUALIZE: 'visualize',
  INTERACT: 'interact',
  DESIGN_ASSET: 'design_asset',
  REVIEW_PATCH: 'review_patch',
  PACKAGE_PRODUCT: 'package_product',
  GOVERN_COST: 'govern_cost',
  GOVERN_MEDIA_MODEL: 'govern_media_model',
  ISSUE_RECEIPT: 'issue_receipt',
  RELEASE_VERDICT: 'release_verdict',
});

export const QUADBRAIN_CAPABILITY_MATRIX = Object.freeze({
  ...TRIBRAIN_CAPABILITY_MATRIX,
  [QUADBRAIN_BRAINS.EXTERNAL_EXPERIENCE]: {
    abilities: [
      QUADBRAIN_ABILITY_CLASSES.SUMMARIZE,
      QUADBRAIN_ABILITY_CLASSES.PLAN,
      QUADBRAIN_ABILITY_CLASSES.REPORT,
      QUADBRAIN_ABILITY_CLASSES.VERIFY,
      QUADBRAIN_ABILITY_CLASSES.VISUALIZE,
      QUADBRAIN_ABILITY_CLASSES.INTERACT,
      QUADBRAIN_ABILITY_CLASSES.DESIGN_ASSET,
      QUADBRAIN_ABILITY_CLASSES.REVIEW_PATCH,
      QUADBRAIN_ABILITY_CLASSES.PACKAGE_PRODUCT,
      QUADBRAIN_ABILITY_CLASSES.GOVERN_COST,
      QUADBRAIN_ABILITY_CLASSES.GOVERN_MEDIA_MODEL,
      QUADBRAIN_ABILITY_CLASSES.ISSUE_RECEIPT,
      QUADBRAIN_ABILITY_CLASSES.RELEASE_VERDICT,
      QUADBRAIN_ABILITY_CLASSES.ESCALATE,
    ],
    localCapable: false,
    canExecute: false,
    canApprove: false,
    defaultMode: TRIBRAIN_COMMAND_MODES.PROPOSAL_ONLY,
    authority: 'External Apps and MCP cockpit for visual panels, review surfaces, proof ledger display, customer audit reports, cost firewall consoles, and user-facing interaction.',
    surfaces: [
      QUADBRAIN_SURFACES.APPS_MCP_COCKPIT,
      QUADBRAIN_SURFACES.ENTERPRISE_ARCHITECTURE_PANEL,
      QUADBRAIN_SURFACES.PROOF_LEDGER_PANEL,
      QUADBRAIN_SURFACES.CUSTOMER_AUDIT_REPORT,
      QUADBRAIN_SURFACES.COST_FIREWALL_CONSOLE,
      QUADBRAIN_SURFACES.MEDIA_MODEL_GOVERNANCE_PANEL,
    ],
  },
});

export const QUADBRAIN_CANON = Object.freeze({
  name: QUADBRAIN_NAME,
  rule: 'QuadBrain keeps the Studio as the engine. External surfaces display, route, request, and review through Studio Gateway, enterprise architecture contracts, cost controls, and proof systems.',
  brains: [
    {
      id: QUADBRAIN_BRAINS.STUDIO,
      name: 'Studio Brain',
      role: 'Native rules, memory, bots, daemons, audits, project context, local fallback behavior, proof governance, and final response formation.',
      required: true,
    },
    {
      id: QUADBRAIN_BRAINS.CHATGPT_OPERATOR,
      name: 'Actions GPT Brain',
      role: 'External command cockpit through OpenAPI-style actions with owner approval and proof-required routing.',
      required: false,
    },
    {
      id: QUADBRAIN_BRAINS.IDE_AGENT,
      name: 'IDE Agent Brain',
      role: 'Repo, terminal, patch, test, build, browser proof, and local artifact validation through local or IDE bridges.',
      required: false,
    },
    {
      id: QUADBRAIN_BRAINS.EXTERNAL_EXPERIENCE,
      name: 'External Experience Brain',
      role: 'Apps and MCP cockpit for panels, reports, review UI, customer audit surfaces, cost firewall control, model/media governance, and interactive project control.',
      required: false,
    },
  ],
});

export function getQuadBrainStatus() {
  const enterpriseArchitecture = getEnterpriseArchitectureStatus({ compact: true });
  return {
    generatedAt: new Date().toISOString(),
    truthLabel: 'QUADBRAIN_ENTERPRISE_OVERLAY_READY',
    canon: QUADBRAIN_CANON,
    capabilityMatrix: QUADBRAIN_CAPABILITY_MATRIX,
    surfaces: QUADBRAIN_SURFACES,
    enterpriseArchitecture,
    roadmap: getEnterpriseExpansionRoadmap(),
  };
}

export function routeQuadBrainSurface({ surface = QUADBRAIN_SURFACES.STUDIO_NATIVE_PANEL, abilityClass = QUADBRAIN_ABILITY_CLASSES.REPORT } = {}) {
  const externalSurfaces = new Set([
    QUADBRAIN_SURFACES.APPS_MCP_COCKPIT,
    QUADBRAIN_SURFACES.ACTIONS_GPT,
    QUADBRAIN_SURFACES.ENTERPRISE_ARCHITECTURE_PANEL,
    QUADBRAIN_SURFACES.PROOF_LEDGER_PANEL,
    QUADBRAIN_SURFACES.CUSTOMER_AUDIT_REPORT,
    QUADBRAIN_SURFACES.COST_FIREWALL_CONSOLE,
    QUADBRAIN_SURFACES.MEDIA_MODEL_GOVERNANCE_PANEL,
  ]);
  const externalSurface = externalSurfaces.has(surface);
  const selectedBrain = externalSurface ? QUADBRAIN_BRAINS.EXTERNAL_EXPERIENCE : QUADBRAIN_BRAINS.STUDIO;
  const capability = QUADBRAIN_CAPABILITY_MATRIX[selectedBrain];
  const supported = Boolean(capability?.abilities?.includes(abilityClass));

  return {
    success: supported,
    truthLabel: supported ? 'QUADBRAIN_ENTERPRISE_ROUTE_READY' : 'QUADBRAIN_ENTERPRISE_ROUTE_BLOCKED',
    selectedBrain,
    surface,
    abilityClass,
    supported,
    requiresStudioGateway: selectedBrain !== QUADBRAIN_BRAINS.STUDIO,
    proofRequired: true,
    architectureLayer: surface === QUADBRAIN_SURFACES.COST_FIREWALL_CONSOLE
      ? 'cost-economics-layer'
      : surface === QUADBRAIN_SURFACES.MEDIA_MODEL_GOVERNANCE_PANEL
        ? 'media-model-layer'
        : surface === QUADBRAIN_SURFACES.CUSTOMER_AUDIT_REPORT
          ? 'platform-readiness-layer'
          : 'surface-layer',
    generatedAt: new Date().toISOString(),
  };
}
