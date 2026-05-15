import fs from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const DATA_DIR = join(ROOT, '.prompthouse-data');
const RECEIPTS_FILE = join(DATA_DIR, 'deployment_receipts.jsonl');
const SMOKE_FILE = join(DATA_DIR, 'preview-smoke-report.json');

function getLatestPreviewReceipt() {
  try {
    if (!fs.existsSync(RECEIPTS_FILE)) return null;
    const lines = fs.readFileSync(RECEIPTS_FILE, 'utf8').split('\n').filter(Boolean).reverse();
    for (const line of lines) {
      try {
        const r = JSON.parse(line);
        if (r.action === 'preview_deploy' && r.status === 'success') return r;
      } catch { /* skip malformed */ }
    }
  } catch { /* ignore */ }
  return null;
}

function getLatestSmokeReport() {
  try {
    if (!fs.existsSync(SMOKE_FILE)) return null;
    return JSON.parse(fs.readFileSync(SMOKE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export function classifySmokeCheckResult(report) {
  if (!report) return 'UNKNOWN';
  if (report.ok === true) return 'PUBLIC_ACCESSIBLE';
  if (report.error && report.error.includes('401')) return 'AUTH_PROTECTED';
  if (report.error) return 'BLOCKED';
  return 'UNKNOWN';
}

export function classifyPreviewAccessMode(receipt, smokeReport) {
  if (!receipt) return 'UNKNOWN';
  if (!smokeReport) return 'NEEDS_MANUAL_BROWSER_CHECK';
  
  return classifySmokeCheckResult(smokeReport);
}

export function buildPreviewAccessOptions(accessMode) {
  const options = [
    { 
      id: 'keep_auth', 
      title: 'Keep Authentication Enabled', 
      description: 'Maintain Vercel Authentication. Prevents unauthorized viewing.', 
      recommended: accessMode === 'AUTH_PROTECTED' 
    },
    { 
      id: 'manual_verify', 
      title: 'Use Manual Browser Verification', 
      description: 'Log in with your Vercel account in the browser to verify the deployment.', 
      recommended: accessMode === 'NEEDS_MANUAL_BROWSER_CHECK' 
    },
    { 
      id: 'disable_auth_later', 
      title: 'Disable Vercel Auth (Phase 16B/C)', 
      description: 'Turn off Vercel Authentication only if explicitly choosing public preview later.', 
      recommended: false 
    },
    { 
      id: 'bypass_token', 
      title: 'Add Bypass Token Strategy', 
      description: 'Implement bypass token in future phases if supported by Vercel.', 
      recommended: false 
    }
  ];

  if (accessMode === 'PUBLIC_ACCESSIBLE') {
    return [
      { id: 'public_verified', title: 'Public Access Verified', description: 'The preview is fully accessible to the public.', recommended: true }
    ];
  }

  return options;
}

export function getPreviewAccessDecisionStatus() {
  const receipt = getLatestPreviewReceipt();
  const smokeReport = getLatestSmokeReport();
  const accessMode = classifyPreviewAccessMode(receipt, smokeReport);
  const options = buildPreviewAccessOptions(accessMode);
  
  return {
    receiptId: receipt ? receipt.id : null,
    deploymentUrl: receipt ? receipt.deploymentUrl : null,
    smokeResult: smokeReport ? (smokeReport.ok ? 'HTTP 200 OK' : smokeReport.error) : null,
    accessMode,
    options,
    truthState: receipt ? 'VERIFIED' : 'NEEDS_CREDENTIALS'
  };
}

