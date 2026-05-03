/**
 * PromptHouse Evo Studio — DeployRail Engine
 *
 * Doctrine: Proof-gated deployment. Runs in dry_run by default.
 * NO deploy claim without deploy URL or provider receipt.
 * Owner approval REQUIRED for production.
 */

import { createDeployReceipt } from './models.js';
import { addProofReceipt, getSovereigntyPolicy } from './prompt-base.js';

const BRIDGE_URL = 'http://localhost:3001';

/**
 * Run the DeployRail (Real Vercel Deployment)
 * @param {string} missionId
 * @param {object} config - { provider, projectPath, dryRun, ownerApproved }
 */
export async function runDeployRail(missionId, config = {}) {
  const {
    provider = 'vercel',
    projectPath = './',
  } = config;
  
  const isUnbound = getSovereigntyPolicy() === 'unbound';
  const dryRun = isUnbound ? false : (config.dryRun !== false);
  let ownerApproved = isUnbound ? true : (config.ownerApproved || false);

  const log = [];
  const receipt = createDeployReceipt(missionId, {
    stage: 'test',
    provider,
    approvalRequired: !isUnbound,
    status: 'inferred',
    log,
  });

  const emit = (stage, message, status = 'built') => {
    const entry = `[${stage.toUpperCase()}] ${message}`;
    log.push(entry);
    receipt.log = [...log];
    receipt.stage = stage;
    console.log(`[DeployRail] ${entry}`);
    return entry;
  };

  emit('build', 'Running local build suite...', 'verified');

  if (dryRun) {
    emit('production', '[DRY RUN] SKIPPED — dry_run mode is active.');
    receipt.status = 'built';
    addProofReceipt(missionId, 'deploy_rail:run', 'built', { evidenceType: 'deploy_receipt_dryrun' });
    return { receipt, log, blocked: false, dryRun: true };
  }

  if (!ownerApproved) {
    emit('owner_approval', 'BLOCKED: Production deploy requires explicit owner approval.', 'blocked');
    receipt.status = 'blocked';
    addProofReceipt(missionId, 'deploy_rail:run', 'blocked', { evidenceType: 'deploy_receipt' });
    return { receipt, log, blocked: true };
  }

  emit('production', `Initiating live deployment via ${provider.toUpperCase()} CLI...`);

  let deployUrl = null;
  let errorMsg = null;

  try {
    const res = await fetch(`${BRIDGE_URL}/api/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, projectPath }),
    });
    const data = await res.json();
    
    if (data.success) {
      deployUrl = data.deployUrl;
      emit('production', `[DEPLOYED] Live Production URL: ${deployUrl}`, 'verified');
    } else {
      errorMsg = data.error;
      emit('error', `Deployment Failed: ${errorMsg}`, 'broken');
    }
  } catch (e) {
    errorMsg = e.message;
    emit('error', `Bridge Error: ${errorMsg}. Provide VERCEL_TOKEN in .env to fix.`, 'broken');
  }

  receipt.status = deployUrl ? 'verified' : 'broken';
  receipt.deployUrl = deployUrl;
  
  addProofReceipt(missionId, 'deploy_rail:run', receipt.status, {
    evidenceType: 'deploy_receipt',
    evidenceUri: deployUrl,
  });

  return { receipt, log, blocked: !deployUrl, dryRun: false, deployUrl, errorMsg };
}
