export * from './TriBrainAbilityContract.js';
export * from './TriBrainPermissions.js';
export * from './TriBrainRouter.js';
export * from './FinalResponseArbiter.js';

import {
  TRIBRAIN_BRAINS,
  TRIBRAIN_NAME,
  createTriBrainCommandEnvelope,
  validateTriBrainCommand,
} from './TriBrainAbilityContract.js';
import { createTriBrainPermissionContext } from './TriBrainPermissions.js';
import { createTriBrainRouter } from './TriBrainRouter.js';
import { createFinalResponseArbiter } from './FinalResponseArbiter.js';

export function createTriBrainSystem(config = {}) {
  const router = createTriBrainRouter({
    brainSettings: config.brainSettings,
    fallbackPolicy: config.fallbackPolicy,
  });
  const arbiter = createFinalResponseArbiter(config.arbiter);

  return {
    name: TRIBRAIN_NAME,
    router,
    arbiter,
    status() {
      return {
        generatedAt: new Date().toISOString(),
        name: TRIBRAIN_NAME,
        truthLabel: 'TRIBRAIN_CONTRACT_READY',
        brains: Object.values(TRIBRAIN_BRAINS),
        router: router.status(),
        rule: 'All TriBrain work must route through shared ability contracts, role-aware permissions, proof gates, approval gates, and final response arbitration.',
      };
    },
    plan(input = {}, permissionInput = {}) {
      const command = createTriBrainCommandEnvelope(input);
      const validation = validateTriBrainCommand(command);
      const permissionContext = createTriBrainPermissionContext(permissionInput);

      if (!validation.valid) {
        return arbiter.arbitrate({
          command,
          permissionContext,
          responses: [{
            commandId: command.id,
            respondingBrain: TRIBRAIN_BRAINS.STUDIO,
            truthState: 'BLOCKED',
            status: 'blocked',
            summary: 'TriBrain command failed contract validation.',
            findings: validation.errors.map(message => ({ severity: 'high', module: 'TriBrainAbilityContract', message })),
            evidence: { validation },
            nextActions: ['Repair command envelope before routing.'],
            requiresUserDecision: true,
          }],
        });
      }

      const routed = router.route(command, permissionContext);
      return arbiter.arbitrate({ command, permissionContext, responses: [routed] });
    },
  };
}
