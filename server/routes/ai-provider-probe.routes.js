import { TRUTH_STATES } from '../services/truth-labels.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { classifyOpenAiKey, classifyGeminiKey } from '../services/ai-provider-status.js';
import { createProviderReceipt } from '../services/provider-receipts.js';
import { requireProviderProbeApproval } from '../middleware/security-gates.js';

// We must securely gate this to prevent random network spending.
export function registerAiProviderProbeRoutes(app, context) {
  const { routeRegistry } = context;

  app.post('/api/ai-providers/openai/probe',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/ai-providers/openai/probe',
      method: 'POST',
      source: 'ai-provider-probe.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.EXECUTE_EXTERNAL], localOnly: true,
    }),
    requireProviderProbeApproval,
    async (req, res) => {
      const status = classifyOpenAiKey();
      if (!status.configured) {
        createProviderReceipt({
          provider: 'openai',
          action: 'provider_probe',
          status: 'blocked',
          truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
          message: status.blockedReason,
        });
        return res.status(400).json({ ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, error: status.blockedReason });
      }

      try {
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        // Tiny cheap probe model: gpt-3.5-turbo (or gpt-4o-mini). We use max_tokens=1
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Ping' }],
            max_tokens: 1
          })
        });

        const data = await response.json();

        if (!response.ok) {
          createProviderReceipt({
            provider: 'openai',
            action: 'provider_probe',
            status: 'failed',
            truthState: TRUTH_STATES.ERROR,
            message: data.error?.message || 'OpenAI API Error',
          });
          return res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: data.error?.message });
        }

        createProviderReceipt({
          provider: 'openai',
          action: 'provider_probe',
          status: 'success',
          truthState: TRUTH_STATES.VERIFIED,
          message: 'Probe successful',
        });

        res.json({ ok: true, truthState: TRUTH_STATES.VERIFIED, data: { message: 'OpenAI probe successful.' } });
      } catch (err) {
        createProviderReceipt({
          provider: 'openai',
          action: 'provider_probe',
          status: 'failed',
          truthState: TRUTH_STATES.ERROR,
          message: err.message,
        });
        res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: err.message });
      }
    }
  );

  app.post('/api/ai-providers/gemini/probe',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/ai-providers/gemini/probe',
      method: 'POST',
      source: 'ai-provider-probe.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.EXECUTE_EXTERNAL], localOnly: true,
    }),
    requireProviderProbeApproval,
    async (req, res) => {
      const status = classifyGeminiKey();
      if (!status.configured) {
        createProviderReceipt({
          provider: 'gemini',
          action: 'provider_probe',
          status: 'blocked',
          truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
          message: status.blockedReason,
        });
        return res.status(400).json({ ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, error: status.blockedReason });
      }

      try {
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Ping" }] }],
            generationConfig: { maxOutputTokens: 1 }
          })
        });

        const data = await response.json();

        if (!response.ok) {
          createProviderReceipt({
            provider: 'gemini',
            action: 'provider_probe',
            status: 'failed',
            truthState: TRUTH_STATES.ERROR,
            message: data.error?.message || 'Gemini API Error',
          });
          return res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: data.error?.message });
        }

        createProviderReceipt({
          provider: 'gemini',
          action: 'provider_probe',
          status: 'success',
          truthState: TRUTH_STATES.VERIFIED,
          message: 'Probe successful',
        });

        res.json({ ok: true, truthState: TRUTH_STATES.VERIFIED, data: { message: 'Gemini probe successful.' } });
      } catch (err) {
        createProviderReceipt({
          provider: 'gemini',
          action: 'provider_probe',
          status: 'failed',
          truthState: TRUTH_STATES.ERROR,
          message: err.message,
        });
        res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: err.message });
      }
    }
  );
}
