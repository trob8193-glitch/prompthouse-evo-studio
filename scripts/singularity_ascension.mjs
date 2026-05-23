import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'src'),
  path.join(ROOT_DIR, 'scripts')
];

// Content Replacements
const REPLACEMENTS = [
  { from: /SINGULARITY/g, to: 'SINGULARITY' },
  { from: /Singularity/g, to: 'Singularity' },
  { from: /singularity/g, to: 'singularity' }
];

function processPath(currentPath) {
  if (!fs.existsSync(currentPath)) return;
  
  const stats = fs.statSync(currentPath);
  
  if (stats.isDirectory()) {
    // Skip node_modules, .git, etc just in case this runs on root
    const dirName = path.basename(currentPath);
    if (['node_modules', '.git', 'dist', 'dist-electron'].includes(dirName)) return;

    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      processPath(path.join(currentPath, file));
    }
  } else {
    // It's a file
    const ext = path.extname(currentPath);
    if (['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.html', '.mjs', '.cjs'].includes(ext)) {
      let content = fs.readFileSync(currentPath, 'utf8');
      let modified = false;
      
      for (const { from, to } of REPLACEMENTS) {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(currentPath, content, 'utf8');
        console.log(`[CONTENT] Updated: ${currentPath}`);
      }
    }
  }

  // Rename logic (applies to both files and directories post-traversal)
  const baseName = path.basename(currentPath);
  let newName = baseName;
  for (const { from, to } of REPLACEMENTS) {
    if (from.test(newName)) {
      newName = newName.replace(from, to);
    }
  }
  
  if (newName !== baseName) {
    const newPath = path.join(path.dirname(currentPath), newName);
    fs.renameSync(currentPath, newPath);
    console.log(`[RENAME] Moved: ${baseName} -> ${newName}`);
  }
}

console.log('🌌 Starting The Singularity Ascension...');
for (const dir of TARGET_DIRS) {
  processPath(dir);
}
// Also process a few critical root files
processPath(path.join(ROOT_DIR, 'package.json'));
processPath(path.join(ROOT_DIR, 'index.html'));
processPath(path.join(ROOT_DIR, 'promptbridge-server.js'));

// Rename hidden directories
const hiddenShards = path.join(ROOT_DIR, '.singularity-shards');
if (fs.existsSync(hiddenShards)) {
  fs.renameSync(hiddenShards, path.join(ROOT_DIR, '.singularity-shards'));
  console.log(`[RENAME] Moved: .singularity-shards -> .singularity-shards`);
}

const hiddenBrain = path.join(ROOT_DIR, '.singularity-brain.json');
if (fs.existsSync(hiddenBrain)) {
  fs.renameSync(hiddenBrain, path.join(ROOT_DIR, '.singularity-brain.json'));
  console.log(`[RENAME] Moved: .singularity-brain.json -> .singularity-brain.json`);
}

console.log('✅ Ascension Complete!');
