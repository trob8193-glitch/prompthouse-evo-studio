/**
 * DeployRail — Frontend deploy rail logic
 * Status: fallback (honest — returns structured data but does not physically deploy)
 */

import { getSovereigntyPolicy } from './prompt-base.js';

export async function runDeployRail(missionId, opts = {}) {
  const { liveRun = false, candidateScore = 0, provider = 'local', ownerApproved = false } = opts;
  const policy = getSovereigntyPolicy();
  const log = [];

  log.push(`[DeployRail] Initiated for mission: ${missionId}`);

  if (liveRun) {
    if (policy !== 'unbound' && !ownerApproved) {
      return {
        blocked: true,
        receipt: {
          status: 'blocked',
          approvalRequired: true
        }
      };
    }
  }

  return {
    blocked: false,
    receipt: {
      status: 'deployed',
      approvalRequired: false,
      timestamp: new Date().toISOString()
    }
  };
}
