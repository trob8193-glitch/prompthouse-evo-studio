import { TRUTH_STATES } from '../services/truth-labels.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { classifyStripeCheckoutReadiness, createStripeTestCheckoutSession } from '../services/stripe-test-checkout.js';
import { requireCommerceApproval } from '../middleware/security-gates.js';

export function registerStripeTestCheckoutRoutes(app, context) {
  const { routeRegistry } = context;

  app.get('/api/stripe/test-checkout/readiness',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/stripe/test-checkout/readiness',
      method: 'GET',
      source: 'stripe-test-checkout.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }),
    (req, res) => {
      const readiness = classifyStripeCheckoutReadiness();
      res.json({ ok: true, data: readiness, truthState: TRUTH_STATES.VERIFIED });
    }
  );

  app.post('/api/stripe/test-checkout/session',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/stripe/test-checkout/session',
      method: 'POST',
      source: 'stripe-test-checkout.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.COMMERCE, S.EXECUTE_EXTERNAL], localOnly: true,
    }),
    requireCommerceApproval,
    async (req, res) => {
      try {
        const { amount, currency, successUrl, cancelUrl } = req.body || {};
        const result = await createStripeTestCheckoutSession({
          amount,
          currency,
          successUrl,
          cancelUrl
        });

        if (result.ok) {
          res.json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (error) {
        res.status(500).json({ ok: false, error: error.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );
}
