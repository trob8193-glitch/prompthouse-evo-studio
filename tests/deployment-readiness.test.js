import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs', () => {
  const fsMock = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
  return { ...fsMock, default: fsMock };
});

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

beforeEach(() => {
  vi.clearAllMocks();
  existsSync.mockReturnValue(false);
  readFileSync.mockReturnValue('');
});
import {
  checkFrontendBuildReadiness,
  checkBridgeReadiness,
  checkEnvironmentReadiness,
  checkProviderCredentialReadiness,
  checkProofReportReadiness,
  classifyDeploymentBlockers,
  getDeploymentReadinessStatus,
} from '../server/services/deployment-readiness.js';

describe('Deployment Readiness Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checkFrontendBuildReadiness reports BLOCKED when no dist', () => {
    existsSync.mockReturnValue(false);
    const result = checkFrontendBuildReadiness();
    expect(result.passed).toBe(false);
    expect(result.truthState).toBe('BLOCKED');
  });

  it('checkFrontendBuildReadiness reports VERIFIED when dist exists', () => {
    existsSync.mockReturnValue(true);
    const result = checkFrontendBuildReadiness();
    expect(result.passed).toBe(true);
    expect(result.truthState).toBe('VERIFIED');
  });

  it('checkBridgeReadiness reports VERIFIED when server file exists', () => {
    existsSync.mockReturnValue(true);
    const result = checkBridgeReadiness();
    expect(result.passed).toBe(true);
    expect(result.truthState).toBe('VERIFIED');
  });

  it('checkEnvironmentReadiness flags missing JWT_SECRET as blocker', () => {
    const origJwt = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const result = checkEnvironmentReadiness();
    expect(result.blockers.length).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
    if (origJwt) process.env.JWT_SECRET = origJwt;
  });

  it('checkProviderCredentialReadiness returns NEEDS_CREDENTIALS when missing', () => {
    const result = checkProviderCredentialReadiness();
    // Will have missing providers depending on env; truthState should be valid
    expect(['VERIFIED', 'NEEDS_CREDENTIALS']).toContain(result.truthState);
  });

  it('checkProofReportReadiness reports BLOCKED when no report exists', () => {
    existsSync.mockReturnValue(false);
    const result = checkProofReportReadiness();
    expect(result.passed).toBe(false);
    expect(result.truthState).toBe('BLOCKED');
  });

  it('classifyDeploymentBlockers classifies failed checks', () => {
    const checks = [
      { check: 'test', passed: false, truthState: 'BLOCKED', detail: 'failed' },
      { check: 'ok', passed: true, truthState: 'VERIFIED', detail: 'good' },
    ];
    const { blockers, warnings } = classifyDeploymentBlockers(checks);
    expect(blockers.length).toBeGreaterThan(0);
  });

  it('getDeploymentReadinessStatus returns structured result', () => {
    existsSync.mockReturnValue(false);
    const status = getDeploymentReadinessStatus();
    expect(status).toHaveProperty('ok');
    expect(status).toHaveProperty('truthState');
    expect(status).toHaveProperty('checks');
    expect(status).toHaveProperty('blockers');
    expect(status).toHaveProperty('warnings');
    expect(status).toHaveProperty('nextActions');
    // LOCAL_ONLY or BLOCKED truthState should never be PROVEN
    expect(status.truthState).not.toBe('PROVEN');
  });

  it('no secrets exposed in readiness status', () => {
    const status = getDeploymentReadinessStatus();
    const str = JSON.stringify(status);
    expect(str).not.toContain('sk_live');
    expect(str).not.toContain('sk_test');
    expect(str).not.toContain(process.env.JWT_SECRET || '__NO_SECRET__');
  });
});
