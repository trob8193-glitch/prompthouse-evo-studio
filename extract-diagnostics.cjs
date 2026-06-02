const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('promptbridge-server.js', 'utf8');
const lines = content.split('\n');

function extractBlock(startFunc, endFunc, newFile, imports = '') {
  const startIndex = lines.findIndex(l => l.startsWith('function ' + startFunc) || l.startsWith('async function ' + startFunc));
  let endIndex = -1;
  if (endFunc) {
     endIndex = lines.findIndex(l => l.startsWith('function ' + endFunc) || l.startsWith('async function ' + endFunc));
  } else {
     endIndex = lines.length; // to the end
  }
  
  if (startIndex === -1 || (endFunc && endIndex === -1)) {
    console.error(`Could not find ${startFunc} or ${endFunc}`);
    return null;
  }
  
  let realEndIndex = endIndex - 1;
  while (realEndIndex > startIndex && lines[realEndIndex].trim() === '') {
     realEndIndex--;
  }
  if (lines[realEndIndex].trim() !== '}') {
     while (realEndIndex < lines.length && lines[realEndIndex].trim() !== '}') {
       realEndIndex++;
     }
  }
  realEndIndex++; 
  
  const chunk = lines.slice(startIndex, realEndIndex).join('\n');
  const moduleContent = `${imports}\n\n${chunk}\n`;
  
  const exports = [];
  const funcRegex = /^(?:async )?function ([a-zA-Z0-9_]+)/gm;
  let match;
  while ((match = funcRegex.exec(chunk)) !== null) {
    exports.push(match[1]);
  }
  
  const finalContent = `${moduleContent}\nexport {\n  ${exports.join(',\n  ')}\n};\n`;
  fs.mkdirSync(path.dirname(newFile), { recursive: true });
  fs.writeFileSync(newFile, finalContent);
  
  for (let i = startIndex; i < realEndIndex; i++) {
     lines[i] = 'DELETE_ME';
  }
  
  console.log(`Extracted ${startFunc} to ${newFile}`);
}

// Diagnostic Helpers
extractBlock('toPosixPath', 'scheduleNightforgeDaemon', 'src/server/utils/diagnostic-helpers.js', 
`import { join, resolve, dirname, extname, relative } from 'path';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
const DIAGNOSTIC_SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', '.next']);
const DIAGNOSTIC_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);`);

const finalLines = lines.filter(l => l !== 'DELETE_ME');
fs.writeFileSync('promptbridge-server.js', finalLines.join('\n'));
console.log('Extraction complete.');
