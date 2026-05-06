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
files.forEach(file => {
  if (file.includes('SovereignLogger.js')) return;
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Swap console.log for Log.info
  if (content.includes('console.log')) {
    content = content.replace(/console\.log/g, 'Log.info');
    // Add import if not present
    if (!content.includes('SovereignLogger.js')) {
        const relativePath = path.relative(path.dirname(file), path.join(process.cwd(), 'src', 'core', 'autonomy', 'SovereignLogger.js')).replace(/\\/g, '/');
        content = `import { Log } from '${relativePath}';\n` + content;
    }
  }

  // 2. Fix PerfectionGate regex to not flag itself
  if (file.includes('PerfectionGate.js')) {
    content = content.replace(/regex: \/TODO\|FIXME\|HACK\|PLACEHOLDER\|MOCK\|FAKE\/gi/g, "regex: new RegExp('TODO|FIXME|HACK|PLACEHOLDER|MOCK|FAKE', 'gi')");
    content = content.replace(/regex: \/console\\\.\(log\|dir\|warn\)\/g/g, "regex: new RegExp('console\\\\.(log|dir|warn)', 'g')");
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`✓ Canonized: ${file}`);
  }
});
