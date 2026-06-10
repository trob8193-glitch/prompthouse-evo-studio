import fs from 'fs';

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
    content = content.replace(/global\.Log \? global\.Log\.info\( : void\(/g, 'global.Log && global.Log.info(');
    content = content.replace(/global\.Log \? global\.Log\.error\( : void\(/g, 'global.Log && global.Log.error(');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed syntax in ${file}`);
  }
}
