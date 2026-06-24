import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const daemons = [
  'self-invention-daemon.mjs',
  'seed-round-engineering-daemon.mjs',
  'cost-arbitrage-daemon.mjs',
  'holding-company-daemon.mjs',
  'memory-compressor-daemon.mjs',
  'fs-watcher-daemon.mjs',
  'continuous-training-daemon.mjs',
  'plugin-installer-daemon.mjs',
  'mobile-singularity-daemon.mjs',
  'marketing-singularity-daemon.mjs',
  'antigravity-daemon.mjs',
  'realtime-ingestion-daemon.mjs',
  'audit-platform-daemon.mjs',
  'nuclear_audit.mjs',
];

const scriptsDir = 'scripts';
let injected = 0;
let skipped = 0;

for (const daemon of daemons) {
  const filePath = join(scriptsDir, daemon);
  try {
    let content = readFileSync(filePath, 'utf8');
    if (content.includes('daemon-hardener.mjs')) {
      skipped++;
      console.log('⏭️  Skipped (already hardened): ' + daemon);
      continue;
    }
    
    const daemonName = daemon.replace('.mjs', '');
    const importLine = `import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';`;
    const hardenLine = `hardenProcess('${daemonName}');`;
    
    // Insert import after last import statement
    const importEnd = content.lastIndexOf('import ');
    if (importEnd >= 0) {
      const lineEnd = content.indexOf('\n', importEnd);
      content = content.slice(0, lineEnd + 1) + importLine + '\n' + content.slice(lineEnd + 1);
    } else {
      content = importLine + '\n' + content;
    }
    
    // Add hardenProcess call after imports block
    const lines = content.split('\n');
    let insertIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('import ') || trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('//')) {
        insertIdx = i + 1;
      } else {
        break;
      }
    }
    lines.splice(insertIdx, 0, hardenLine, '');
    content = lines.join('\n');
    
    writeFileSync(filePath, content, 'utf8');
    injected++;
    console.log('✅ Hardened: ' + daemon);
  } catch (e) {
    console.log('❌ Failed: ' + daemon + ' - ' + e.message);
  }
}

console.log('\n=== DAEMON HARDENING COMPLETE ===');
console.log('Injected: ' + injected);
console.log('Skipped (already hardened): ' + skipped);
