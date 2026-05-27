import fs from 'fs';
import path from 'path';

const root = process.cwd();
const required = [
  'browser-extension/manifest.json',
  'browser-extension/popup.html',
  'browser-extension/popup.js',
  'browser-extension/service-worker.js',
];

const results = required.map(file => ({ file, exists: fs.existsSync(path.join(root, file)) }));
const missing = results.filter(item => !item.exists);

let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(root, 'browser-extension/manifest.json'), 'utf8'));
} catch (error) {
  missing.push({ file: 'browser-extension/manifest.json', exists: false, error: error.message });
}

const checks = {
  manifestVersion3: manifest?.manifest_version === 3,
  activeTabPermission: Boolean(manifest?.permissions?.includes('activeTab')),
  scriptingPermission: Boolean(manifest?.permissions?.includes('scripting')),
  localBridgeHostPermission: Boolean((manifest?.host_permissions || []).some(item => item.includes('127.0.0.1:3001'))),
  serviceWorkerConfigured: Boolean(manifest?.background?.service_worker),
  popupConfigured: Boolean(manifest?.action?.default_popup),
};

const failedChecks = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
const success = missing.length === 0 && failedChecks.length === 0;

console.log(JSON.stringify({
  success,
  truthState: success ? 'EVO_EXTENSION_READY' : 'EVO_EXTENSION_GAPS_FOUND',
  files: results,
  checks,
  missing,
  failedChecks,
  checkedAt: new Date().toISOString(),
}, null, 2));

if (!success) process.exit(1);
