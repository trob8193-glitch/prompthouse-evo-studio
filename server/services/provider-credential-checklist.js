import { TRUTH_STATES } from './truth-labels.js';

/**
 * Generates a checklist of provider credentials and determines the overall truth state.
 * @returns {Object} The provider credential checklist.
 */
export function getProviderCredentialChecklist() {
  const providers = [
    { name: 'OpenAI', envKey: 'OPENAI_API_KEY' },
    { name: 'Gemini', envKey: 'GEMINI_API_KEY' },
    { name: 'Stripe', envKey: 'STRIPE_SECRET_KEY' },
    { name: 'Vercel', envKey: 'VERCEL_TOKEN' },
  ];

  const coreKeys = [
    { name: 'JWT Secret', envKey: 'JWT_SECRET' },
    { name: 'Master Key', envKey: 'PH_EVO_MASTER_KEY' },
  ];

  const checklist = {
    providers: providers.map(p => ({
      ...p,
      configured: !!process.env[p.envKey] && process.env[p.envKey].length > 0
    })),
    core: coreKeys.map(k => ({
      ...k,
      configured: !!process.env[k.envKey] && process.env[k.envKey].length > 0
    })),
    blockers: [],
    warnings: [],
    truthState: TRUTH_STATES.LOCAL_ONLY
  };

  // Check core keys
  coreKeys.forEach(k => {
    if (!process.env[k.envKey] || process.env[k.envKey].length === 0) {
      checklist.blockers.push(`Missing core credential: ${k.envKey}`);
    }
  });

  if (checklist.blockers.length > 0) {
    checklist.truthState = TRUTH_STATES.NEEDS_CREDENTIALS;
    return checklist;
  }

  // Check optional providers
  providers.forEach(p => {
    if (!process.env[p.envKey] || process.env[p.envKey].length === 0) {
      checklist.warnings.push(`Missing provider credential: ${p.envKey}`);
    }
  });

  if (checklist.warnings.length > 0) {
    checklist.truthState = TRUTH_STATES.PROVIDER_GATED;
  } else {
    checklist.truthState = TRUTH_STATES.VERIFIED;
  }

  return checklist;
}
