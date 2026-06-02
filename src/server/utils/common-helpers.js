import crypto from 'crypto';

function sanitizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function sanitizeDisplayName(displayName = '') {
  return String(displayName).trim().slice(0, 120);
}

function toSafeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function stableHash(input = '') {
  let hash = 2166136261;
  const value = String(input);
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export {
  sanitizeEmail,
  sanitizeDisplayName,
  toSafeJson,
  stableHash,
  clamp
};
