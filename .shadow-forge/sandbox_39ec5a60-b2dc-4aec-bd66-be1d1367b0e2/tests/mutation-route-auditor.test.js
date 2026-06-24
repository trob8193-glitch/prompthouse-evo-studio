import { describe, it, expect } from 'vitest';
import {
  extractExpressRoutesWithMiddleware,
  classifyMutationRouteCoverage,
  findUngatedMutationRoutes,
  buildSecurityAuditReport,
} from '../server/services/mutation-route-auditor.js';

const SAMPLE_SOURCE = `
app.get('/api/status', (req, res) => { res.json({ ok: true }); });
app.get('/api/health', (req, res) => { res.json({ ok: true }); });
app.post('/api/auth/register', authRateLimit, enforceJsonObjectBody, async (req, res) => {});
app.post('/api/auth/login', authRateLimit, enforceJsonObjectBody, async (req, res) => {});
app.post('/api/deploy/vercel', maybeRequireAuthOrMaster, enforceJsonObjectBody, requireOwnerApprovalScope('deploy'), async (req, res) => {});
app.post('/api/commerce/checkout', maybeRequireAuthOrMaster, enforceJsonObjectBody, requireOwnerApprovalScope('commerce'), async (req, res) => {});
app.post('/api/config/keys', maybeRequireAuthOrMaster, enforceJsonObjectBody, (req, res) => {});
app.post('/api/files/write', maybeRequireAuthOrMaster, writeRateLimit, enforceJsonObjectBody, async (req, res) => {});
app.post('/api/self-implementation/cycle', maybeRequireAuthOrMaster, enforceJsonObjectBody, async (req, res) => {});
app.post('/api/nightforge/settings', writeRateLimit, enforceJsonObjectBody, (req, res) => {});
app.post('/api/training/ingest', (req, res) => {});
app.post('/api/capture', (req, res) => {});
app.post('/api/promptlink/sync', (req, res) => {});
app.delete('/api/connectors/:id', (req, res) => {});
`;

describe('Mutation Route Auditor', () => {
  describe('extractExpressRoutesWithMiddleware', () => {
    it('detects GET and POST routes', () => {
      const routes = extractExpressRoutesWithMiddleware(SAMPLE_SOURCE);
      expect(routes.length).toBeGreaterThanOrEqual(10);
      const gets = routes.filter((r) => r.method === 'GET');
      const posts = routes.filter((r) => r.method === 'POST');
      expect(gets.length).toBeGreaterThanOrEqual(2);
      expect(posts.length).toBeGreaterThanOrEqual(8);
    });

    it('detects middleware names', () => {
      const routes = extractExpressRoutesWithMiddleware(SAMPLE_SOURCE);
      const deployRoute = routes.find((r) => r.path === '/api/deploy/vercel');
      expect(deployRoute).toBeDefined();
      expect(deployRoute.middleware).toContain('maybeRequireAuthOrMaster');
      expect(deployRoute.middleware).toContain('requireOwnerApprovalScope');
      expect(deployRoute.hasAuthGate).toBe(true);
    });

    it('detects DELETE routes', () => {
      const routes = extractExpressRoutesWithMiddleware(SAMPLE_SOURCE);
      const del = routes.find((r) => r.method === 'DELETE');
      expect(del).toBeDefined();
      expect(del.path).toBe('/api/connectors/:id');
    });
  });

  describe('classifyMutationRouteCoverage', () => {
    it('counts mutations and read-only routes', () => {
      const coverage = classifyMutationRouteCoverage(SAMPLE_SOURCE);
      expect(coverage.readOnly).toBeGreaterThanOrEqual(2);
      expect(coverage.mutations).toBeGreaterThanOrEqual(8);
      expect(coverage.total).toBe(coverage.readOnly + coverage.mutations);
    });

    it('calculates gate percentage', () => {
      const coverage = classifyMutationRouteCoverage(SAMPLE_SOURCE);
      expect(typeof coverage.gatePercentage).toBe('number');
      expect(coverage.gatePercentage).toBeGreaterThanOrEqual(0);
      expect(coverage.gatePercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('findUngatedMutationRoutes', () => {
    it('finds routes without auth middleware', () => {
      const ungated = findUngatedMutationRoutes(SAMPLE_SOURCE);
      expect(ungated.length).toBeGreaterThan(0);
      // Every ungated route should be a mutation (not GET)
      ungated.forEach((r) => {
        expect(['POST', 'PUT', 'PATCH', 'DELETE']).toContain(r.method);
      });
    });

    it('does not flag GET routes as ungated mutation', () => {
      const ungated = findUngatedMutationRoutes(SAMPLE_SOURCE);
      const gets = ungated.filter((r) => r.method === 'GET');
      expect(gets).toHaveLength(0);
    });

    it('classifies path categories', () => {
      const ungated = findUngatedMutationRoutes(SAMPLE_SOURCE);
      const categories = new Set(ungated.map((r) => r.category));
      expect(categories.size).toBeGreaterThan(0);
    });
  });

  describe('buildSecurityAuditReport', () => {
    it('builds a full audit report', () => {
      const report = buildSecurityAuditReport(SAMPLE_SOURCE);
      expect(report.truthState).toBeDefined();
      expect(report.coverage).toBeDefined();
      expect(report.coverage.total).toBeGreaterThan(0);
      expect(report.timestamp).toBeDefined();
    });

    it('does not report VERIFIED when suspicious routes exist', () => {
      const report = buildSecurityAuditReport(SAMPLE_SOURCE);
      if (report.suspiciousRoutes.length > 0) {
        expect(report.truthState).not.toBe('VERIFIED');
      }
    });

    it('categorizes routes by purpose', () => {
      const report = buildSecurityAuditReport(SAMPLE_SOURCE);
      expect(report.routesByCategory).toBeDefined();
      expect(typeof report.routesByCategory.deploy).toBe('number');
      expect(typeof report.routesByCategory.commerce).toBe('number');
    });
  });
});
