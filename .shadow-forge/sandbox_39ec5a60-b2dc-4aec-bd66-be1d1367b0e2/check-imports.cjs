const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('src/App.jsx', 'utf8');
const regex = /import.*?from\s+['"](\.[^'"]+)['"]/g;
let match;
const missing = [];

while ((match = regex.exec(code)) !== null) {
  const p = path.resolve('src', match[1]);
  if (!fs.existsSync(p) && !fs.existsSync(p + '.js') && !fs.existsSync(p + '.jsx')) {
    missing.push(match[1]);
  }
}

console.log('Missing imports:', missing);
