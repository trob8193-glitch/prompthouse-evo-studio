import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFolder = process.argv[2] || 'src';
const rootDir = path.resolve(__dirname, '..', targetFolder);

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function processFile(filePath) {
  // Only target js, jsx, and mjs files
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx') && !filePath.endsWith('.mjs')) return;
  // Exclude SovereignLogger itself and proof-os-views tests, terminal_logic natively uses console for output capture sometimes.
  // Actually, we want to upgrade all core and features. 
  if (filePath.includes('SovereignLogger.js')) return;
  if (filePath.includes('terminal_logic.js')) return;
  if (filePath.includes('store.js')) return; // store.js is globally synced, it's a frontend file mostly.
  if (filePath.includes('Terminal.jsx')) return;
  
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;

  const hasConsoleLog = content.includes('console.log');
  const hasConsoleError = content.includes('console.error');

  if (hasConsoleLog || hasConsoleError) {
    // 1. Calculate relative path to SovereignLogger.js
    const targetLoggerPath = path.resolve(__dirname, '..', 'src', 'core', 'autonomy', 'SovereignLogger.js');
    let relativePath = path.relative(path.dirname(filePath), targetLoggerPath).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

    // 2. Inject import if missing
    if (!content.includes('import { Log }') && !content.includes('import {Log}')) {
      // Find the last import
      const importRegex = /^import\s+.*?;?\s*$/gm;
      let lastMatch = null;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }

      const importStatement = `import { Log } from '${relativePath}';\n`;
      if (lastMatch) {
        const insertionIndex = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, insertionIndex) + '\n' + importStatement + content.slice(insertionIndex);
      } else {
        content = importStatement + content;
      }
    }

    // 3. Replace console.log and console.error
    content = content.replace(/console\.log\(/g, 'Log.info(');
    content = content.replace(/console\.error\(/g, 'Log.error(');
    
    modified = true;
  }

  if (modified) {
    await fs.writeFile(filePath, content, 'utf8');
    Log.info(`✅ Upgraded telemetry in: ${path.relative(rootDir, filePath)}`);
  }
}

async function run() {
  Log.info('🚀 [Mass Telemetry Upgrade] Initializing Sovereign handshake perfection...');
  const allFiles = await getFiles(rootDir);
  for (const file of allFiles) {
    await processFile(file);
  }
  Log.info('✅ [Mass Telemetry Upgrade] Complete. All wires synced to Sovereign layer.');
}

run().catch(e => {
  Log.error('Fatal:', e);
  process.exit(1);
});
