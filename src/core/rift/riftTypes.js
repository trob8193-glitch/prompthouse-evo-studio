export const TRUTH_LABELS = Object.freeze({
  REAL: 'REAL',
  SIMULATED: 'SIMULATED',
  GENERATED: 'GENERATED',
  INFERRED: 'INFERRED',
  BLOCKED: 'BLOCKED',
});

export const RIFT_BOUNDARY_CODES = Object.freeze({
  NO_NATIVE_SENSOR_ACCESS: 'NO_NATIVE_SENSOR_ACCESS',
  NO_CAMERA_CONSENT: 'NO_CAMERA_CONSENT',
  NO_GPS_CONSENT: 'NO_GPS_CONSENT',
  NO_MIC_CONSENT: 'NO_MIC_CONSENT',
  AI_GATEWAY_BLOCKED: 'AI_GATEWAY_BLOCKED',
  NATIVE_WIFI_UNAVAILABLE: 'NATIVE_WIFI_UNAVAILABLE',
  NATIVE_BLUETOOTH_UNAVAILABLE: 'NATIVE_BLUETOOTH_UNAVAILABLE',
  NATIVE_PUBLIC_IP_UNAVAILABLE: 'NATIVE_PUBLIC_IP_UNAVAILABLE',
  FIREBASE_NOT_CONFIGURED: 'FIREBASE_NOT_CONFIGURED',
  MOBILE_RUNTIME_NOT_CONNECTED: 'MOBILE_RUNTIME_NOT_CONNECTED',
});

export const RIFT_SESSION_STATUS = Object.freeze({
  CREATED: 'created',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
  BLOCKED: 'blocked',
});

export const GRID_ROUTE_TYPES = Object.freeze({
  EVO_NAME: 'evo_name',
  EVO_URL: 'evo_url',
  EVO_API: 'evo_api',
  EVO_DOMAIN: 'evo_domain',
  EVO_PRIVATE_IP: 'evo_private_ip',
  EVO_NATIVE_WIFI: 'evo_native_wifi',
  EVO_NATIVE_BLUETOOTH: 'evo_native_bluetooth',
  EVO_MESH_NODE: 'evo_mesh_node',
});

export function assertTruthLabel(label) {
  const value = String(label || '').toUpperCase();
  if (!Object.values(TRUTH_LABELS).includes(value)) {
    throw new Error(`Invalid truth label: ${label}`);
  }
  return value;
}

export function truthEnvelope({ label, data = {}, blocked = false, reason = null, boundaryCode = null }) {
  return {
    truth_label: assertTruthLabel(label),
    blocked: Boolean(blocked),
    reason,
    boundary_code: boundaryCode,
    data,
    emitted_at: new Date().toISOString(),
  };
}

export function blockedBoundary(boundaryCode, reason, data = {}) {
  return truthEnvelope({
    label: TRUTH_LABELS.BLOCKED,
    blocked: true,
    boundaryCode,
    reason,
    data,
  });
}
