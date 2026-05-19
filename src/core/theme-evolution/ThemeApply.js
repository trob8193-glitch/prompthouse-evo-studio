import { THEME_TRUTH_STATES, DEFAULT_THEME_POLICY } from './ThemePolicy.js';
import { getThemeProfile } from './ThemeProfiles.js';
import { loadThemeMemory, saveThemeMemory, appendThemeReceipt } from './ThemeMemory.js';
import { runThemeAccessibilityCheck, runThemePerformanceCheck } from './ThemeChecks.js';

export function approveThemeEvolution({ rootDir = process.cwd(), themeId = null, actor = 'studio_owner' } = {}) {
  const memory = loadThemeMemory(rootDir);
  const selectedThemeId = themeId || memory.lastPreview?.themeId || 'evoCore';
  memory.approvedThemeId = selectedThemeId;
  memory.updatedAt = new Date().toISOString();
  saveThemeMemory(memory, rootDir);
  return appendThemeReceipt({ action: 'approve', actor, themeId: selectedThemeId, truthState: THEME_TRUTH_STATES.APPROVED }, rootDir);
}

export function applyThemeEvolution({ rootDir = process.cwd(), themeId = null, actor = 'studio_owner', policy = DEFAULT_THEME_POLICY } = {}) {
  const memory = loadThemeMemory(rootDir);
  const selectedThemeId = themeId || memory.approvedThemeId || memory.lastPreview?.themeId || 'evoCore';
  if (policy.requireApproval && memory.approvedThemeId !== selectedThemeId) {
    return appendThemeReceipt({ action: 'apply_blocked', actor, themeId: selectedThemeId, truthState: THEME_TRUTH_STATES.APPROVAL_REQUIRED, blockedReasons: ['Theme must be approved before apply.'] }, rootDir);
  }
  const profile = getThemeProfile(selectedThemeId);
  const accessibility = runThemeAccessibilityCheck(profile, policy);
  const performance = runThemePerformanceCheck(profile, policy);
  if (!accessibility.passed || !performance.passed) {
    return appendThemeReceipt({ action: 'apply_blocked', actor, themeId: selectedThemeId, truthState: THEME_TRUTH_STATES.BLOCKED, blockedReasons: [...accessibility.failures.map(f => `Contrast failed: ${f.pair}`), ...performance.failures] }, rootDir);
  }
  memory.previousThemeId = memory.activeThemeId || 'evoCore';
  memory.activeThemeId = selectedThemeId;
  memory.updatedAt = new Date().toISOString();
  saveThemeMemory(memory, rootDir);
  return appendThemeReceipt({ action: 'apply', actor, themeId: selectedThemeId, truthState: THEME_TRUTH_STATES.APPLIED }, rootDir);
}

export function rollbackThemeEvolution({ rootDir = process.cwd(), actor = 'studio_owner' } = {}) {
  const memory = loadThemeMemory(rootDir);
  const previous = memory.previousThemeId || 'evoCore';
  const current = memory.activeThemeId || 'evoCore';
  memory.activeThemeId = previous;
  memory.approvedThemeId = previous;
  memory.previousThemeId = current;
  memory.updatedAt = new Date().toISOString();
  saveThemeMemory(memory, rootDir);
  return appendThemeReceipt({ action: 'rollback', actor, fromThemeId: current, toThemeId: previous, truthState: THEME_TRUTH_STATES.ROLLED_BACK }, rootDir);
}

export function buildThemeRuntimePayload({ rootDir = process.cwd() } = {}) {
  const memory = loadThemeMemory(rootDir);
  const profile = getThemeProfile(memory.activeThemeId || 'evoCore');
  return {
    themeId: profile.id,
    name: profile.name,
    scope: profile.scope,
    palette: profile.palette,
    motion: profile.motion,
    density: profile.density,
    cssVariables: {
      '--evo-bg': profile.palette.background,
      '--evo-surface': profile.palette.surface,
      '--evo-surface-strong': profile.palette.surfaceStrong,
      '--evo-primary': profile.palette.primary,
      '--evo-secondary': profile.palette.secondary,
      '--evo-accent': profile.palette.accent,
      '--evo-danger': profile.palette.danger,
      '--evo-warning': profile.palette.warning,
      '--evo-text': profile.palette.text,
      '--evo-muted': profile.palette.muted
    }
  };
}
