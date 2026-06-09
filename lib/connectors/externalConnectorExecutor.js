import crypto from 'crypto';

export const CONNECTOR_TRUTH = Object.freeze({
  LOCAL_ONLY: 'LOCAL_ONLY',
  PROVEN: 'PROVEN',
  PROVIDER_GATED: 'PROVIDER_GATED',
  NEEDS_CREDENTIALS: 'NEEDS_CREDENTIALS',
  NEEDS_OWNER_APPROVAL: 'NEEDS_OWNER_APPROVAL',
  BLOCKED: 'BLOCKED',
  ERROR: 'ERROR',
});

export const CONNECTOR_PROVIDERS = Object.freeze({
  github: {
    envKey: 'GITHUB_TOKEN',
    approvalScope: 'provider_probe',
    endpoint: 'https://api.github.com/user',
  },
  openai: {
    envKey: 'OPENAI_API_KEY',
    approvalScope: 'provider_probe',
    endpoint: 'https://api.openai.com/v1/models',
  },
  stripe: {
    envKey: 'STRIPE_SECRET_KEY',
    approvalScope: 'commerce',
    endpoint: 'https://api.stripe.com/v1/account',
  },
  vercel: {
    envKey: 'VERCEL_TOKEN',
    approvalScope: 'deploy',
    endpoint: 'https://api.vercel.com/v2/user',
  },
});

const PROVIDER_ALIASES = Object.freeze({
  ai: 'openai',
  billing: 'stripe',
  commerce: 'stripe',
  deployment: 'vercel',
  payment: 'stripe',
  payments: 'stripe',
  vcs: 'github',
});

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function readConnectorValue(connector, key, fallbackKey = null) {
  return connector?.[key] ?? (fallbackKey ? connector?.[fallbackKey] : undefined);
}

export function resolveConnectorProvider(connector) {
  const candidates = [
    readConnectorValue(connector, 'type'),
    readConnectorValue(connector, 'connector_id', 'connectorId'),
    readConnectorValue(connector, 'id'),
    readConnectorValue(connector, 'name'),
  ].map(normalizeText).filter(Boolean);

  for (const candidate of candidates) {
    if (CONNECTOR_PROVIDERS[candidate]) return candidate;
    if (PROVIDER_ALIASES[candidate]) return PROVIDER_ALIASES[candidate];
    for (const provider of Object.keys(CONNECTOR_PROVIDERS)) {
      if (candidate.includes(provider)) return provider;
    }
  }

  return null;
}

export function getConnectorApproval(ownerApproval, ownerApprovals, scope) {
  const direct = ownerApproval?.scope === scope ? ownerApproval : null;
  const mapped = ownerApprovals?.[scope] || ownerApprovals?.[scope.replace(/_/g, '-')];
  const approval = direct || mapped;
  return approval?.granted === true ? approval : null;
}

export function getConnectorCredentialState(provider, env = process.env) {
  const definition = CONNECTOR_PROVIDERS[provider];
  if (!definition) {
    return { configured: false, envKey: null, truthState: CONNECTOR_TRUTH.BLOCKED };
  }
  const value = env[definition.envKey] || '';
  return {
    configured: value.trim().length > 0,
    envKey: definition.envKey,
    truthState: value.trim().length > 0 ? CONNECTOR_TRUTH.LOCAL_ONLY : CONNECTOR_TRUTH.NEEDS_CREDENTIALS,
  };
}

export function buildConnectorProbePlan(connector, { mode = 'local', env = process.env } = {}) {
  const provider = resolveConnectorProvider(connector);
  const definition = provider ? CONNECTOR_PROVIDERS[provider] : null;
  const credential = provider ? getConnectorCredentialState(provider, env) : null;

  return {
    provider,
    mode,
    knownProvider: Boolean(definition),
    envKey: definition?.envKey || null,
    approvalScope: definition?.approvalScope || null,
    credentialConfigured: credential?.configured === true,
    endpoint: definition?.endpoint || null,
  };
}

