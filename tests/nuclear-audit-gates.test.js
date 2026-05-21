/**
 * Nuclear Static Audit Gates — Test Coverage
 * Covers: verify-studio, audit-imports, audit-css-vars gate systems
 */
import { describe, it, expect } from 'vitest';
import { runNuclearTruthAudit } from '../src/core/audit/NuclearTruthAudit.js';

const ROOT = process.cwd();

describe('Nuclear Static Audit Gates', () => {
  let report;

  it('runs the nuclear truth audit without crashing', () => {
    report = runNuclearTruthAudit(ROOT);
    expect(report).toBeDefined();
    expect(report.id).toBe('nuclear_truth_audit');
    expect(report.generatedAt).toBeDefined();
  });

  it('returns a valid truth state', () => {
    expect(['verified', 'recommended', 'broken', 'blocked']).toContain(report.truthState);
  });

  it('returns a numeric score between 0 and 100', () => {
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('summary includes expected counters', () => {
    expect(typeof report.summary.modulesScanned).toBe('number');
    expect(typeof report.summary.uiFiles).toBe('number');
    expect(typeof report.summary.functions).toBe('number');
    expect(typeof report.summary.buttons).toBe('number');
    expect(typeof report.summary.apiRoutes).toBe('number');
    expect(typeof report.summary.apiCalls).toBe('number');
    expect(typeof report.summary.brokenWires).toBe('number');
  });

  it('scans a meaningful number of files', () => {
    expect(report.summary.modulesScanned).toBeGreaterThan(10);
  });

  it('detects API routes', () => {
    expect(report.summary.apiRoutes).toBeGreaterThan(0);
  });

  it('findings array is present and capped', () => {
    expect(Array.isArray(report.findings)).toBe(true);
    expect(report.findings.length).toBeLessThanOrEqual(300);
  });

  it('each finding has severity, file, line, and message', () => {
    for (const finding of report.findings.slice(0, 10)) {
      expect(['critical', 'high', 'medium', 'low']).toContain(finding.severity);
      expect(typeof finding.file).toBe('string');
      expect(typeof finding.line).toBe('number');
      expect(typeof finding.message).toBe('string');
    }
  });

  it('brokenWires array identifies missing backend routes', () => {
    expect(Array.isArray(report.brokenWires)).toBe(true);
    for (const wire of report.brokenWires.slice(0, 5)) {
      expect(wire.method).toBeDefined();
      expect(wire.path).toBeDefined();
      expect(wire.message).toContain('No matching backend route');
    }
  });

  it('routesSample includes discovered Express routes', () => {
    expect(Array.isArray(report.routesSample)).toBe(true);
    if (report.routesSample.length > 0) {
      expect(report.routesSample[0]).toHaveProperty('method');
      expect(report.routesSample[0]).toHaveProperty('path');
    }
  });
});
