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
    authority: 'External Apps/MCP cockpit for rich visual panels, asset workflow requests, code review surfaces, repair queue UI, proof ledger display, and user-facing QuadBrain interaction.',
    surfaces: [QUADBRAIN_SURFACES.APPS_MCP_COCKPIT],
  },
});

export const QUADBRAIN_CANON = Object.freeze({
  name: QUADBRAIN_NAME,
  rule: 'QuadBrain keeps the Studio as the engine. External GPT/App surfaces display, route, request, and review through the Studio Gateway and proof systems.',
  brains: [
    {
      id: QUADBRAIN_BRAINS.STUDIO,
      name: 'Studio Brain',
      role: 'Native rules, memory, bots, daemons, audits, project context, and fallback behavior.',
      required: true,
    },
    {
      id: QUADBRAIN_BRAINS.CHATGPT_OPERATOR,
      name: 'Actions GPT Brain',
      role: 'Fast external command cockpit through the OpenAPI Actions schema.',
      required: false,
    },
    {
      id: QUADBRAIN_BRAINS.IDE_AGENT,
      name: 'IDE / Antigravity Brain',
      role: 'Repo, terminal, patch, test, build, and browser proof through local/IDE bridges.',
      required: false,
    },
    {
      id: QUADBRAIN_BRAINS.EXTERNAL_EXPERIENCE,
      name: 'External Experience Brain',
      role: 'Apps/MCP visual cockpit for panels, image/code workflows, reports, review UI, and interactive project control.',
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
