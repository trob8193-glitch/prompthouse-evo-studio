import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Load env
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

function checkStripeReadiness() {
  Log.info('🔍 [Release Guardian] Checking Commerce Readiness...');
  const liveSecret = process.env.STRIPE_LIVE_SECRET_KEY;
  
  if (!liveSecret || liveSecret.includes('placeholder')) {
    Log.error('❌ [Release Guardian] STRIPE_LIVE_SECRET_KEY missing in .env');
    Log.info('   Please add your live Stripe secret key to the .env to package a commercial release.');
    return false;
  }
  Log.info('✅ [Release Guardian] Live Stripe keys detected.');
  return true;
}

function ensureElectronBuilder() {
  Log.info('📦 [Release Guardian] Checking Packaging Configuration...');
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let modified = false;

  // Ensure electron-builder is in devDependencies
  if (!pkg.devDependencies || !pkg.devDependencies['electron-builder']) {
    Log.info('⚙️ [Release Guardian] Injecting electron-builder into devDependencies...');
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies['electron-builder'] = '^24.13.3';
    modified = true;
  }

  // Ensure build configuration exists
  if (!pkg.build) {
    Log.info('⚙️ [Release Guardian] Injecting Electron Build configuration...');
    pkg.build = {
      appId: "com.prompthouse.evo",
      productName: "PromptHouse Evo Studio",
      directories: {
        output: "dist-desktop"
      },
      win: {
        target: "nsis"
      },
      mac: {
        target: "dmg"
      },
      files: [
        "dist/**/*",
        "desktop/**/*",
        "promptbridge-server*.js",
        "src/core/daemons/**/*",
        "package.json"
      ]
    };
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    Log.info('✅ [Release Guardian] package.json rewritten. Installing new dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: ROOT_DIR });
  } else {
    Log.info('✅ [Release Guardian] Packaging configuration is pristine.');
  }
}

function performCommercialBuild() {
  Log.info('🚀 [Release Guardian] Initiating Sovereign Finality Build...');
  
  try {
    Log.info('🔨 Building Production UI...');
    execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });

    Log.info('💿 Compiling Executable Binaries...');
    execSync('npx electron-builder --win', { stdio: 'inherit', cwd: ROOT_DIR });
    
    Log.info('🎉 [Release Guardian] Commercial Packaging Complete. Output is in /dist-desktop');
  } catch (err) {
    Log.error('❌ [Release Guardian] Build sequence failed.', err.message);
    process.exit(1);
  }
}

function run() {
  Log.info('🛡️ [Release Guardian] Booting commercialization gate...');
  const isCommerceReady = checkStripeReadiness();
  ensureElectronBuilder();

  if (!isCommerceReady) {
    Log.error('⛔ [Release Guardian] Halting commercial build until Commerce Reality is met. Please fix your .env file.');
    process.exit(1);
  }

  performCommercialBuild();
}

run();
