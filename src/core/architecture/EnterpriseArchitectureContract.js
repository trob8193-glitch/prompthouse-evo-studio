export const PH_EVO_ARCHITECTURE_VERSION = '2026.06.enterprise-expansion.v1';

export const PH_EVO_VALUE_PROPOSITION = Object.freeze({
  short: 'Proof-gated autonomous AI software command center.',
  full: 'PH Evo Studio routes software, model, media, audit, deployment, and business work across governed brains, proof systems, cost firewalls, readiness sentinels, and owner-controlled approval gates.',
  claimBoundary: 'The studio may claim exact-combination uniqueness after local proof runs pass; individual components should be described as integrated capabilities rather than invented-from-nothing miracles.',
});

export const PH_EVO_INFRASTRUCTURE_LAYERS = Object.freeze([
  {
    id: 'surface-layer',
    name: 'Surface Layer',
    purpose: 'Expose Studio control through native panels, ChatGPT Actions, Apps/MCP cockpit, IDE bridges, dashboards, and customer-facing audit reports.',
    ownedBy: ['QuadBrain', 'PromptBridge', 'MCP SSE transport', 'Engine Dashboard'],
    requiredProof: ['route-contract-proof', 'dead-surface-audit', 'button-to-route-receipts'],
  },
  {
    id: 'brain-routing-layer',
    name: 'Brain Routing Layer',
    purpose: 'Select the correct brain and mode for each command while preserving shared ability contracts and fallback behavior.',
    ownedBy: ['TriBrainAbilityContract', 'TriBrainRouter', 'QuadBrainContract', 'FinalResponseArbiter'],
    requiredProof: ['brain-stack-contract-tests', 'permission-context-tests', 'fallback-route-receipts'],
  },
  {
    id: 'execution-layer',
    name: 'Execution Layer',
    purpose: 'Run approved work through local, IDE, bridge, deployment, connector, and terminal adapters without pretending unsafe work completed.',
    ownedBy: ['ExecutionPipeline', 'Evo Terminal', 'Adapter Executor', 'VercelAdapter', 'ExternalConnectorRoutes'],
    requiredProof: ['command-receipt', 'stdout-stderr-capture', 'rollback-reference', 'owner-approval-reference'],
  },
  {
    id: 'proof-governance-layer',
    name: 'Proof Governance Layer',
    purpose: 'Convert AI actions into reviewable evidence using maturity reports, signed manifests, auditor review, truth states, and promotion policies.',
    ownedBy: ['Gatekeeper', 'ProofManifest', 'AuditorBot', 'ReviewStore', 'ModuleMaturityEngine'],
    requiredProof: ['signed-proof-manifest', 'maturity-receipt', 'auditor-review', 'promotion-policy-verdict'],
  },
  {
    id: 'platform-readiness-layer',
    name: 'Platform Readiness Layer',
    purpose: 'Expose blockers, release verdicts, repair queues, online readiness, receipts, and platform audit state.',
    ownedBy: ['PlatformSentinel', 'ReleaseVerdictEngine', 'NuclearStaticAudit', 'RealityAudit'],
    requiredProof: ['platform-status-json', 'repair-queue', 'release-verdict', 'online-blockers-report'],
  },
  {
    id: 'cost-economics-layer',
    name: 'Cost Economics Layer',
    purpose: 'Protect AI spend, route models by economics, certify savings claims, and block runaway provider usage.',
    ownedBy: ['CostFirewallV2', 'CostVelocityMonitor', 'ProfitGuardian', 'BudgetRulesEngine', 'SavingsClaimCertifier'],
    requiredProof: ['cost-check', 'cost-summary', 'savings-claims', 'budget-rule-verdict'],
  },
  {
    id: 'autonomous-improvement-layer',
    name: 'Autonomous Improvement Layer',
    purpose: 'Select safe next objectives, propose repairs, run proof-only cycles, and avoid source mutation without receipts.',
    ownedBy: ['AutonomousObjectiveSelector', 'PatchProposalEngine', 'PatchApplier', 'SelfEvolutionCycle'],
    requiredProof: ['objective-score', 'risk-penalty', 'patch-proposal', 'proof-cycle-receipt'],
  },
  {
    id: 'media-model-layer',
    name: 'Media and Model Layer',
    purpose: 'Govern image generation, model routing, Evo LLM dataset/eval/model-card receipts, and local/provider model fallbacks.',
    ownedBy: ['EvoDiffuser', 'UniversalImageAdaptor', 'ModelRouterV2', 'EvoLlmPipeline', 'EvoLlmOrchestrator'],
    requiredProof: ['provider-status', 'image-generation-receipt', 'model-card', 'eval-receipt', 'fallback-reason'],
  },
  {
    id: 'commerce-launch-layer',
    name: 'Commerce and Launch Layer',
    purpose: 'Turn readiness, cost, audit, deployment, portfolio, and marketplace data into sellable customer-facing products.',
    ownedBy: ['StripeRoutes', 'LaunchPilot', 'PortfolioRoutes', 'CommerceMarketplaceRoutes', 'StoreRoutes'],
    requiredProof: ['stripe-health', 'checkout-browser-run', 'handover-report', 'launch-proof'],
  },
]);

