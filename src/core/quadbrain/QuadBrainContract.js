import {
  TRIBRAIN_BRAINS,
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_CAPABILITY_MATRIX,
  TRIBRAIN_COMMAND_MODES,
} from '../tribrain/index.js';

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
});

export const QUADBRAIN_ABILITY_CLASSES = Object.freeze({
  ...TRIBRAIN_ABILITY_CLASSES,
  VISUALIZE: 'visualize',
  INTERACT: 'interact',
  DESIGN_ASSET: 'design_asset',
  REVIEW_PATCH: 'review_patch',
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
      QUADBRAIN_ABILITY_CLASSES.ESCALATE,
    ],
    localCapable: false,
    canExecute: false,
    canApprove: false,
    defaultMode: TRIBRAIN_COMMAND_MODES.PROPOSAL_ONLY,
    authority: 'External Apps and MCP cockpit for visual panels, review surfaces, proof ledger display, and user-facing interaction.',
    surfaces: [QUADBRAIN_SURFACES.APPS_MCP_COCKPIT],
  },
});

export const QUADBRAIN_CANON = Object.freeze({
  name: QUADBRAIN_NAME,
  rule: 'QuadBrain keeps the Studio as the engine. External surfaces display, route, request, and review through Studio Gateway and proof systems.',
  brains: [
    {
      id: QUADBRAIN_BRAINS.STUDIO,
      name: 'Studio Brain',
      role: 'Native rules, memory, bots, daemons, audits, project context, and local fallback behavior.',
      required: true,
    },
    {
      id: QUADBRAIN_BRAINS.CHATGPT_OPERATOR,
      name: 'Actions GPT Brain',
      role: 'External command cockpit through OpenAPI-style actions.',
      required: false,
    },
    {
      id: QUADBRAIN_BRAINS.IDE_AGENT,
      name: 'IDE Agent Brain',
      role: 'Repo, terminal, patch, test, build, and browser proof through local or IDE bridges.',
      required: false,
    },
    {
      id: QUADBRAIN_BRAINS.EXTERNAL_EXPERIENCE,
      name: 'External Experience Brain',
      role: 'Apps and MCP cockpit for panels, reports, review UI, and interactive project control.',
      required: false,
    },
  ],
});

export function getQuadBrainStatus() {
  return {
    generatedAt: new Date().toISOString(),
    truthLabel: 'QUADBRAIN_OVERLAY_READY',
    canon: QUADBRAIN_CANON,
    capabilityMatrix: QUADBRAIN_CAPABILITY_MATRIX,
    surfaces: QUADBRAIN_SURFACES,
  };
}

export function routeQuadBrainSurface({ surface = QUADBRAIN_SURFACES.STUDIO_NATIVE_PANEL, abilityClass = QUADBRAIN_ABILITY_CLASSES.REPORT } = {}) {
  const externalSurface = surface === QUADBRAIN_SURFACES.APPS_MCP_COCKPIT || surface === QUADBRAIN_SURFACES.ACTIONS_GPT;
  const selectedBrain = externalSurface ? QUADBRAIN_BRAINS.EXTERNAL_EXPERIENCE : QUADBRAIN_BRAINS.STUDIO;
  const capability = QUADBRAIN_CAPABILITY_MATRIX[selectedBrain];
  const supported = Boolean(capability?.abilities?.includes(abilityClass));

  return {
    success: supported,
    truthLabel: supported ? 'QUADBRAIN_ROUTE_READY' : 'QUADBRAIN_ROUTE_BLOCKED',
    selectedBrain,
    surface,
    abilityClass,
    supported,
    requiresStudioGateway: selectedBrain !== QUADBRAIN_BRAINS.STUDIO,
    proofRequired: true,
    generatedAt: new Date().toISOString(),
  };
}
