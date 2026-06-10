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

const badExpr = "\\(\\(typeof process !== 'undefined' \\? process\\.env\\.BRIDGE_URL : undefined\\) \\|\\| \\(typeof import !== 'undefined' && import\\.meta && import\\.meta\\.env \\? import\\.meta\\.env\\.VITE_BRIDGE_URL : undefined\\) \\|\\| 'http://127\\.0\\.0\\.1:3001'\\)";

// The safe expression: we use a helper pattern that evaluates safely without syntax errors.
// Since import.meta causes syntax errors in old CJS, we can just rely on the fact that Vite replaces import.meta.env.VITE_BRIDGE_URL during build, 
// but to be safe for runtime node and browser:
const safeExpr = "(globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))";

let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const regex = new RegExp(badExpr, 'g');
  content = content.replace(regex, safeExpr);

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Fixed] ${file}`);
    modifiedCount++;
  }
}

console.log(`\nSuccessfully fixed ${modifiedCount} files.`);
