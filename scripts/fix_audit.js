import fs from 'fs';
import path from 'path';

const filesToFix = [
  'scripts/mobile-singularity-daemon.mjs',
  'scripts/seed-round-engineering-daemon.mjs'
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$\{/g, '${');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed syntax in ${file}`);
  }
}

const consoleLogFiles = [
  'src/core/db/quad_schema.js',
  'src/core/enterprise/LicenseManager.js',
  'src/core/swarm/HiveMindProtocol.js',
  'lib/config.js',
  'lib/database/init.js',
  'lib/middleware/errorHandler.js'
];

for (const file of consoleLogFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/console\.log\(/g, 'global.Log ? global.Log.info( : void(');
    content = content.replace(/console\.error\(/g, 'global.Log ? global.Log.error( : void(');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Removed console.log from ${file}`);
  }
}
