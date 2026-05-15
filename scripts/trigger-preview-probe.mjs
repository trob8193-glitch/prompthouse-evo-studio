import { runVercelPreviewDeploy } from '../server/services/vercel-preview-runner.js';
import dotenv from 'dotenv';
dotenv.config({ override: true });

async function runProbe() {
  console.log('🚀 Triggering Vercel Preview Deploy Probe...');
  
  // Mock owner approval
  const ownerApproval = {
    granted: true,
    scope: 'deploy',
    receiptId: 'PROBE-' + Date.now().toString(36).toUpperCase(),
    grantedAt: new Date().toISOString(),
    actor: 'studio_owner'
  };

  const result = await runVercelPreviewDeploy({ ownerApproval });
  
  if (result.ok) {
    console.log('✅ PROBE SUCCESS');
    console.log(`URL: ${result.deploymentUrl}`);
    console.log(`ID: ${result.deploymentId}`);
    console.log(`Receipt: ${result.receiptId}`);
  } else {
    console.error('❌ PROBE FAILED');
    console.error(JSON.stringify(result, null, 2));
  }
}

runProbe();
