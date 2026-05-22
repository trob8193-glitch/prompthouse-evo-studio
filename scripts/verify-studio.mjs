import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 [Verify Studio] Commencing pre-flight audit for Evo Studio...');

async function checkExists(filePath, name) {
    try {
        await fs.access(filePath);
        console.log(`  ✅ [PASS] ${name} found.`);
        return true;
    } catch {
        console.error(`  ❌ [FAIL] ${name} is missing.`);
        return false;
    }
}

async function runAudit() {
    let passed = true;
    let warning = false;

    console.log('\n📦 Verifying Build Artifacts...');
    const distExists = await checkExists(path.join(rootDir, 'dist'), 'Production Build (dist/)');
    if (!distExists) passed = false;

    console.log('\n⚙️ Verifying Core Configuration...');
    const bridgeExists = await checkExists(path.join(rootDir, 'promptbridge-server.js'), 'PromptBridge Server Config');
    if (!bridgeExists) passed = false;
    
    const viteExists = await checkExists(path.join(rootDir, 'vite.config.js'), 'Vite Config');
    if (!viteExists) passed = false;

    console.log('\n🧬 Verifying Hardware Matrix Bindings...');
    const hwDaemonExists = await checkExists(path.join(rootDir, 'scripts', 'physical_hardware_interface.js'), 'Physical Hardware Daemon');
    if (!hwDaemonExists) warning = true;

    console.log('\n=======================================');
    if (!passed) {
        console.error('❌ [Verify Studio] Audit failed. The studio is not ready for deployment. Please run `npm run build` or restore missing files.');
        process.exit(1);
    } else if (warning) {
        console.warn('⚠️ [Verify Studio] Audit passed with warnings. Core is ready, but some advanced hardware modules may be offline.');
        process.exit(0);
    } else {
        console.log('✅ [Verify Studio] Audit completely successful. Evo Studio is fully verified and ready for launch.');
        process.exit(0);
    }
}

runAudit().catch(err => {
    console.error('❌ [Verify Studio] Unexpected fatal error:', err);
    process.exit(1);
});
