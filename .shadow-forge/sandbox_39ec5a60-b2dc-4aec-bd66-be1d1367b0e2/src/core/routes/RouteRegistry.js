export const ROUTE_REGISTRY = Object.freeze([
  { method: 'GET', path: '/status', owner: 'studio-core', surface: 'bridge' },
  { method: 'GET', path: '/api/metrics', owner: 'studio-core', surface: 'bridge' },
  { method: 'POST', path: '/api/auth/register', owner: 'auth', surface: 'bridge' },
  { method: 'POST', path: '/api/auth/login', owner: 'auth', surface: 'bridge' },
  { method: 'GET', path: '/api/auth/me', owner: 'auth', surface: 'bridge' },
  { method: 'POST', path: '/api/config/keys', owner: 'config', surface: 'bridge' },
  { method: 'POST', path: '/api/evo-ledger/log', owner: 'ledger', surface: 'bridge' },
  { method: 'POST', path: '/api/maintenance/run', owner: 'maintenance', surface: 'bridge' },
  { method: 'GET', path: '/api/truth/probe', owner: 'truth', surface: 'bridge' },
  { method: 'POST', path: '/api/evo-lm/chat', owner: 'evo-lm', surface: 'bridge' },
  { method: 'GET', path: '/api/reviews', owner: 'proof', surface: 'bridge' },
  { method: 'GET', path: '/api/proof-docs', owner: 'proof', surface: 'bridge' },
  { method: 'GET', path: '/api/rift/status', owner: 'rift', surface: 'bridge' },
  { method: 'GET', path: '/api/evopulse/nodes', owner: 'evopulse', surface: 'bridge' },
  { method: 'GET', path: '/api/evopulse/routes', owner: 'evopulse', surface: 'bridge' },
  { method: 'GET', path: '/api/ai/models', owner: 'ai-models', surface: 'bridge' },
  { method: 'POST', path: '/api/ai/models/select', owner: 'ai-models', surface: 'bridge' },
  { method: 'GET', path: '/api/evo-bridge/status', owner: 'evo-bridge', surface: 'bridge' },
  { method: 'POST', path: '/api/evo-bridge/run', owner: 'evo-bridge', surface: 'bridge' },
  { method: 'GET', path: '/api/tribrain/status', owner: 'tribrain', surface: 'bridge' },
  { method: 'GET', path: '/api/tribrain/contract', owner: 'tribrain', surface: 'bridge' },
  { method: 'POST', path: '/api/tribrain/route', owner: 'tribrain', surface: 'bridge' },
  { method: 'POST', path: '/api/tribrain/final-response', owner: 'tribrain', surface: 'bridge' },
  { method: 'GET', path: '/api/quadbrain/status', owner: 'quadbrain', surface: 'bridge' },
  { method: 'GET', path: '/api/quadbrain/contract', owner: 'quadbrain', surface: 'bridge' },
  { method: 'POST', path: '/api/quadbrain/route', owner: 'quadbrain', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/status', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/modules', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/receipts', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/repair-queue', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/online-blockers', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/release-verdict', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'POST', path: '/api/platform-sentinel/audit', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'GET', path: '/api/platform-sentinel/repair-plan', owner: 'platform-sentinel', surface: 'bridge' },
  { method: 'POST', path: '/api/platform-sentinel/receipt', owner: 'platform-sentinel', surface: 'bridge' }
]);

export function routeKey(route) {
  return `${String(route.method || 'GET').toUpperCase()} ${route.path}`;
}

export function findRoute(path, method = 'GET') {
  const key = `${String(method).toUpperCase()} ${path}`;
  return ROUTE_REGISTRY.find(route => routeKey(route) === key) || null;
}

export default ROUTE_REGISTRY;
