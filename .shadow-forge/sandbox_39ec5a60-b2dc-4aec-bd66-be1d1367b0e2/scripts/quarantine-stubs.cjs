const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const QUARANTINE = path.join(ROOT, '_quarantine');
const toMove = [];

function scan(dir, rel) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const absPath = path.join(dir, f.name);
    const relPath = path.join(rel, f.name);
    if (f.isDirectory() && !f.name.startsWith('.') && f.name !== 'node_modules' && f.name !== '_quarantine') {
      scan(absPath, relPath);
    } else if (f.name.endsWith('.js') && !f.name.endsWith('.test.js')) {
      const code = fs.readFileSync(absPath, 'utf8');
      const hasFillerComments = code.includes('Logic Density Filler');
      const isOmnipotentStub = code.includes("result: 'FULFILLED'") && code.includes('OMNIPOTENT') && code.length < 1200;
      if (hasFillerComments || isOmnipotentStub) {
        toMove.push(relPath);
      }
    }
  }
}

scan(path.join(ROOT, 'src', 'features'), path.join('src', 'features'));
scan(path.join(ROOT, 'src', 'core'), path.join('src', 'core'));

console.log('Files to quarantine:', toMove.length);

if (process.argv.includes('--execute')) {
  for (const relPath of toMove) {
    const src = path.join(ROOT, relPath);
    const dest = path.join(QUARANTINE, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
    console.log('  MOVED:', relPath);
  }
  console.log('\nDone. Moved', toMove.length, 'files to _quarantine/');
} else {
  toMove.forEach(f => console.log('  ', f));
  console.log('\nDry run. Use --execute to actually move files.');
}
