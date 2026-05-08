// src/studio-complements.js

class StudioComplements {
  // Placeholder for any shared logic or data
}

function routeProductIdea(params) {
  const { idea } = params;
  const lane = idea.includes('commerce') ? 'commerce_flow' : 'generic_flow';
  const defaults = { needsLaunch: lane === 'commerce_flow' };
  return { lane, defaults };
}

function buildCounterpartRegistry(params) {
  const { availableEndpoints, availableStores } = params;
  const registry = [
    {
      id: 'studio_os_product_body',
      status: 'inactive',
    },
    {
      id: 'execution_kernel_director',
      status: 'inactive',
    },
  ];

  if (
    availableEndpoints.includes('GET /status') &&
    availableEndpoints.includes('GET /api/studio-os/registry') &&
    availableEndpoints.includes('POST /build') &&
    availableStores.includes('proof_receipts') &&
    availableStores.includes('models')
  ) {
    registry[0].status = 'active';
    registry[1].status = 'active';
  }

  return registry;
}

function buildLaunchPlan(params) {
  const { route, hasCommerce } = params;
  const ready = route.defaults.needsLaunch && hasCommerce ? false : true;
  const checks = [
    { id: 'commerce-live-key', status: 'missing' },
    { id: 'owner-approval', status: 'required' }
  ];
  return { ready, checks };
}

function buildRealityTwin(params) {
  const { registry, proofReceipts, selfImplementation, evoRuntime } = params;
  const contradictions = [];

  if (
    proofReceipts.some((receipt) => receipt.status === 'verified') &&
    evoRuntime.status !== 'verified'
  ) {
    contradictions.push('proof_outpaces_runtime');
    contradictions.push('model_proof_without_verified_runtime');
  }

  return { contradictions };
}

function buildAsyncWorkflowPlan(params) {
  const { route, needsTraining } = params;
  const workflow = [];

  if (route.defaults.needsLaunch) {
    workflow.push({ name: 'launch_preparation' });
  }

  if (needsTraining) {
    workflow.push({ name: 'training_capture' });
  }

  return workflow;
}

export {
  routeProductIdea,
  buildCounterpartRegistry,
  buildLaunchPlan,
  buildRealityTwin,
  buildAsyncWorkflowPlan,
  StudioComplements,
};