export const PH_EVO_PRODUCT_SURFACES = Object.freeze([
  {
    id: 'software-audit',
    name: 'PH Evo AI & Software Audit',
    buyerPain: 'A founder or business owner does not know whether their app is real, shippable, secure, wired, or fake-button theater.',
    sellableOutcome: 'Production readiness report, blocker list, repair queue, release verdict, proof receipts, and next-step implementation plan.',
    backingSystems: ['PlatformSentinel', 'ModuleMaturityEngine', 'NuclearStaticAudit', 'DeadSurfaceAudit', 'RouteDriftAudit'],
    readinessTarget: 'Sell first as a managed audit service, then productize into self-serve reports.',
  },
  {
    id: 'cost-firewall',
    name: 'Cost Firewall V2',
    buyerPain: 'AI teams burn money through uncontrolled model calls, bad prompts, duplicate work, and no provider spend policy.',
    sellableOutcome: 'Spend guardrails, semantic cache, model routing, approval queue, budget rules, and savings certification.',
    backingSystems: ['TokenMeter', 'ProviderPriceRegistry', 'SemanticCache', 'BudgetRulesEngine', 'ProfitGuardian', 'SavingsClaimCertifier'],
    readinessTarget: 'Sell as an AI spend audit and policy layer before full autonomous execution is needed.',
  },
  {
    id: 'quadbrain-cockpit',
    name: 'QuadBrain Cockpit',
    buyerPain: 'Teams use disconnected AI tools with no common permission model, route contract, proof state, or final response arbiter.',
    sellableOutcome: 'One command cockpit across Studio, ChatGPT Actions, IDE agent, and Apps/MCP panels with proof-required routing.',
    backingSystems: ['TriBrain', 'QuadBrain', 'PromptBridge', 'MCP SSE transport', 'FinalResponseArbiter'],
    readinessTarget: 'Sell after route contracts, auth, and proof ledger surfaces are stable.',
  },
  {
    id: 'autonomous-repair-queue',
    name: 'Autonomous Repair Queue',
    buyerPain: 'Nontechnical owners cannot tell what to fix next or which fixes are risky.',
    sellableOutcome: 'Ranked repair objectives with impact, confidence, risk, recurrence, and proof-only execution options.',
    backingSystems: ['AutonomousObjectiveSelector', 'PatchProposalEngine', 'PlatformSentinel', 'Gatekeeper'],
    readinessTarget: 'Bundle inside audits, then expose as monthly maintenance.',
  },
  {
    id: 'media-model-governance',
    name: 'Media and Model Governance',
    buyerPain: 'Generated assets and model usage lack source, provider, prompt, cost, and fallback receipts.',
    sellableOutcome: 'Image/model generation receipts, provider fallback state, eval/model-card proof, and approval-gated asset pipelines.',
    backingSystems: ['EvoDiffuser', 'UniversalImageAdaptor', 'EvoLlmPipeline', 'ModelRouterV2', 'CostFirewallV2'],
    readinessTarget: 'Use internally first, then sell to creators and app teams needing accountable AI assets.',
  },
]);

