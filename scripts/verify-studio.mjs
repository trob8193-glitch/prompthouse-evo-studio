import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 [Verify Studio] Running non-destructive Evo Studio verification...');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function logPass(message) {
  console.log(`  ✅ [PASS] ${message}`);
}

function logWarn(message) {
  console.warn(`  ⚠️ [WARN] ${message}`);
}

function logFail(message) {
  console.error(`  ❌ [FAIL] ${message}`);
}

async function verifyRequiredFile(relativePath, label, failures) {
  const ok = await exists(path.join(rootDir, relativePath));
  if (ok) logPass(`${label} found at ${relativePath}.`);
  else {
    logFail(`${label} missing at ${relativePath}.`);
    failures.push(`${label} missing`);
  }
}

async function verifyOptionalFile(relativePath, label, warnings) {
  const ok = await exists(path.join(rootDir, relativePath));
  if (ok) logPass(`${label} found at ${relativePath}.`);
  else {
    logWarn(`${label} not found at ${relativePath}. Advanced module may be offline.`);
    warnings.push(`${label} missing`);
  }
}

async function runAudit() {
  const failures = [];
  const warnings = [];

  console.log('\n📦 Verifying package scripts...');
  const packagePath = path.join(rootDir, 'package.json');
  if (!(await exists(packagePath))) {
    logFail('package.json is missing.');
    process.exit(1);
  }

  const packageJson = await readJson(packagePath);
  const requiredScripts = ['dev', 'build', 'test', 'bridge', 'verify:studio'];
  for (const scriptName of requiredScripts) {
    if (packageJson.scripts?.[scriptName]) logPass(`npm script "${scriptName}" is registered.`);
    else {
      logFail(`npm script "${scriptName}" is missing.`);
      failures.push(`Missing script: ${scriptName}`);
    }
  }

  console.log('\n⚙️ Verifying required project files...');
  await verifyRequiredFile('vite.config.js', 'Vite config', failures);
  await verifyRequiredFile('src/App.jsx', 'App shell', failures);
  await verifyRequiredFile('src/store.js', 'Sovereign store', failures);
  await verifyRequiredFile('src/features/EvoPulseGridView.jsx', 'EvoPulse Grid view', failures);
  await verifyRequiredFile('promptbridge-server.js', 'PromptBridge server', failures);

  console.log('\n🧪 Verifying build output state...');
  if (await exists(path.join(rootDir, 'dist'))) {
    logPass('Production build directory exists.');
  } else {
    logWarn('dist/ does not exist yet. Run npm run build before deployment verification.');
    warnings.push('dist_missing_until_build_runs');
  }

  console.log('\n🧬 Verifying optional advanced modules...');
  await verifyOptionalFile('scripts/physical_hardware_interface.js', 'Physical hardware daemon', warnings);

  console.log('\n=======================================');
  if (failures.length > 0) {
    logFail(`[Verify Studio] Failed with ${failures.length} blocking issue(s).`);
    failures.forEach((failure) => console.error(`     - ${failure}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    logWarn(`[Verify Studio] Passed with ${warnings.length} warning(s).`);
    warnings.forEach((warning) => console.warn(`     - ${warning}`));
    process.exit(0);
  }

  console.log('✅ [Verify Studio] Audit successful. Core studio files and scripts are present.');
  process.exit(0);
}

runAudit().catch((err) => {
  console.error('❌ [Verify Studio] Unexpected fatal error:', err);
  process.exit(1);
});
