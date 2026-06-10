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

const badString = "(globalThis.process?.env?.VITE_BRIDGE_URL)";

let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace the bad string entirely
  // We can just use split and join for exact match replacement
  content = content.split(badString).join("(globalThis.process?.env?.VITE_BRIDGE_URL)");

  // Also let's clean up `(globalThis.process?.env?.BRIDGE_URL)`
  content = content.split("(globalThis.process?.env?.BRIDGE_URL)").join("(globalThis.process?.env?.BRIDGE_URL)");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Fixed] ${file}`);
    modifiedCount++;
  }
}

console.log(`\nSuccessfully fixed ${modifiedCount} files.`);
