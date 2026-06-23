import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';

import registerEnterpriseArchitectureRoutes from '../generated_apis/enterprise_architecture_routes.js';
import registerQuadBrainRoutes from '../generated_apis/quadbrain_routes.js';
import registerTriBrainRoutes from '../generated_apis/tribrain_routes.js';
import { writeMemory, getMemoryGraph } from '../src/core/evo-layer/memory/MemoryGraph.js';
import { inferMemoryHealth } from '../src/core/evo-layer/memory/MemoryQueryEngine.js';
import { applyPatchProposal } from '../src/core/evolution/PatchApplier.js';
import { buildPatchProposal } from '../src/core/evolution/PatchProposalEngine.js';
import { runEvolutionCycle } from '../src/core/evolution/index.js';
import { buildDaemonReadinessReport, readLatestDaemonReadiness } from '../src/core/evo-layer/daemons/DaemonReadiness.js';
import {
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_BRAINS,
  TRIBRAIN_RISK_LEVELS,
  createTriBrainCommandEnvelope,
  createTriBrainSystem,
  validateTriBrainCommand,
} from '../src/core/tribrain/index.js';
import {
  QUADBRAIN_ABILITY_CLASSES,
  QUADBRAIN_SURFACES,
  getQuadBrainStatus,
  routeQuadBrainSurface,
} from '../src/core/quadbrain/index.js';
import {
  getEnterpriseArchitectureStatus,
  getEnterpriseExpansionRoadmap,
} from '../src/core/architecture/EnterpriseArchitectureContract.js';

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ph-brain-stack-'));
}

