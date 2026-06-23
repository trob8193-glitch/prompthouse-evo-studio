import fs from 'fs';
import path from 'path';

console.log('[AI Context Pack] Building master context manifest...');

const dirsToScan = ['src/core', 'lib/ai', 'src/features'];
let combinedContext = '';

function scanDir(dir) {
  const fullPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) return;
  
  const files = fs.readdirSync(fullPath);
  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDir(path.join(dir, file));
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedContext += `\n\n// --- FILE: ${path.join(dir, file)} ---\n${content}`;
    }
  }
}

for (const dir of dirsToScan) {
  scanDir(dir);
}

const outDir = path.resolve(process.cwd(), '.prompthouse-data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'master-context.txt'), combinedContext, 'utf8');

console.log(`[AI Context Pack] SUCCESS: Master context packed (${Math.round(combinedContext.length / 1024)} KB)`);