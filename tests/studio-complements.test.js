import { describe, expect, it } from 'vitest';
import {
  buildAsyncWorkflowPlan,
  buildCounterpartRegistry,
  buildLaunchPlan,
  buildRealityTwin,
  routeProductIdea,
} from '../src/studio-complements.js';

describe('studio complements', () => {
  it('routes a commerce idea into the commerce lane', () => {
    const route = routeProductIdea({
      idea: 'Build a checkout and subscription store for PromptHouse commerce',
    });

    expect(route.lane).toBe('commerce_flow');
    expect(route.defaults.needsLaunch).toBe(true);
  });

  it('marks a counterpart as active when required endpoints and stores exist', () => {
    const registry = buildCounterpartRegistry({
      availableEndpoints: [
        'GET /status',
        'GET /api/studio-os/registry',
        'GET /api/studio-os/inspector',
        'POST /build',
        'POST /api/self-implementation/cycle',
        'GET /api/evo-runtime/status',
      ],
      availableStores: ['proof_receipts', 'models'],
    });

    const productBody = registry.find((item) => item.id === 'studio_os_product_body');
    const kernel = registry.find((item) => item.id === 'execution_kernel_director');

    expect(productBody.status).toBe('active');
    expect(kernel.status).toBe('active');
  });

  it('keeps launch readiness false until external gates are configured', () => {
    const route = routeProductIdea({ idea: 'Launch a mobile commerce app' });
    const plan = buildLaunchPlan({ route, hasCommerce: true });

    expect(plan.ready).toBe(false);
    expect(plan.checks.find((item) => item.id === 'commerce-live-key').status).toBe('missing');
    expect(plan.checks.find((item) => item.id === 'owner-approval').status).toBe('required');
  });

  it('builds contradictions when proof outpaces runtime verification', () => {
    const reality = buildRealityTwin({
      registry: [
        { id: 'a', truth: 'built' },
        { id: 'b', truth: 'recommended' },
        { id: 'c', truth: 'recommended' },
      ],
      proofReceipts: [{ status: 'verified' }, { status: 'built' }],
      selfImplementation: { summary: { missing: 0 } },
      evoRuntime: { status: 'idle' },
    });

    expect(reality.contradictions).toContain('proof_outpaces_runtime');
    expect(reality.contradictions).toContain('model_proof_without_verified_runtime');
  });

  it('adds training capture only when a flow needs training', () => {
    const workflow = buildAsyncWorkflowPlan({
      route: routeProductIdea({ idea: 'Build an AI studio tool' }),
      needsTraining: true,
    });

    expect(workflow.some((job) => job.name === 'training_capture')).toBe(true);
  });
});
