/**
 * PH EVO STUDIO — Preview Access Decision Service
 */

export function classifySmokeCheckResult(report) {
  if (!report) return 'UNKNOWN';
  if (report.ok === true) return 'PUBLIC_ACCESSIBLE';
  if (report.error && report.error.includes('401')) return 'AUTH_PROTECTED';
  return 'BLOCKED';
}

export function classifyPreviewAccessMode(receipt, smokeReport) {
  if (!receipt) return 'UNKNOWN';
  if (!smokeReport) return 'NEEDS_MANUAL_BROWSER_CHECK';
  return classifySmokeCheckResult(smokeReport);
}
