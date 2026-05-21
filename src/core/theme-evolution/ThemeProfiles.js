export const THEME_PROFILES = Object.freeze({
  evoCore: {
    id: 'evoCore',
    name: 'Evo Core',
    scope: 'global',
    palette: {
      background: '#08111f',
      surface: '#0f172a',
      surfaceStrong: '#111827',
      primary: '#22c55e',
      secondary: '#facc15',
      accent: '#38bdf8',
      danger: '#ef4444',
      warning: '#f59e0b',
      text: '#e2e8f0',
      muted: '#94a3b8'
    },
    motion: { intensity: 0.35, pageTransition: 'soft-rise', statusPulse: true },
    density: 'balanced'
  },
  nightForge: {
    id: 'nightForge',
    name: 'NightForge',
    scope: 'forge-labs',
    palette: {
      background: '#020617',
      surface: '#0b1120',
      surfaceStrong: '#111827',
      primary: '#818cf8',
      secondary: '#22d3ee',
      accent: '#a855f7',
      danger: '#fb7185',
      warning: '#fbbf24',
      text: '#f8fafc',
      muted: '#94a3b8'
    },
    motion: { intensity: 0.42, pageTransition: 'deep-slide', statusPulse: true },
    density: 'compact'
  },
  proofMode: {
    id: 'proofMode',
    name: 'Proof Mode',
    scope: 'proof-console',
    palette: {
      background: '#06111f',
      surface: '#0f172a',
      surfaceStrong: '#172554',
      primary: '#60a5fa',
      secondary: '#818cf8',
      accent: '#22d3ee',
      danger: '#f87171',
      warning: '#facc15',
      text: '#dbeafe',
      muted: '#93c5fd'
    },
    motion: { intensity: 0.25, pageTransition: 'minimal-fade', statusPulse: false },
    density: 'proof-focused'
  },
  costGuard: {
    id: 'costGuard',
    name: 'Cost Guard',
    scope: 'cost-firewall',
    palette: {
      background: '#03140c',
      surface: '#052e16',
      surfaceStrong: '#064e3b',
      primary: '#4ade80',
      secondary: '#22c55e',
      accent: '#a3e635',
      danger: '#f87171',
      warning: '#fde047',
      text: '#dcfce7',
      muted: '#86efac'
    },
    motion: { intensity: 0.3, pageTransition: 'savings-tick', statusPulse: true },
    density: 'metric-heavy'
  },
  dangerMode: {
    id: 'dangerMode',
    name: 'Danger Mode',
    scope: 'global',
    palette: {
      background: '#1f0707',
      surface: '#3f0d12',
      surfaceStrong: '#7f1d1d',
      primary: '#f87171',
      secondary: '#fb923c',
      accent: '#facc15',
      danger: '#ef4444',
      warning: '#f59e0b',
      text: '#fee2e2',
      muted: '#fecaca'
    },
    motion: { intensity: 0.55, pageTransition: 'warning-pulse', statusPulse: true },
    density: 'alert'
  }
});

export function getThemeProfile(themeId = 'evoCore') {
  return THEME_PROFILES[themeId] || THEME_PROFILES.evoCore;
}

export function listThemeProfiles() {
  return Object.values(THEME_PROFILES);
}
