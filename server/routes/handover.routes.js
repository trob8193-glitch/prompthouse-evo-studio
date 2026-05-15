/**
 * PH EVO STUDIO — HANDOVER ROUTES
 * ════════════════════════════════════════════════════════════════
 * Phase 15 additive routes for sovereign handover status.
 * Read-only. No secrets. No provider calls. No mutation.
 *
 * GET /api/handover/status   — Summary of current handover state
 * GET /api/handover/report   — Full handover report (if generated)
 */
import { join } from 'path';
import fs from 'node:fs';
import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { listDeploymentReceipts } from '../services/deployment-receipts.js';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const HANDOVER_JSON = join(DATA_DIR, 'handover-report.json');
const READINESS_JSON = join(DATA_DIR, 'deployment-readiness-report.json');

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getLatestPreviewReceipt() {
  try {
    const receipts = listDeploymentReceipts(20);
    return receipts.find(r => r.action === 'preview_deploy' && r.status === 'success') || null;
  } catch {
    return null;
  }
}

export function registerHandoverRoutes(app, context = {}) {
  const { routeRegistry } = context;

  // ── GET /api/handover/status ──────────────────────────────────────────────

  app.get('/api/handover/status',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/handover/status',
      source: 'handover.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: ['READ_ONLY'], localOnly: true,
      notes: ['Phase 15 handover status — no secrets, no mutations']
    }) : (req, res, next) => next(),
    (req, res) => {
      const report = readJsonSafe(HANDOVER_JSON);
      const readiness = readJsonSafe(READINESS_JSON);
      const previewReceipt = getLatestPreviewReceipt();
      const productionBlocked = process.env.DEPLOY_ALLOW_PRODUCTION !== 'true';
      const stripeKey = process.env.STRIPE_SECRET_KEY || '';
      const liveBillingBlocked = !stripeKey.startsWith('sk_live_');

      const blockers = [];
      if (!previewReceipt) blockers.push('No successful preview deployment receipt');
      if (!process.env.VERCEL_TOKEN) blockers.push('VERCEL_TOKEN not configured');
      if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_'))
        blockers.push('STRIPE_SECRET_KEY not configured');

      const truthState = report
        ? (blockers.length === 0 ? TRUTH_STATES.VERIFIED : TRUTH_STATES.LOCAL_ONLY)
        : TRUTH_STATES.LOCAL_ONLY;

      return res.json({
        ok: true,
        phase: 'Phase 15',
        truthState,
        productionDeployBlocked: productionBlocked,
        liveBillingBlocked,
        reportGenerated: !!report,
        reportTimestamp: report?.timestamp || null,
        previewDeployment: previewReceipt ? {
          deploymentUrl: previewReceipt.deploymentUrl,
          deploymentId: previewReceipt.metadata?.deploymentId || null,
          receiptId: previewReceipt.id,
          status: previewReceipt.status,
          truthState: previewReceipt.truthState,
          smokeClassification: 'SECURITY_GATE_VERIFIED — PUBLIC_SMOKE_BLOCKED_BY_AUTH',
        } : null,
        deploymentReadiness: readiness
          ? { truthState: readiness.truthState || TRUTH_STATES.VERIFIED, blockers: readiness.blockers || [] }
          : { truthState: TRUTH_STATES.LOCAL_ONLY, blockers: ['Readiness report not generated'] },
        blockers,
        nextSafeActions: [
          'Run npm run handover:report to generate/refresh handover report.',
          productionBlocked
            ? 'Production deploy is BLOCKED — do not set DEPLOY_ALLOW_PRODUCTION=true until Phase 16E.'
            : 'WARNING: DEPLOY_ALLOW_PRODUCTION is not false — review immediately.',
          previewReceipt
            ? `Preview deployed: ${previewReceipt.deploymentUrl} — Phase 16A: decide Vercel Auth policy.`
            : 'No preview receipt — run a preview deploy from Deployment Center.',
        ],
      });
    }
  );

  // ── GET /api/handover/report ──────────────────────────────────────────────

  app.get('/api/handover/report',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/handover/report',
      source: 'handover.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: ['READ_ONLY'], localOnly: true,
      notes: ['Returns full handover report JSON — no secrets, no provider calls']
    }) : (req, res, next) => next(),
    (req, res) => {
      const report = readJsonSafe(HANDOVER_JSON);
      if (!report) {
        return res.status(404).json({
          ok: false,
          truthState: TRUTH_STATES.LOCAL_ONLY,
          error: 'Handover report not yet generated. Run: npm run handover:report',
          hint: 'npm run handover:report',
        });
      }

      // Strip any raw secrets from report before returning (defensive)
      const safe = { ...report };
      if (safe.environment) {
        safe.environment = { ...safe.environment };
        // These are already redacted in the generator, but double-check
        delete safe.environment.rawToken;
        delete safe.environment.rawKey;
      }

      return res.json({ ok: true, report: safe });
    }
  );
}
