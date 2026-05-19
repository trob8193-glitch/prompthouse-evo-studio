export const SPINECORE_VERSION = '1.0.0';

export const SPINECORE_MODULES = [
  'CURRICULUM',
  'LESSON_CAPTURE',
  'RANKING',
  'QUEUE',
  'SCENARIOS',
  'ARENA',
  'CONTRACT',
  'DIFFS',
  'HEATMAP',
  'PROMPT_VARIANTS',
  'CAPSULES',
  'STOP_GATE',
  'ORCHESTRATOR'
];

export function nowIso() {
  return new Date().toISOString();
}
