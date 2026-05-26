function hexToRgb(hex = '#000000') {
  const clean = String(hex).replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean.padEnd(6, '0').slice(0, 6);
  const num = Number.parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function channel(value) {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
}

export function runThemeAccessibilityCheck(profile, policy = {}) {
  const palette = profile?.palette || {};
  const minimum = Number(policy.minimumContrastRatio || 4.5);
  const checks = [
    { pair: 'text/background', ratio: contrastRatio(palette.text, palette.background) },
    { pair: 'text/surface', ratio: contrastRatio(palette.text, palette.surface) },
    { pair: 'muted/background', ratio: contrastRatio(palette.muted, palette.background) },
    { pair: 'primary/background', ratio: contrastRatio(palette.primary, palette.background) }
  ];
  const failures = checks.filter(check => check.ratio < minimum);
  return {
    passed: failures.length === 0,
    minimumContrastRatio: minimum,
    checks,
    failures
  };
}

export function runThemePerformanceCheck(profile, policy = {}) {
  const motion = profile?.motion || {};
  const intensity = Number(motion.intensity || 0);
  const max = Number(policy.maxMotionIntensity || 0.75);
  const heavyAnimations = ['warning-pulse', 'deep-slide'].includes(motion.pageTransition) ? 1 : 0;
  const passed = intensity <= max && heavyAnimations <= 1;
  return {
    passed,
    motionIntensity: intensity,
    maxMotionIntensity: max,
    pageTransition: motion.pageTransition || 'none',
    heavyAnimations,
    failures: passed ? [] : ['Motion or transition profile exceeds policy.']
  };
}
