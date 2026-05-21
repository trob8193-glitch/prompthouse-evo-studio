import { describe, it, expect } from 'vitest';
import {
  THEME_PROFILES,
  getThemeProfile,
  listThemeProfiles
} from '../src/core/theme-evolution/ThemeProfiles.js';
import {
  THEME_TRUTH_STATES,
  DEFAULT_THEME_POLICY,
  normalizeThemePolicy,
  assertThemeChangeAllowed,
  requiresThemeApproval
} from '../src/core/theme-evolution/ThemePolicy.js';
import {
  contrastRatio,
  runThemeAccessibilityCheck,
  runThemePerformanceCheck
} from '../src/core/theme-evolution/ThemeChecks.js';

describe('Theme Evolution Engine', () => {

  // ─── ThemeProfiles ─────────────────────────────────────────────────
  describe('ThemeProfiles', () => {
    it('has at least 5 predefined theme profiles', () => {
      const profiles = listThemeProfiles();
      expect(profiles.length).toBeGreaterThanOrEqual(5);
    });

    it('each profile has required palette and motion fields', () => {
      for (const profile of listThemeProfiles()) {
        expect(profile.id).toBeDefined();
        expect(profile.name).toBeDefined();
        expect(profile.scope).toBeDefined();
        expect(profile.palette).toBeDefined();
        expect(profile.palette.primary).toBeDefined();
        expect(profile.palette.background).toBeDefined();
        expect(profile.palette.text).toBeDefined();
        expect(profile.motion).toBeDefined();
        expect(typeof profile.motion.intensity).toBe('number');
      }
    });

    it('getThemeProfile returns evoCore by default', () => {
      const profile = getThemeProfile();
      expect(profile.id).toBe('evoCore');
    });

    it('getThemeProfile falls back to evoCore for unknown id', () => {
      const profile = getThemeProfile('nonexistent_theme_xyz');
      expect(profile.id).toBe('evoCore');
    });

    it('getThemeProfile returns correct theme for valid id', () => {
      const profile = getThemeProfile('nightForge');
      expect(profile.id).toBe('nightForge');
      expect(profile.name).toBe('NightForge');
    });
  });

  // ─── ThemePolicy ───────────────────────────────────────────────────
  describe('ThemePolicy', () => {
    it('THEME_TRUTH_STATES contains all expected states', () => {
      expect(THEME_TRUTH_STATES.IDLE).toBe('IDLE');
      expect(THEME_TRUTH_STATES.APPROVED).toBe('APPROVED');
      expect(THEME_TRUTH_STATES.BLOCKED).toBe('BLOCKED');
      expect(THEME_TRUTH_STATES.APPLIED).toBe('APPLIED');
      expect(THEME_TRUTH_STATES.ROLLED_BACK).toBe('ROLLED_BACK');
    });

    it('DEFAULT_THEME_POLICY blocks sensitive UI targets', () => {
      expect(DEFAULT_THEME_POLICY.blockedTargets).toContain('payment-confirm-button');
      expect(DEFAULT_THEME_POLICY.blockedTargets).toContain('delete-confirm-button');
      expect(DEFAULT_THEME_POLICY.blockedTargets).toContain('production-deploy-button');
    });

    it('normalizeThemePolicy merges user overrides with defaults', () => {
      const custom = normalizeThemePolicy({ minimumContrastRatio: 7.0 });
      expect(custom.minimumContrastRatio).toBe(7.0);
      expect(custom.requireApproval).toBe(true); // preserved from default
    });

    it('assertThemeChangeAllowed blocks restricted scopes', () => {
      const result = assertThemeChangeAllowed({ scope: 'admin-secret-panel' });
      expect(result.allowed).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('assertThemeChangeAllowed blocks sensitive targets', () => {
      const result = assertThemeChangeAllowed({
        scope: 'dashboard',
        targets: ['payment-confirm-button']
      });
      expect(result.allowed).toBe(false);
      expect(result.reasons[0]).toContain('Blocked sensitive visual target');
    });

    it('assertThemeChangeAllowed allows safe changes', () => {
      const result = assertThemeChangeAllowed({
        scope: 'dashboard',
        targets: ['sidebar-background'],
        motionIntensity: 0.3
      });
      expect(result.allowed).toBe(true);
    });

    it('assertThemeChangeAllowed blocks excessive motion', () => {
      const result = assertThemeChangeAllowed({
        scope: 'dashboard',
        motionIntensity: 0.95
      });
      expect(result.allowed).toBe(false);
    });

    it('requiresThemeApproval returns true by default', () => {
      expect(requiresThemeApproval()).toBe(true);
    });
  });

  // ─── ThemeChecks ───────────────────────────────────────────────────
  describe('ThemeChecks', () => {
    it('contrastRatio returns a valid number for two hex colors', () => {
      const ratio = contrastRatio('#ffffff', '#000000');
      expect(ratio).toBeGreaterThanOrEqual(21);
    });

    it('contrastRatio returns ~1 for identical colors', () => {
      const ratio = contrastRatio('#333333', '#333333');
      expect(ratio).toBe(1);
    });

    it('runThemeAccessibilityCheck passes for evoCore', () => {
      const profile = getThemeProfile('evoCore');
      const result = runThemeAccessibilityCheck(profile);
      expect(result.passed).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('runThemeAccessibilityCheck fails for low contrast themes', () => {
      const badProfile = {
        palette: {
          background: '#333333',
          surface: '#3a3a3a',
          text: '#444444',
          muted: '#393939',
          primary: '#3b3b3b'
        }
      };
      const result = runThemeAccessibilityCheck(badProfile);
      expect(result.passed).toBe(false);
      expect(result.failures.length).toBeGreaterThan(0);
    });

    it('runThemePerformanceCheck passes for normal motion profiles', () => {
      const profile = getThemeProfile('evoCore');
      const result = runThemePerformanceCheck(profile);
      expect(result.passed).toBe(true);
    });

    it('runThemePerformanceCheck reports motion intensity', () => {
      const profile = getThemeProfile('dangerMode');
      const result = runThemePerformanceCheck(profile);
      expect(result.motionIntensity).toBe(0.55);
      expect(result.pageTransition).toBe('warning-pulse');
    });
  });
});
