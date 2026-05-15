import { TRUTH_STATES } from '../services/truth-labels.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { getAiProviderStatus, classifyOpenAiKey, classifyGeminiKey } from '../services/ai-provider-status.js';

export function registerAiProviderStatusRoutes(app, context) {
  const { routeRegistry } = context;

  // 1. Unified Status Route
  app.get('/api/ai-providers/status',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/ai-providers/status',
      method: 'GET',
      source: 'ai-provider-status.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }),
    (req, res) => {
      const status = getAiProviderStatus();
      res.json({ ok: true, data: status, truthState: TRUTH_STATES.VERIFIED });
    }
  );

  // 2. OpenAI Status Route
  app.get('/api/ai-providers/openai/status',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/ai-providers/openai/status',
      method: 'GET',
      source: 'ai-provider-status.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }),
    (req, res) => {
      const status = classifyOpenAiKey();
      res.json({ ok: true, data: status, truthState: status.truthState });
    }
  );

  // 3. Gemini Status Route
  app.get('/api/ai-providers/gemini/status',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/ai-providers/gemini/status',
      method: 'GET',
      source: 'ai-provider-status.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }),
    (req, res) => {
      const status = classifyGeminiKey();
      res.json({ ok: true, data: status, truthState: status.truthState });
    }
  );
}
