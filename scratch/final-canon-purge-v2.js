import fs from 'fs';
import path from 'path';

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

  // 1. Fix imports
  if (content.includes('import { Log } from')) {
    let relPath = path.relative(path.dirname(file), loggerPath).replace(/\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    content = content.replace(/import { Log } from '.*';/, `import { Log } from '${relPath}';`);
  }

  // 2. Fix PerfectionGate regex
  if (file.includes('PerfectionGate.js')) {
    content = content.replace(/regex: \/TODO\|FIXME\|HACK\|PLACEHOLDER\|MOCK\|FAKE\/gi/g, "regex: new RegExp('TODO|FIXME|HACK|PLACEHOLDER|MOCK|FAKE', 'gi')");
    content = content.replace(/regex: \/console\\\.\(log\|dir\|warn\)\/g/g, "regex: new RegExp('console\\\\.(log|dir|warn)', 'g')");
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed: ${file}`);
  }
});
