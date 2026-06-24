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
  },
  cyberPunk: {
    id: 'cyberPunk', name: 'CyberPunk', scope: 'global',
    palette: { background: '#09090b', surface: '#0f172a', surfaceStrong: '#1e293b', primary: '#00ffcc', secondary: '#ff00ff', accent: '#facc15', danger: '#ef4444', warning: '#f59e0b', text: '#e2e8f0', muted: '#94a3b8' },
    motion: { intensity: 0.8, pageTransition: 'glitch', statusPulse: true }, density: 'dense'
  },
  solarCore: {
    id: 'solarCore', name: 'Solar Core', scope: 'global',
    palette: { background: '#1a0500', surface: '#2b0a00', surfaceStrong: '#3d0c00', primary: '#ffaa00', secondary: '#ff5500', accent: '#ffddaa', danger: '#ef4444', warning: '#f59e0b', text: '#ffddaa', muted: '#aa5500' },
    motion: { intensity: 0.6, pageTransition: 'burn', statusPulse: true }, density: 'balanced'
  },
  neonDreams: {
    id: 'neonDreams', name: 'Neon Dreams', scope: 'global',
    palette: { background: '#10002b', surface: '#3c096c', surfaceStrong: '#5a189a', primary: '#e0aaff', secondary: '#c77dff', accent: '#9d4edd', danger: '#ff0a54', warning: '#ff9e00', text: '#f8f9fa', muted: '#b1a7a6' },
    motion: { intensity: 0.4, pageTransition: 'fade', statusPulse: true }, density: 'relaxed'
  },
  abyssalDeep: {
    id: 'abyssalDeep', name: 'Abyssal Deep', scope: 'global',
    palette: { background: '#000205', surface: '#000a14', surfaceStrong: '#001428', primary: '#00ffff', secondary: '#0088ff', accent: '#0044ff', danger: '#ff0044', warning: '#ffaa00', text: '#88ccff', muted: '#446688' },
    motion: { intensity: 0.2, pageTransition: 'sink', statusPulse: false }, density: 'spacious'
  },
  matrixHacker: {
    id: 'matrixHacker', name: 'Matrix Hacker', scope: 'global',
    palette: { background: '#000000', surface: '#001100', surfaceStrong: '#002200', primary: '#00ff00', secondary: '#00cc00', accent: '#008800', danger: '#ff0000', warning: '#ffff00', text: '#00ff00', muted: '#005500' },
    motion: { intensity: 0.9, pageTransition: 'scanline', statusPulse: true }, density: 'terminal'
  },
  synthWave: {
    id: 'synthWave', name: 'SynthWave', scope: 'global',
    palette: { background: '#240046', surface: '#3c096c', surfaceStrong: '#5a189a', primary: '#ff9e00', secondary: '#ff6d00', accent: '#ff006e', danger: '#d00000', warning: '#ffba08', text: '#ffffff', muted: '#e0e0e0' },
    motion: { intensity: 0.5, pageTransition: 'grid-scroll', statusPulse: true }, density: 'balanced'
  },
  corporateClean: {
    id: 'corporateClean', name: 'Corporate Clean', scope: 'global',
    palette: { background: '#f8fafc', surface: '#ffffff', surfaceStrong: '#f1f5f9', primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa', danger: '#ef4444', warning: '#f59e0b', text: '#0f172a', muted: '#64748b' },
    motion: { intensity: 0.1, pageTransition: 'none', statusPulse: false }, density: 'comfortable'
  },
  hyperMinimal: {
    id: 'hyperMinimal', name: 'Hyper Minimal', scope: 'global',
    palette: { background: '#000000', surface: '#050505', surfaceStrong: '#0a0a0a', primary: '#ffffff', secondary: '#cccccc', accent: '#999999', danger: '#ff3333', warning: '#ffcc00', text: '#ffffff', muted: '#666666' },
    motion: { intensity: 0.0, pageTransition: 'fade', statusPulse: false }, density: 'extreme-space'
  },
  retroArcade: {
    id: 'retroArcade', name: 'Retro Arcade', scope: 'global',
    palette: { background: '#0000aa', surface: '#aa0000', surfaceStrong: '#cc0000', primary: '#ffff00', secondary: '#ff00ff', accent: '#00ffff', danger: '#ff5555', warning: '#ffaa00', text: '#ffffff', muted: '#aaaaaa' },
    motion: { intensity: 1.0, pageTransition: 'pixelate', statusPulse: true }, density: 'chunky'
  },
  quantumGlass: {
    id: 'quantumGlass', name: 'Quantum Glass', scope: 'global',
    palette: { background: '#000000', surface: '#ffffff0a', surfaceStrong: '#ffffff14', primary: '#a78bfa', secondary: '#c4b5fd', accent: '#ede9fe', danger: '#fb7185', warning: '#fde047', text: '#ffffff', muted: '#a1a1aa' },
    motion: { intensity: 0.7, pageTransition: 'blur-fade', statusPulse: true }, density: 'floating'
  },
  omniRainbow: {
    id: 'omniRainbow', name: 'Omni Alive Rainbow', scope: 'global',
    palette: { background: '#050505', surface: 'rgba(10,10,10,0.8)', surfaceStrong: 'rgba(255,0,255,0.2)', primary: '#ff00ff', secondary: '#00ffff', text: '#ffffff', muted: '#aaaaaa' },
    motion: { intensity: 1.0, pageTransition: 'rainbow-warp' },
    density: 'normal'
  },
  draculaPro: {
    id: 'draculaPro', name: 'Dracula Pro', scope: 'global',
    palette: { background: '#282a36', surface: '#44475a', surfaceStrong: '#6272a4', primary: '#ff79c6', secondary: '#bd93f9', text: '#f8f8f2', muted: '#6272a4' },
    motion: { intensity: 0.4, pageTransition: 'fade' }, density: 'comfortable'
  },
  neoBrutalist: {
    id: 'neoBrutalist', name: 'Neo Brutalist', scope: 'global',
    palette: { background: '#ffde59', surface: '#ffffff', surfaceStrong: '#f0f0f0', primary: '#000000', secondary: '#38b6ff', text: '#000000', muted: '#333333' },
    motion: { intensity: 0.8, pageTransition: 'slide-up' }, density: 'chunky'
  },
  vercelClean: {
    id: 'vercelClean', name: 'Vercel Clean', scope: 'global',
    palette: { background: '#000000', surface: '#111111', surfaceStrong: '#333333', primary: '#ffffff', secondary: '#888888', text: '#ffffff', muted: '#888888' },
    motion: { intensity: 0.2, pageTransition: 'fade' }, density: 'spacious'
  },
  macOsAqua: {
    id: 'macOsAqua', name: 'macOS Aqua', scope: 'global',
    palette: { background: '#e8e8e8', surface: '#f0f0f0', surfaceStrong: '#d4d4d4', primary: '#007aff', secondary: '#5ac8fa', text: '#333333', muted: '#777777' },
    motion: { intensity: 0.5, pageTransition: 'slide-up' }, density: 'balanced'
  },
  clayMorphism: {
    id: 'clayMorphism', name: 'ClayMorphism', scope: 'global',
    palette: { background: '#e0e5ec', surface: '#e0e5ec', surfaceStrong: '#bec3c9', primary: '#ff6b6b', secondary: '#feca57', text: '#555555', muted: '#888888' },
    motion: { intensity: 0.6, pageTransition: 'fade' }, density: 'relaxed'
  },
  ubuntuTerminal: {
    id: 'ubuntuTerminal', name: 'Ubuntu Terminal', scope: 'global',
    palette: { background: '#300a24', surface: '#2c001e', surfaceStrong: '#77216f', primary: '#dd4814', secondary: '#e95420', text: '#eeeeec', muted: '#888888' },
    motion: { intensity: 0.3, pageTransition: 'none' }, density: 'terminal'
  },
  githubDimmed: {
    id: 'githubDimmed', name: 'GitHub Dimmed', scope: 'global',
    palette: { background: '#22272e', surface: '#2d333b', surfaceStrong: '#444c56', primary: '#539bf5', secondary: '#768390', text: '#adbac7', muted: '#768390' },
    motion: { intensity: 0.1, pageTransition: 'fade' }, density: 'balanced'
  },
  hackerNews: {
    id: 'hackerNews', name: 'Hacker News', scope: 'global',
    palette: { background: '#f6f6ef', surface: '#f6f6ef', surfaceStrong: '#e6e6df', primary: '#ff6600', secondary: '#000000', text: '#000000', muted: '#828282' },
    motion: { intensity: 0.0, pageTransition: 'none' }, density: 'dense'
  }
});

export function getThemeProfile(themeId = 'evoCore') {
  return THEME_PROFILES[themeId] || THEME_PROFILES.evoCore;
}

export function listThemeProfiles() {
  return Object.values(THEME_PROFILES);
}