export const PH_EVO_PROOF_TIERS = Object.freeze({
  DESIGN: {
    truthState: 'DESIGN_PROPOSED',
    minimumEvidence: ['architecture-contract', 'owner-intent', 'risk-classification'],
  },
  WIRED: {
    truthState: 'WIRED_PENDING_PROOF',
    minimumEvidence: ['route-registered', 'test-added', 'script-added'],
  },
  VERIFIED: {
    truthState: 'VERIFIED_WITH_RECEIPTS',
    minimumEvidence: ['tests-pass', 'build-pass', 'audit-pass', 'receipt-written'],
  },
  MARKET_READY: {
    truthState: 'MARKET_READY_WITH_WARNINGS_ALLOWED',
    minimumEvidence: ['release-verdict', 'checkout-proof', 'handover-report', 'support-policy'],
  },
});

export function getEnterpriseArchitectureStatus({ compact = false } = {}) {
  const products = PH_EVO_PRODUCT_SURFACES.map(product => ({
    id: product.id,
    name: product.name,
    backingSystems: product.backingSystems,
    readinessTarget: product.readinessTarget,
  }));

  return {
    success: true,
    truthLabel: 'ENTERPRISE_ARCHITECTURE_EXPANSION_READY',
    version: PH_EVO_ARCHITECTURE_VERSION,
    generatedAt: new Date().toISOString(),
    valueProposition: PH_EVO_VALUE_PROPOSITION,
    layerCount: PH_EVO_INFRASTRUCTURE_LAYERS.length,
    productSurfaceCount: PH_EVO_PRODUCT_SURFACES.length,
    proofTiers: PH_EVO_PROOF_TIERS,
    infrastructureLayers: compact
      ? PH_EVO_INFRASTRUCTURE_LAYERS.map(layer => ({ id: layer.id, name: layer.name, requiredProof: layer.requiredProof }))
      : PH_EVO_INFRASTRUCTURE_LAYERS,
    productSurfaces: compact ? products : PH_EVO_PRODUCT_SURFACES,
  };
}

export function getEnterpriseExpansionRoadmap() {
  return {
    success: true,
    truthLabel: 'ENTERPRISE_EXPANSION_ROADMAP_READY',
    phases: [
      {
        id: 'phase-1-wire-contracts',
        name: 'Wire contracts and proof visibility',
        objectives: ['Expose architecture contract in status surfaces', 'Add proof ledger panels', 'Map every UI control to route and receipt'],
        exitCriteria: ['npm run test', 'npm run audit:dead-surfaces', 'npm run maturity:strict'],
      },
      {
        id: 'phase-2-package-audit-product',
        name: 'Package the AI & Software Audit',
        objectives: ['Create customer report template', 'Bind Platform Sentinel outputs to handover report', 'Create fixed-price audit workflow'],
        exitCriteria: ['platform receipt exists', 'repair queue is exportable', 'checkout proof passes'],
      },
      {
        id: 'phase-3-harden-cost-firewall',
        name: 'Harden Cost Firewall V2',
        objectives: ['Certify savings claims', 'Add provider cost fixtures', 'Block runaway velocity by tenant/org'],
        exitCriteria: ['npm run cost', 'review:cost-firewall passes', 'budget rules tested'],
      },
      {
        id: 'phase-4-govern-media-models',
        name: 'Govern model and diffuser pipelines',
        objectives: ['Attach receipts to image generation', 'Record provider fallback reason', 'Require cost/proof metadata on generated assets'],
        exitCriteria: ['provider status proof', 'image generation receipt', 'model card/eval receipt'],
      },
      {
        id: 'phase-5-market-ready-cockpit',
        name: 'Market-ready QuadBrain cockpit',
        objectives: ['Ship user-facing command cockpit', 'Role-gate risky actions', 'Show final response arbitration and proof states'],
        exitCriteria: ['auth configured', 'button-to-route proof', 'release verdict approved'],
      },
    ],
  };
}

export default {
  PH_EVO_ARCHITECTURE_VERSION,
  PH_EVO_VALUE_PROPOSITION,
  PH_EVO_INFRASTRUCTURE_LAYERS,
  PH_EVO_PRODUCT_SURFACES,
  PH_EVO_PROOF_TIERS,
  getEnterpriseArchitectureStatus,
  getEnterpriseExpansionRoadmap,
};