function createRouteHarness(register) {
  const handlers = {};
  const app = {
    get(route, handler) { handlers[`GET ${route}`] = handler; },
    post(route, handler) { handlers[`POST ${route}`] = handler; },
  };
  register(app);
  return handlers;
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

describe('Evo Layer memory graph', () => {
  it('can be read without options and reports a ready truth state', () => {
    const graph = getMemoryGraph();
    expect(graph.success).toBe(true);
    expect(graph.truthState).toBe('EVO_LAYER_MEMORY_GRAPH_READY');
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
  });

  it('records memory and computes low-risk health in an isolated root', () => {
    const rootDir = tempRoot();
    const record = writeMemory({ rootDir, type: 'execution_result', data: { status: 'SUCCESS', adapter: 'studio' } });
    const graph = getMemoryGraph({ rootDir });
    const health = inferMemoryHealth({ rootDir });

    expect(record.id).toMatch(/^mem_/);
    expect(graph.nodes).toHaveLength(1);
    expect(health.risk).toBe('LOW');
  });
});

describe('Self-Evolution proposal completion path', () => {
  it('creates a proof-only proposal when no deterministic patch is needed', async () => {
    const proposal = await buildPatchProposal({
      rootDir: tempRoot(),
      objective: 'Complete local brain stack readiness',
    });

    expect(proposal.verificationOnly).toBe(true);
    expect(proposal.blockedReasons).toEqual(['No suggestion provided']);
    expect(proposal.files).toEqual([]);
  });

  it('allows proof-only proposals to pass through the patch applier without source changes', async () => {
    const workspaceDir = tempRoot();
    const proposal = await buildPatchProposal({
      rootDir: workspaceDir,
      objective: 'Complete local brain stack readiness',
    });

    const applied = await applyPatchProposal({ workspaceDir, proposal });
    expect(applied.success).toBe(true);
    expect(applied.changedFiles).toEqual([]);
  });

  it('runs quick proof-only cycles without creating a source-mutation sandbox', async () => {
    const rootDir = tempRoot();
    fs.writeFileSync(path.join(rootDir, 'promptbridge-server.js'), 'const ok = true;\n', 'utf8');

    const result = await runEvolutionCycle({
      rootDir,
      objective: 'Complete local brain stack readiness',
      mode: 'proof',
      applyFixes: true,
      runTests: false,
      runBuild: false,
      proofProfile: 'quick',
    });

    expect(result.success).toBe(true);
    expect(result.truthState).toBe('PROOF_PASSED');
    expect(result.proof.commandCount).toBe(1);
    expect(result.comparison.improved).toBe(true);
    expect(result.receipt.workspace.strategy).toBe('proof_only_no_source_mutation');
  }, 20000);
});

describe('Daemon readiness proof', () => {
  it('writes a local 100% daemon readiness receipt for valid entrypoints', () => {
    const rootDir = tempRoot();
    fs.mkdirSync(path.join(rootDir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'scripts', 'fake-daemon.mjs'), 'export const daemon = true;\n', 'utf8');

    const report = buildDaemonReadinessReport({
      rootDir,
      entrypoints: [{ id: 'fake-daemon', path: 'scripts/fake-daemon.mjs', command: 'node scripts/fake-daemon.mjs' }],
    });
    const latest = readLatestDaemonReadiness({ rootDir });

    expect(report.success).toBe(true);
    expect(report.truthState).toBe('LOCAL_DAEMON_STACK_READY');
    expect(report.localCompletion).toBe(100);
    expect(latest.truthState).toBe('LOCAL_DAEMON_STACK_READY');
  });
});

describe('TriBrain contract runtime', () => {
  it('creates valid proof-required command envelopes', () => {
    const command = createTriBrainCommandEnvelope({
      sourceBrain: TRIBRAIN_BRAINS.STUDIO,
      intent: 'RUN_PLATFORM_AUDIT',
      abilityClass: TRIBRAIN_ABILITY_CLASSES.AUDIT,
      riskLevel: TRIBRAIN_RISK_LEVELS.LOW,
    });

    expect(command.proofRequired).toBe(true);
    expect(validateTriBrainCommand(command).valid).toBe(true);
  });

  it('routes low-risk audits to the studio brain when available', () => {
    const system = createTriBrainSystem();
    const response = system.plan({
      sourceBrain: TRIBRAIN_BRAINS.STUDIO,
      intent: 'RUN_PLATFORM_AUDIT',
      abilityClass: TRIBRAIN_ABILITY_CLASSES.AUDIT,
      riskLevel: TRIBRAIN_RISK_LEVELS.LOW,
      payload: { projectId: 'studio-core' },
    }, {
      role: 'builder',
      userId: 'test-user',
      tenantId: 'tenant-test',
      projectIds: ['studio-core'],
    });

    expect(response.status).toBe('completed');
    expect(response.evidence.selectedBrain).toBe(TRIBRAIN_BRAINS.STUDIO);
  });

  it('blocks critical production actions without owner approval', () => {
    const response = createTriBrainSystem().plan({
      sourceBrain: TRIBRAIN_BRAINS.STUDIO,
      intent: 'DEPLOY_PRODUCTION',
      abilityClass: TRIBRAIN_ABILITY_CLASSES.IMPLEMENT,
      riskLevel: TRIBRAIN_RISK_LEVELS.CRITICAL,
      payload: { projectId: 'studio-core' },
    }, {
      role: 'developer',
      userId: 'test-user',
      tenantId: 'tenant-test',
      projectIds: ['studio-core'],
    });

    expect(['BLOCKED', 'NEEDS_APPROVAL']).toContain(response.truthState);
    expect(response.requiresUserDecision).toBe(true);
  });
});

describe('Enterprise architecture expansion contract', () => {
  it('publishes infrastructure layers, product surfaces, and proof tiers', () => {
    const status = getEnterpriseArchitectureStatus();
    const roadmap = getEnterpriseExpansionRoadmap();

    expect(status.success).toBe(true);
    expect(status.truthLabel).toBe('ENTERPRISE_ARCHITECTURE_EXPANSION_READY');
    expect(status.layerCount).toBeGreaterThanOrEqual(8);
    expect(status.productSurfaceCount).toBeGreaterThanOrEqual(5);
    expect(status.proofTiers.VERIFIED.minimumEvidence).toContain('tests-pass');
    expect(roadmap.phases).toHaveLength(5);
  });

  it('exposes enterprise architecture routes for dashboards and cockpits', () => {
    const handlers = createRouteHarness(registerEnterpriseArchitectureRoutes);
    const statusRes = createResponse();
    handlers['GET /api/enterprise-architecture/status']({ query: { compact: 'true' } }, statusRes);

    expect(statusRes.body.success).toBe(true);
    expect(statusRes.body.architecture.truthLabel).toBe('ENTERPRISE_ARCHITECTURE_EXPANSION_READY');

    const productsRes = createResponse();
    handlers['GET /api/enterprise-architecture/products']({}, productsRes);
    expect(productsRes.body.products.some(product => product.id === 'software-audit')).toBe(true);
  });
});

describe('QuadBrain overlay runtime', () => {
  it('reports the four-brain enterprise overlay and routes external surfaces through the gateway contract', () => {
    const status = getQuadBrainStatus();
    const route = routeQuadBrainSurface({
      surface: QUADBRAIN_SURFACES.APPS_MCP_COCKPIT,
      abilityClass: 'visualize',
    });

    expect(status.truthLabel).toBe('QUADBRAIN_ENTERPRISE_OVERLAY_READY');
    expect(status.canon.brains).toHaveLength(4);
    expect(status.enterpriseArchitecture.truthLabel).toBe('ENTERPRISE_ARCHITECTURE_EXPANSION_READY');
    expect(route.success).toBe(true);
    expect(route.requiresStudioGateway).toBe(true);
  });

  it('routes new enterprise product surfaces to the correct architecture layers', () => {
    const costRoute = routeQuadBrainSurface({
      surface: QUADBRAIN_SURFACES.COST_FIREWALL_CONSOLE,
      abilityClass: QUADBRAIN_ABILITY_CLASSES.GOVERN_COST,
    });
    const auditRoute = routeQuadBrainSurface({
      surface: QUADBRAIN_SURFACES.CUSTOMER_AUDIT_REPORT,
      abilityClass: QUADBRAIN_ABILITY_CLASSES.RELEASE_VERDICT,
    });

    expect(costRoute.success).toBe(true);
    expect(costRoute.architectureLayer).toBe('cost-economics-layer');
    expect(auditRoute.success).toBe(true);
    expect(auditRoute.architectureLayer).toBe('platform-readiness-layer');
  });
});

describe('TriBrain and QuadBrain routes', () => {
  it('exposes TriBrain status and route planning', () => {
    const handlers = createRouteHarness(registerTriBrainRoutes);
    const statusRes = createResponse();
    handlers['GET /api/tribrain/status']({ headers: {} }, statusRes);
    expect(statusRes.body.status.truthLabel).toBe('TRIBRAIN_CONTRACT_READY');

    const routeRes = createResponse();
    handlers['POST /api/tribrain/route']({
      headers: { 'x-tribrain-role': 'builder', 'x-project-ids': 'studio-core' },
      body: { intent: 'RUN_PLATFORM_AUDIT' },
    }, routeRes);
    expect(routeRes.body.success).toBe(true);
    expect(routeRes.body.plan.status).toBe('completed');
  });

  it('exposes QuadBrain status and surface routing', () => {
    const handlers = createRouteHarness(registerQuadBrainRoutes);
    const statusRes = createResponse();
    handlers['GET /api/quadbrain/status']({}, statusRes);
    expect(statusRes.body.status.truthLabel).toBe('QUADBRAIN_ENTERPRISE_OVERLAY_READY');

    const routeRes = createResponse();
    handlers['POST /api/quadbrain/route']({
      body: { surface: QUADBRAIN_SURFACES.STUDIO_NATIVE_PANEL, abilityClass: 'report' },
    }, routeRes);
    expect(routeRes.body.success).toBe(true);
    expect(routeRes.body.route.success).toBe(true);
  });
});
