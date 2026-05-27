export const MASTER_KERNEL_NAME = 'EvoCore Master Orchestration Kernel';

export const MASTER_TRUTH_LABELS = Object.freeze([
  'MASTER_READY',
  'MISSION_PLANNED',
  'PROOF_REQUIRED',
  'BLOCKED_BY_SENTINEL',
  'OWNER_APPROVAL_REQUIRED',
  'RECEIPT_REQUIRED'
]);

export const AUTHORITY_MAP = Object.freeze([
  { id: 'spinecore', name: 'SpineCore', authority: 'studio contract, stop gate, memory law' },
  { id: 'platform-sentinel', name: 'Platform Sentinel', authority: 'final readiness verdict and repair queue' },
  { id: 'self-evolution', name: 'Self-Evolution', authority: 'safe proposals, sandbox patching, proof cycles, rollback' },
  { id: 'module-maturity', name: 'Module Maturity', authority: 'module completeness scoring' },
  { id: 'cost-firewall', name: 'Cost Firewall', authority: 'provider and cost review' },
  { id: 'model-registry', name: 'Model Registry', authority: 'active model selection, provider capability routing, local model discovery' },
  { id: 'evo-diffuser', name: 'Evo Diffuser', authority: 'image generation routing, cloud image provider gating, local Stable Diffusion routing' },
  { id: 'convergence', name: 'Convergence Amplifier', authority: 'compaction, consolidation, amplification proposals' },
  { id: 'crucible', name: 'Crucible', authority: 'file stress scanning and issue discovery' },
  { id: 'singularity', name: 'Singularity', authority: 'scoped repair experiments after gates' },
  { id: 'omni', name: 'Omni Orchestrator', authority: 'mission routing and bot assignment' },
  { id: 'evo-llm', name: 'Evo LLM', authority: 'dataset, eval, model-card and reasoning support' }
]);