export async function executeConnectorProbe(connector, options = {}) {
  const {
    id = `hs_${crypto.randomUUID().slice(0, 12)}`,
    mode = 'local',
    ownerApproval = null,
    ownerApprovals = null,
    env = process.env,
    fetchImpl = globalThis.fetch,
    timeoutMs = 8000,
    receiptSink = null,
  } = options;

  const provider = resolveConnectorProvider(connector);
  const connectorId = readConnectorValue(connector, 'connector_id', 'connectorId') || connector?.id || provider || 'unknown';
  const connectorName = connector?.name || provider || connectorId;
  const base = {
    id,
    connectorId,
    connectorName,
    provider,
    mode,
    timestamp: new Date().toISOString(),
  };

  if (mode !== 'live') {
    return buildLocalConnectorResult(base, connector);
  }

  const definition = provider ? CONNECTOR_PROVIDERS[provider] : null;
  if (!definition) {
    return withReceipt({
      ...base,
      status: 'blocked',
      truthState: CONNECTOR_TRUTH.BLOCKED,
      authenticated: false,
      reason: 'Unknown external connector provider.',
    }, receiptSink);
  }

  const credential = env[definition.envKey] || '';
  if (!credential.trim()) {
    return withReceipt({
      ...base,
      status: 'blocked',
      truthState: CONNECTOR_TRUTH.NEEDS_CREDENTIALS,
      authenticated: false,
      requiredEnvKey: definition.envKey,
      approvalScope: definition.approvalScope,
      reason: `${definition.envKey} is required for live ${provider} connector execution.`,
    }, receiptSink);
  }

  const approval = getConnectorApproval(ownerApproval, ownerApprovals, definition.approvalScope);
  if (!approval) {
    return withReceipt({
      ...base,
      status: 'blocked',
      truthState: CONNECTOR_TRUTH.NEEDS_OWNER_APPROVAL,
      authenticated: false,
      requiredEnvKey: definition.envKey,
      approvalScope: definition.approvalScope,
      reason: `Owner approval scope ${definition.approvalScope} is required for live ${provider} connector execution.`,
    }, receiptSink);
  }

  if (typeof fetchImpl !== 'function') {
    return withReceipt({
      ...base,
      status: 'error',
      truthState: CONNECTOR_TRUTH.ERROR,
      authenticated: false,
      requiredEnvKey: definition.envKey,
      approvalScope: definition.approvalScope,
      reason: 'Fetch runtime is unavailable.',
    }, receiptSink);
  }

  try {
    const response = await fetchJsonWithTimeout(definition.endpoint, {
      headers: providerHeaders(provider, credential),
      timeoutMs,
      fetchImpl,
    });

    if (!response.ok) {
      return withReceipt({
        ...base,
        status: 'error',
        truthState: CONNECTOR_TRUTH.ERROR,
        authenticated: false,
        requiredEnvKey: definition.envKey,
        approvalScope: definition.approvalScope,
        httpStatus: response.status,
        reason: `${provider} probe returned HTTP ${response.status}.`,
        response: summarizeProviderResponse(provider, response.body),
      }, receiptSink);
    }

    return withReceipt({
      ...base,
      status: 'connected',
      truthState: CONNECTOR_TRUTH.PROVEN,
      authenticated: true,
      external: true,
      requiredEnvKey: definition.envKey,
      approvalScope: definition.approvalScope,
      httpStatus: response.status,
      reason: `Live ${provider} connector probe succeeded.`,
      response: summarizeProviderResponse(provider, response.body),
    }, receiptSink);
  } catch (error) {
    return withReceipt({
      ...base,
      status: 'error',
      truthState: CONNECTOR_TRUTH.ERROR,
      authenticated: false,
      requiredEnvKey: definition.envKey,
      approvalScope: definition.approvalScope,
      reason: error?.name === 'AbortError'
        ? `Live ${provider} connector probe timed out.`
        : `Live ${provider} connector probe failed: ${error?.message || String(error)}`,
    }, receiptSink);
  }
}

function buildLocalConnectorResult(base, connector) {
  const status = normalizeText(connector?.status);
  const connected = status === 'connected' || status === 'configured';
  return {
    ...base,
    status: connected ? 'connected' : 'blocked',
    truthState: connected ? CONNECTOR_TRUTH.LOCAL_ONLY : CONNECTOR_TRUTH.PROVIDER_GATED,
    authenticated: false,
    external: false,
    contractReachable: connected,
    reason: connected
      ? 'Local connector contract is reachable; no external provider call was requested.'
      : 'Connector requires credentials or owner approval before use.',
  };
}

async function fetchJsonWithTimeout(url, { headers, timeoutMs, fetchImpl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { method: 'GET', headers, signal: controller.signal });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { text: text.slice(0, 500) };
    }
    return { ok: response.ok, status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

function providerHeaders(provider, token) {
  const common = { Authorization: `Bearer ${token}` };
  if (provider === 'github') {
    return {
      ...common,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'prompthouse-evo-studio',
    };
  }
  if (provider === 'stripe') {
    return {
      ...common,
      'Stripe-Version': '2024-06-20',
    };
  }
  return common;
}

function summarizeProviderResponse(provider, body) {
  if (!body || typeof body !== 'object') return null;
  if (provider === 'github') {
    return {
      login: body.login || null,
      id: body.id || null,
      type: body.type || null,
    };
  }
  if (provider === 'openai') {
    const models = Array.isArray(body.data) ? body.data : [];
    return {
      object: body.object || null,
      modelCount: models.length,
      firstModel: models[0]?.id || null,
    };
  }
  if (provider === 'stripe') {
    return {
      id: body.id || null,
      object: body.object || null,
      country: body.country || null,
      chargesEnabled: body.charges_enabled ?? null,
      payoutsEnabled: body.payouts_enabled ?? null,
    };
  }
  if (provider === 'vercel') {
    const user = body.user || body;
    return {
      id: user.id || user.uid || null,
      username: user.username || null,
      email: user.email ? '[redacted-email]' : null,
    };
  }
  return null;
}

function withReceipt(result, receiptSink) {
  if (typeof receiptSink !== 'function') return result;
  try {
    const receipt = receiptSink({
      provider: result.provider || 'unknown',
      action: 'external_connector_probe',
      status: result.status,
      truthState: result.truthState,
      message: result.reason,
      requestPayload: {
        connectorId: result.connectorId,
        mode: result.mode,
        approvalScope: result.approvalScope || null,
        requiredEnvKey: result.requiredEnvKey || null,
      },
      responsePayload: {
        httpStatus: result.httpStatus || null,
        response: result.response || null,
      },
    });
    return { ...result, receiptId: receipt?.id || null };
  } catch (error) {
    return { ...result, receiptError: error?.message || String(error) };
  }
}

export default executeConnectorProbe;
