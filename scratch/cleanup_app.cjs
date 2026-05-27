const fs = require('fs');
const path = 'src/App.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Keep only unique imports
const seen = new Set();
const cleanLines = [];

for (let line of lines) {
  if (line.trim().startsWith('import ')) {
    if (!seen.has(line.trim())) {
      seen.add(line.trim());
      cleanLines.push(line);
    }
  } else {
    cleanLines.push(line);
  }
}

fs.writeFileSync(path, cleanLines.join('\n'));
console.log('Successfully de-duplicated imports in App.jsx.');
