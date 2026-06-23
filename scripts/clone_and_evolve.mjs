import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import crypto from 'crypto';

async function cloneAndEvolve() {
  const rootDir = process.cwd();
  const hash = crypto.randomBytes(4).toString('hex');
  const cloneDirName = `prompthouse-evo-studio-clone-${hash}`;
  const cloneDirPath = path.resolve(rootDir, '..', cloneDirName);

  Log.info(`🧬 [Studio Replication] Initiating clone sequence...`);
  Log.info(`>> Target Clone Directory: ${cloneDirPath}`);

  try {
    // 1. Physically clone the directory using OS commands (excluding node_modules and .git)
    if (process.platform === 'win32') {
      execSync(`xcopy "${rootDir}" "${cloneDirPath}" /E /I /H /C /Y /EXCLUDE:clone_exclude.txt`, { stdio: 'ignore' });
    } else {
      execSync(`rsync -a --exclude 'node_modules' --exclude '.git' "${rootDir}/" "${cloneDirPath}/"`, { stdio: 'ignore' });
    }
    Log.info('✅ Source code physically cloned.');

    // 2. Mutate the CSS to give the clone a unique visual identity
    const cssPath = path.join(cloneDirPath, 'index.css');
    if (fs.existsSync(cssPath)) {
      let cssContent = fs.readFileSync(cssPath, 'utf8');
      // Mutate a primary color or background to signify it's a clone
      cssContent += `\n/* CLONED MUTATION */\nbody { filter: hue-rotate(${Math.floor(Math.random() * 360)}deg); }\n`;
      fs.writeFileSync(cssPath, cssContent);
      Log.info('🎨 CSS mutation injected. Child studio will have a unique hue.');
    }

    // 3. Mutate the package.json so the port doesn't collide
    const pkgPath = path.join(cloneDirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const newPort = 5174 + Math.floor(Math.random() * 100);
      pkg.name = `${pkg.name}-clone-${hash}`;
      if (pkg.scripts && pkg.scripts.dev) {
        pkg.scripts.dev = pkg.scripts.dev.replace('--port 5173', `--port ${newPort}`);
      }
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      Log.info(`⚙️ Port mutated to ${newPort}.`);
    }

    Log.info(`\n🎉 [Studio Replication] Success! Clone ${hash} is fully autonomous.`);
    Log.info(`To launch the clone, run:\n  cd ../${cloneDirName}\n  npm install\n  npm run dev:all`);
    
  } catch (err) {
    // Expected to fail on windows if clone_exclude.txt doesn't exist, let's create it first!
    Log.error('❌ Cloning failed:', err.message);
  }
}

// Write the exclusion file for windows
if (process.platform === 'win32') {
  fs.writeFileSync('clone_exclude.txt', 'node_modules\\\n.git\\\n');
}

cloneAndEvolve();
