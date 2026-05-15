/**
 * PH EVO STUDIO — ENV VALIDATION SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Read-only validation of environment variables.
 * Never exposes raw secret values. Reports only boolean states
 * and length validity.
 */

const REQUIRED_SECRETS = [
  { key: 'JWT_SECRET', minLength: 24, blocker: true },
  { key: 'PH_EVO_MASTER_KEY', minLength: 24, blocker: true },
];

const REQUIRED_CONFIG = [
  { key: 'CORS_ORIGINS', label: 'CORS Origins' },
  { key: 'VITE_BRIDGE_URL', label: 'Bridge URL' },
  { key: 'DEPLOY_TARGET', label: 'Deploy Target' },
  { key: 'DEPLOY_ALLOW_PRODUCTION', label: 'Deploy Allow Production' },
];

const OPTIONAL_PROVIDER_KEYS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
  { key: 'VERCEL_TOKEN', label: 'Vercel Token' },
  { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key' },
];

/**
 * Validate that a secret env var exists and meets minimum length.
 * Never returns the raw value.
 */
export function validateSecretLength(name, minLength = 24) {
  const val = process.env[name];
  const configured = val !== undefined && val !== '';
  const lengthValid = configured && val.length >= minLength;
  return {
    key: name,
    configured,
    lengthValid,
    length: configured ? val.length : 0,
    minLength,
  };
}

/**
 * Returns a safe summary of all env configuration.
 * No raw secret values are ever included.
 */
export function getSafeEnvSummary() {
  const secrets = REQUIRED_SECRETS.map(s => ({
    ...validateSecretLength(s.key, s.minLength),
    blocker: s.blocker,
  }));

  const config = REQUIRED_CONFIG.map(c => {
    const val = process.env[c.key];
    const configured = val !== undefined && val !== '';
    return {
      key: c.key,
      label: c.label,
      configured,
      // Safe to expose non-secret config values
      value: configured ? val : null,
    };
  });

  const providers = OPTIONAL_PROVIDER_KEYS.map(p => {
    const val = process.env[p.key];
    const configured = val !== undefined && val !== '';
    return {
      key: p.key,
      label: p.label,
      configured,
      // Never expose provider key values
    };
  });

  const deployTarget = process.env.DEPLOY_TARGET || 'local';
  const productionAllowed = process.env.DEPLOY_ALLOW_PRODUCTION === 'true';

  return {
    secrets,
    config,
    providers,
    deployTarget,
    productionAllowed,
    mode: deployTarget === 'local' ? 'LOCAL' : 'PRODUCTION',
  };
}

/**
 * Classify overall environment readiness.
 * Returns a truth state string.
 */
export function classifyEnvReadiness() {
  const summary = getSafeEnvSummary();

  // Check if any blocker secrets are missing or too short
  const missingBlockers = summary.secrets.filter(s => s.blocker && (!s.configured || !s.lengthValid));
  if (missingBlockers.length > 0) {
    return {
      truthState: 'NEEDS_CREDENTIALS',
      blockers: missingBlockers.map(b => `${b.key}: ${!b.configured ? 'not set' : `too short (${b.length} < ${b.minLength})`}`),
    };
  }

  // Check required config
  const missingConfig = summary.config.filter(c => !c.configured);
  if (missingConfig.length > 0) {
    return {
      truthState: 'BLOCKED',
      blockers: missingConfig.map(c => `${c.key}: not configured`),
    };
  }

  // Production mode requires additional checks
  if (summary.mode === 'PRODUCTION') {
    if (!summary.productionAllowed) {
      return {
        truthState: 'BLOCKED',
        blockers: ['DEPLOY_ALLOW_PRODUCTION is false — production deploy not authorized'],
      };
    }
    const missingProviders = summary.providers.filter(p => !p.configured && p.key === 'VERCEL_TOKEN');
    if (missingProviders.length > 0) {
      return {
        truthState: 'PROVIDER_GATED',
        blockers: missingProviders.map(p => `${p.key}: required for production deploy`),
      };
    }
  }

  // Local mode can be VERIFIED without Vercel token
  if (summary.mode === 'LOCAL') {
    return {
      truthState: summary.productionAllowed ? 'BLOCKED' : 'VERIFIED',
      blockers: summary.productionAllowed
        ? ['DEPLOY_ALLOW_PRODUCTION=true in LOCAL mode is invalid — set DEPLOY_TARGET=vercel first']
        : [],
    };
  }

  return { truthState: 'VERIFIED', blockers: [] };
}

/**
 * Full environment validation status for API response.
 */
export function getEnvValidationStatus() {
  const summary = getSafeEnvSummary();
  const readiness = classifyEnvReadiness();

  return {
    timestamp: new Date().toISOString(),
    truthState: readiness.truthState,
    mode: summary.mode,
    deployTarget: summary.deployTarget,
    productionAllowed: summary.productionAllowed,
    secrets: summary.secrets,
    config: summary.config,
    providers: summary.providers,
    blockers: readiness.blockers,
    truth_label: readiness.truthState,
  };
}
