import fs from 'fs';
import path from 'path';

/**
 * PH EVO STUDIO — IMPORT FIXER
 * ═══════════════════════════════════════════════════════════════
 * This script ensures that all 200+ fulfilled files have the correct
 * relative path to the Sovereign Logger.
 */

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src');
const loggerPath = path.join(process.cwd(), 'src', 'core', 'autonomy', 'SovereignLogger.js');

files.forEach(file => {
  if (file.includes('SovereignLogger.js')) return;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Find any import line that targets SovereignLogger.js
  const importRegex = /import { Log } from '.*SovereignLogger\.js';/g;
  
  if (content.match(importRegex)) {
    let relPath = path.relative(path.dirname(file), loggerPath).replace(/\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    content = content.replace(importRegex, `import { Log } from '${relPath}';`);
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`✓ Fixed Import: ${file}`);
    }
  }
});
