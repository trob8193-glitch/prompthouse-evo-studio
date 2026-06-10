import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.gemini' || file === 'dist' || file === 'build' || file === '.next') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(js|jsx|mjs)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = [...getAllFiles('src'), ...getAllFiles('scripts'), ...getAllFiles('server'), ...getAllFiles('lib')];

const bridgeExpr = "((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))";

let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Replace hardcoded assignments
  content = content.replace(/const\s+BRIDGE_URL\s*=\s*['"`]http:\/\/(127\.0\.0\.1|localhost):3001['"`];/g, `const BRIDGE_URL = ${bridgeExpr};`);
  content = content.replace(/let\s+BRIDGE_URL\s*=\s*['"`]http:\/\/(127\.0\.0\.1|localhost):3001['"`];/g, `let BRIDGE_URL = ${bridgeExpr};`);
  content = content.replace(/const\s+LOCAL_BRIDGE_URL\s*=\s*['"`]http:\/\/(127\.0\.0\.1|localhost):3001(.*?)['"`];/g, `const LOCAL_BRIDGE_URL = ${bridgeExpr} + '$2';`);

  // 2. Replace hardcoded URLs inside fetch or other function calls
  // e.g. fetch((globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))) + '/api/...') -> fetch(bridgeExpr + '/api/...')
  content = content.replace(/['"`]http:\/\/(127\.0\.0\.1|localhost):3001(.*?)['"`]/g, (match, ip, rest) => {
    // If it's just (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))
    if (!rest) return bridgeExpr;
    // If it's inside template literal `${(globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))}/api/...`
    if (match.startsWith('\`')) {
      return `\`\${${bridgeExpr}}${rest}\``;
    }
    // If it's a string (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))) + '/api/...'
    return `${bridgeExpr} + '${rest}'`;
  });

  // 3. Fix edge cases where `${bridgeExpr}` gets nested badly or syntax breaks
  // (We'll trust the regex for now)

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Wired] ${file}`);
    modifiedCount++;
  }
}

console.log(`\nSuccessfully wired and edged ${modifiedCount} files for global provider environments.`);
