import { describe, it, expect } from 'vitest';
import {
  TRUTH_STATES,
  normalizeTruthState,
  getTruthStateLabel,
  getTruthStateDescription,
  getTruthStateTone,
} from '../src/constants/truth-states.js';

describe('Truth States', () => {
  const REQUIRED_STATES = [
    'BUILT', 'VERIFIED', 'BLOCKED', 'PROVEN', 'LOCAL_ONLY',
    'PROVIDER_GATED', 'NEEDS_CREDENTIALS', 'NEEDS_OWNER_APPROVAL',
    'ERROR', 'UNKNOWN',
  ];

  it('all required states are defined', () => {
    for (const state of REQUIRED_STATES) {
      expect(TRUTH_STATES[state]).toBe(state);
    }
  });

  it('invalid values normalize to UNKNOWN', () => {
    expect(normalizeTruthState(null)).toBe('UNKNOWN');
    expect(normalizeTruthState(undefined)).toBe('UNKNOWN');
    expect(normalizeTruthState(42)).toBe('UNKNOWN');
    expect(normalizeTruthState('')).toBe('UNKNOWN');
    expect(normalizeTruthState('NOT_A_STATE')).toBe('UNKNOWN');
    expect(normalizeTruthState('banana')).toBe('UNKNOWN');
  });

  it('valid states normalize correctly', () => {
    expect(normalizeTruthState('BUILT')).toBe('BUILT');
    expect(normalizeTruthState('built')).toBe('BUILT');
    expect(normalizeTruthState('  VERIFIED  ')).toBe('VERIFIED');
    expect(normalizeTruthState('local_only')).toBe('LOCAL_ONLY');
  });

  it('every required state has a label', () => {
    for (const state of REQUIRED_STATES) {
      const label = getTruthStateLabel(state);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('every required state has a description', () => {
    for (const state of REQUIRED_STATES) {
      const desc = getTruthStateDescription(state);
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(10);
    }
  });

  it('every required state has a tone', () => {
    for (const state of REQUIRED_STATES) {
      const tone = getTruthStateTone(state);
      expect(['success', 'danger', 'warning', 'info', 'neutral']).toContain(tone);
    }
  });

  it('blocked/gated/credential/approval/error states are NOT success tone', () => {
    const nonSuccessStates = [
      'BLOCKED', 'PROVIDER_GATED', 'NEEDS_CREDENTIALS',
      'NEEDS_OWNER_APPROVAL', 'ERROR',
    ];
    for (const state of nonSuccessStates) {
      expect(getTruthStateTone(state)).not.toBe('success');
    }
  });
});
