/**
 * PH EVO STUDIO — PROVIDER CREDENTIAL CHECKLIST SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Validates configured state of all third-party provider keys.
 * Does not make live provider calls. Never exposes raw secrets.
 */

const PROVIDERS = [
  { key: 'OPENAI_API_KEY', provider: 'OpenAI', requiredFor: 'LLM Generation', type: 'provider' },
  { key: 'GEMINI_API_KEY', provider: 'Gemini', requiredFor: 'Vision & Fast Generation', type: 'provider' },
  { key: 'STRIPE_SECRET_KEY', provider: 'Stripe', requiredFor: 'Live Billing', type: 'provider' },
  { key: 'VERCEL_TOKEN', provider: 'Vercel', requiredFor: 'Production Deployment', type: 'provider' },
];

const LOCAL_SECRETS = [
  { key: 'JWT_SECRET', provider: 'Auth System', requiredFor: 'Session Integrity', type: 'local', minLength: 24 },
  { key: 'PH_EVO_MASTER_KEY', provider: 'Master Logic', requiredFor: 'System Override', type: 'local', minLength: 24 },
];

/**
 * Returns a safe, boolean-only view of configured credentials.
 */
export function getConfiguredProviderCredentialsSafe() {
  const check = (item) => {
    const val = process.env[item.key];
    const configured = val !== undefined && val !== '';
    let lengthValid = undefined;

    if (item.type === 'local' && configured) {
      lengthValid = val.length >= item.minLength;
    }

    return {
      provider: item.provider,
      envKey: item.key,
      requiredFor: item.requiredFor,
      configured,
      ...(lengthValid !== undefined && { lengthValid })
    };
  };

  return {
    providers: PROVIDERS.map(check),
    localSecrets: LOCAL_SECRETS.map(check),
  };
}

/**
 * Get lists of missing optional and required credentials.
 */
export function getMissingProviderCredentials() {
  const safeConfig = getConfiguredProviderCredentialsSafe();

  const missingProviders = safeConfig.providers.filter(p => !p.configured);
  const missingLocal = safeConfig.localSecrets.filter(s => !s.configured || !s.lengthValid);

  return { missingProviders, missingLocal };
}

/**
 * Classifies readiness and Truth State based on missing credentials.
 */
export function classifyProviderCredentialReadiness() {
  const { missingProviders, missingLocal } = getMissingProviderCredentials();

  // Local secrets are hard blockers.
  if (missingLocal.length > 0) {
    return {
      truthState: 'NEEDS_CREDENTIALS',
      blockers: missingLocal.map(s => `Missing or invalid ${s.envKey} (${s.provider})`),
      nextAction: 'Add required minimum 24-character secrets to .env locally.',
    };
  }

  // Provider keys are optional unless actively executing live commands.
  if (missingProviders.length > 0) {
    return {
      truthState: 'PROVIDER_GATED',
      warnings: missingProviders.map(p => `Missing ${p.envKey} (${p.provider})`),
      nextAction: 'Studio is running locally but certain provider integrations will be gated until keys are provided.',
    };
  }

  return {
    truthState: 'VERIFIED',
    nextAction: 'All provider configurations present.',
  };
}

/**
 * Get the full checklist payload for the frontend UI.
 */
export function getProviderCredentialChecklist() {
  const safeConfig = getConfiguredProviderCredentialsSafe();
  const classification = classifyProviderCredentialReadiness();

  return {
    timestamp: new Date().toISOString(),
    truthState: classification.truthState,
    nextAction: classification.nextAction,
    providers: safeConfig.providers,
    localSecrets: safeConfig.localSecrets,
    blockers: classification.blockers || [],
    warnings: classification.warnings || [],
    truth_label: classification.truthState, // Align with bridge TruthBadge expectations
  };
}
