import { THEME_TRUTH_STATES, DEFAULT_THEME_POLICY, assertThemeChangeAllowed, requiresThemeApproval } from './ThemePolicy.js';
import { getThemeProfile, listThemeProfiles } from './ThemeProfiles.js';
import { loadThemeMemory, saveThemeMemory, appendThemeReceipt, recordThemeSignal } from './ThemeMemory.js';
import { runThemeAccessibilityCheck, runThemePerformanceCheck } from './ThemeChecks.js';

function pickThemeFromState({ page = 'dashboard', state = 'normal', preference = '' } = {}) {
  const text = `${page} ${state} ${preference}`.toLowerCase();
  if (text.includes('cost') || text.includes('saving') || text.includes('api')) return 'costGuard';
  if (text.includes('proof') || text.includes('test') || text.includes('receipt')) return 'proofMode';
  if (text.includes('danger') || text.includes('fail') || text.includes('risk') || text.includes('blocked')) return 'dangerMode';
  if (text.includes('forge') || text.includes('dev') || text.includes('night')) return 'nightForge';
  return 'evoCore';
}

function validateThemeCandidate(profile, policy) {
  const change = {
    scope: profile.scope,
    targets: ['dashboard-cards', 'status-badges', 'page-background', 'motion-profile'],
    motionIntensity: profile.motion?.intensity || 0
  };
  const guard = assertThemeChangeAllowed(change, policy);
  const accessibility = runThemeAccessibilityCheck(profile, policy);
  const performance = runThemePerformanceCheck(profile, policy);
  const blockedReasons = [
    ...(guard.allowed ? [] : guard.reasons),
    ...(accessibility.passed ? [] : accessibility.failures.map(f => `Contrast failed: ${f.pair} ${f.ratio}`)),
    ...(performance.passed ? [] : performance.failures)
  ];
  return { accessibility, performance, blockedReasons };
}

export function getThemeEvolutionStatus({ rootDir = process.cwd() } = {}) {
  const memory = loadThemeMemory(rootDir);
  const activeProfile = getThemeProfile(memory.activeThemeId || 'evoCore');
  return {
    truthState: THEME_TRUTH_STATES.IDLE,
    activeThemeId: memory.activeThemeId || 'evoCore',
    approvedThemeId: memory.approvedThemeId || 'evoCore',
    activeProfile,
    lastPreview: memory.lastPreview || null,
    receipts: memory.receipts || [],
    profiles: listThemeProfiles()
  };
}

export function suggestThemeEvolution({ rootDir = process.cwd(), page = 'dashboard', state = 'normal', preference = '', policy = DEFAULT_THEME_POLICY } = {}) {
  recordThemeSignal({ rootDir, page, action: 'theme_suggest', intensity: 1 });
  const themeId = pickThemeFromState({ page, state, preference });
  return previewThemeEvolution({ rootDir, themeId, policy, action: 'suggest' });
}

export function previewThemeEvolution({ rootDir = process.cwd(), themeId = 'evoCore', policy = DEFAULT_THEME_POLICY, action = 'preview' } = {}) {
  const profile = getThemeProfile(themeId);
  const validation = validateThemeCandidate(profile, policy);
  const preview = {
    id: `theme_${action}_${Date.now()}`,
    action,
    themeId,
    profile,
    scope: profile.scope,
    truthState: validation.blockedReasons.length ? THEME_TRUTH_STATES.BLOCKED : THEME_TRUTH_STATES.PREVIEW_READY,
    blockedReasons: validation.blockedReasons,
    accessibility: validation.accessibility,
    performance: validation.performance,
    requiresApproval: requiresThemeApproval(policy),
    createdAt: new Date().toISOString()
  };
  const memory = loadThemeMemory(rootDir);
  memory.lastPreview = preview;
  saveThemeMemory(memory, rootDir);
  appendThemeReceipt({ action, themeId, truthState: preview.truthState, blockedReasons: preview.blockedReasons }, rootDir);
  return preview;
}
