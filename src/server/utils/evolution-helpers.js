import crypto from 'crypto';
import { stableHash, clamp, toSafeJson } from './common-helpers.js';
import db from '../../core/db/quad_schema.js';

function resolveEvolutionSubject(req, source = {}) {
  const maybeClientId = String(
    source.clientId ||
    source.client_id ||
    req.headers['x-client-id'] ||
    req.query.clientId ||
    ''
  ).trim();

  if (req.user?.sub) {
    return {
      subjectKey: `user:${req.user.sub}`,
      userId: req.user.sub,
      clientId: maybeClientId || null
    };
  }

  const fallbackClient = maybeClientId || `anon_${stableHash(req.ip || 'local').toString(36)}`;
  return {
    subjectKey: `client:${fallbackClient}`,
    userId: null,
    clientId: fallbackClient
  };
}

function defaultEvolutionProfile(subjectKey, userId = null) {
  const seed = stableHash(subjectKey);
  const baseHue = 180 + (seed % 120);
  return {
    id: crypto.randomUUID(),
    subject_key: subjectKey,
    user_id: userId,
    display_name: null,
    affinity: {
      preferred_pages: {},
      action_bias: {},
      complexity_score: 0.5,
      novelty_bias: ((seed % 100) / 100)
    },
    layout: {
      density_scale: 1,
      sidebar_collapsed: seed % 3 === 0,
      card_roundness: 18 + (seed % 8),
      motion_mode: seed % 2 === 0 ? 'calm' : 'dynamic'
    },
    theme: {
      primary_hue: baseHue,
      accent_hue: (baseHue + 38) % 360,
      background_hue: 220 + (seed % 24),
      saturation: 68,
      lightness: 52,
      glow_intensity: 0.22
    },
    autonomy: {
      cycles: 0,
      mutation_rate: 0.08,
      last_reason: 'bootstrap'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_signal_at: null
  };
}

function inflateEvolutionProfile(row, fallbackUserId = null) {
  if (!row) return null;
  return {
    id: row.id,
    subject_key: row.subject_key,
    user_id: row.user_id || fallbackUserId || null,
    display_name: row.display_name || null,
    affinity: JSON.parse(row.affinity_json || '{}'),
    layout: JSON.parse(row.layout_json || '{}'),
    theme: JSON.parse(row.theme_json || '{}'),
    autonomy: JSON.parse(row.autonomy_json || '{}'),
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_signal_at: row.last_signal_at
  };
}

function persistEvolutionProfile(profile) {
  db.prepare(`
    INSERT INTO user_evolution_profiles (
      id, subject_key, user_id, display_name, affinity_json, layout_json, theme_json, autonomy_json, updated_at, last_signal_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    ON CONFLICT(subject_key) DO UPDATE SET
      user_id = excluded.user_id,
      display_name = excluded.display_name,
      affinity_json = excluded.affinity_json,
      layout_json = excluded.layout_json,
      theme_json = excluded.theme_json,
      autonomy_json = excluded.autonomy_json,
      updated_at = CURRENT_TIMESTAMP,
      last_signal_at = excluded.last_signal_at
  `).run(
    profile.id || crypto.randomUUID(),
    profile.subject_key,
    profile.user_id || null,
    profile.display_name || null,
    toSafeJson(profile.affinity || {}),
    toSafeJson(profile.layout || {}),
    toSafeJson(profile.theme || {}),
    toSafeJson(profile.autonomy || {}),
    profile.last_signal_at || null
  );
}

function loadOrCreateEvolutionProfile(subjectKey, userId = null) {
  const row = db.prepare(`
    SELECT * FROM user_evolution_profiles WHERE subject_key = ?
  `).get(subjectKey);
  if (row) {
    const profile = inflateEvolutionProfile(row, userId);
    if (!profile.user_id && userId) profile.user_id = userId;
    return profile;
  }
  const created = defaultEvolutionProfile(subjectKey, userId);
  persistEvolutionProfile(created);
  return created;
}

function recordEvolutionEvent(subjectKey, eventType, payload = {}) {
  db.prepare(`
    INSERT INTO user_evolution_events (id, subject_key, event_type, payload_json)
    VALUES (?, ?, ?, ?)
  `).run(crypto.randomUUID(), subjectKey, eventType, toSafeJson(payload));
}

function applyEvolutionSignal(profile, signal = {}) {
  const page = String(signal.page || 'unknown').slice(0, 80);
  const action = String(signal.action || 'view').slice(0, 80);
  const intensity = clamp(Number(signal.intensity || 0.5), 0, 1.5);
  const complexity = clamp(Number(signal.complexity || signal.taskComplexity || 0.5), 0, 1.5);

  const preferred = { ...(profile.affinity?.preferred_pages || {}) };
  preferred[page] = (preferred[page] || 0) + (0.2 + intensity);
  const actionBias = { ...(profile.affinity?.action_bias || {}) };
  actionBias[action] = (actionBias[action] || 0) + 1;

  const driftSeed = stableHash(`${profile.id}:${profile.last_signal_at}`);
  const deterministicDrift = ((driftSeed % 100) / 100 - 0.5) * 0.04;
  const noveltyBias = clamp((profile.affinity?.novelty_bias ?? 0.5) + deterministicDrift, 0.1, 0.95);
  const complexityScore = clamp(
    ((profile.affinity?.complexity_score ?? 0.5) * 0.85) + (complexity * 0.15),
    0.1,
    1.5
  );

  profile.affinity = {
    ...profile.affinity,
    preferred_pages: preferred,
    action_bias: actionBias,
    novelty_bias: noveltyBias,
    complexity_score: complexityScore
  };

  profile.last_signal_at = new Date().toISOString();
  return profile;
}

function mutateEvolutionProfile(profile, reason = 'autonomous_cycle') {
  const cycles = Number(profile.autonomy?.cycles || 0) + 1;
  const mutationRate = clamp(Number(profile.autonomy?.mutation_rate || 0.08), 0.03, 0.2);
  const pageScores = profile.affinity?.preferred_pages || {};
  const dominantPage = Object.entries(pageScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'dashboard';
  const dominantHash = stableHash(`${profile.subject_key}:${dominantPage}:${cycles}`);
  const complexityScore = clamp(Number(profile.affinity?.complexity_score || 0.5), 0.1, 1.5);

  const hueDrift = ((dominantHash % 21) - 10) * mutationRate;
  const satDrift = ((dominantHash % 13) - 6) * mutationRate;
  const lightDrift = ((dominantHash % 9) - 4) * mutationRate;

  const currentTheme = profile.theme || {};
  const primaryHue = (Number(currentTheme.primary_hue || 220) + hueDrift + 360) % 360;
  const accentHue = (primaryHue + 24 + (complexityScore * 30)) % 360;
  const saturation = clamp(Number(currentTheme.saturation || 68) + satDrift, 40, 88);
  const lightness = clamp(Number(currentTheme.lightness || 52) + lightDrift, 34, 68);
  const backgroundHue = clamp(Number(currentTheme.background_hue || 220) + ((dominantHash % 7) - 3), 180, 260);
  const glowIntensity = clamp(Number(currentTheme.glow_intensity || 0.22) + ((complexityScore - 0.5) * 0.02), 0.12, 0.45);

  const currentLayout = profile.layout || {};
  const densityScale = clamp(0.88 + (complexityScore * 0.28), 0.84, 1.24);
  const sidebarCollapsed = complexityScore > 1.15 ? true : (complexityScore < 0.55 ? false : Boolean(currentLayout.sidebar_collapsed));
  const cardRoundness = clamp(Math.round(14 + (complexityScore * 12) + (dominantHash % 4)), 12, 30);
  const motionMode = complexityScore > 0.95 ? 'dynamic' : 'calm';

  profile.theme = {
    primary_hue: Number(primaryHue.toFixed(2)),
    accent_hue: Number(accentHue.toFixed(2)),
    background_hue: Number(backgroundHue.toFixed(2)),
    saturation: Number(saturation.toFixed(2)),
    lightness: Number(lightness.toFixed(2)),
    glow_intensity: Number(glowIntensity.toFixed(3))
  };

  profile.layout = {
    density_scale: Number(densityScale.toFixed(3)),
    sidebar_collapsed: sidebarCollapsed,
    card_roundness: cardRoundness,
    motion_mode: motionMode
  };

  profile.autonomy = {
    cycles,
    mutation_rate: mutationRate,
    last_reason: reason
  };

  profile.updated_at = new Date().toISOString();
  return profile;
}

function evolutionCssVariables(profile) {
  const theme = profile.theme || {};
  const primaryHue = Number(theme.primary_hue || 220);
  const accentHue = Number(theme.accent_hue || 258);
  const bgHue = Number(theme.background_hue || 220);
  const sat = Number(theme.saturation || 68);
  const light = Number(theme.lightness || 52);
  const glow = Number(theme.glow_intensity || 0.22);

  return {
    '--primary': `hsl(${primaryHue}, ${sat}%, ${light}%)`,
    '--accent-violet': `hsl(${accentHue}, ${Math.max(38, sat - 8)}%, ${Math.min(72, light + 10)}%)`,
    '--bg-base': `hsl(${bgHue}, 32%, 9%)`,
    '--bg-card': `hsl(${bgHue}, 22%, 11%)`,
    '--bg-surface': `hsl(${bgHue}, 18%, 12%)`,
    '--border-dim': `hsla(${accentHue}, 36%, 70%, ${clamp(glow * 0.55, 0.08, 0.28)})`,
    '--primary-glow': `hsla(${primaryHue}, ${sat}%, ${Math.min(84, light + 20)}%, ${clamp(glow, 0.12, 0.5)})`,
    '--evo-density-scale': String(clamp(Number(profile.layout?.density_scale || 1), 0.84, 1.24)),
    '--radius-lg': `${clamp(Number(profile.layout?.card_roundness || 18), 12, 30)}px`,
    '--radius-xl': `${clamp(Number(profile.layout?.card_roundness || 22) + 6, 18, 36)}px`
  };
}

export {
  resolveEvolutionSubject,
  defaultEvolutionProfile,
  inflateEvolutionProfile,
  persistEvolutionProfile,
  loadOrCreateEvolutionProfile,
  recordEvolutionEvent,
  applyEvolutionSignal,
  mutateEvolutionProfile,
  evolutionCssVariables
};
