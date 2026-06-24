import { registerToolCheck } from './EvoGitRegistry.js';

function present(name) {
  return Boolean(process.env[name] && String(process.env[name]).trim());
}

export function checkApiAdapters({ rootDir = process.cwd() } = {}) {
  const specs = [
    ['openai_api', 'external_api', 'OPENAI_API_KEY', ['proposal_review', 'code_review', 'agent_runtime']],
    ['vercel_api', 'external_deploy', 'VERCEL_TOKEN', ['deployment_receipts', 'preview_receipts']],
    ['stripe_api', 'external_commerce', 'STRIPE_SECRET_KEY', ['commerce_receipts', 'billing_receipts']],
    ['jwt_secret', 'security_runtime', 'JWT_SECRET', ['signed_bridge_sessions']]
  ];

  return specs.map(([toolId, kind, envName, capabilities]) => {
    const available = present(envName);
    return registerToolCheck({
      rootDir,
      toolId,
      kind,
      available,
      capabilities: available ? capabilities : [],
      reason: available ? null : `${envName} is not configured.`,
      metadata: { envName, configured: available }
    });
  });
}
