import fs from 'fs';
import path from 'path';

// The directory containing all the studio's React files
const targetDir = './src';

// Regex replacement dictionary (legacy styling -> Singularity styling)
const replacements = [
  // Backgrounds
  { pattern: /bg-slate-900/g, replacement: 'glass-extreme border-neon-glow' },
  { pattern: /bg-\[\#0[aA]0[aA]0[aA]\]/g, replacement: 'glass-extreme border-neon-glow' },
  { pattern: /bg-slate-800/g, replacement: 'bg-black/40 backdrop-blur-md border border-white/5' },
  
  // Borders
  { pattern: /border-slate-800/g, replacement: 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]' },
  { pattern: /border-slate-700/g, replacement: 'border-cyan-500/30' },
  
  // Text
  { pattern: /text-blue-400/g, replacement: 'text-neon-cyan' },
  { pattern: /text-indigo-400/g, replacement: 'text-neon-cyan' },
  
  // Rounding
  { pattern: /rounded-lg/g, replacement: 'rounded-2xl' },
  { pattern: /rounded-xl/g, replacement: 'rounded-3xl' },
  
  // Hover effects
  { pattern: /hover:bg-slate-800/g, replacement: 'hover:border-cyan-400/80 transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)]' },
  { pattern: /hover:bg-slate-700/g, replacement: 'hover:border-cyan-400/80 transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;
  let modifiedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const stats = processDirectory(fullPath);
      processedCount += stats.processedCount;
      modifiedCount += stats.modifiedCount;
    } else if (fullPath.endsWith('.jsx')) {
      processedCount++;
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Apply all regex replacements
      for (const rule of replacements) {
        if (rule.pattern.test(content)) {
          content = content.replace(rule.pattern, rule.replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        modifiedCount++;
        console.log(`[MUTATED] ${fullPath}`);
      }
    }
  }

  return { processedCount, modifiedCount };
}

console.log("==========================================");
console.log("INITIATING GLOBAL AESTHETIC MASS-MUTATION");
console.log("==========================================");

const { processedCount, modifiedCount } = processDirectory(targetDir);

console.log("==========================================");
console.log(`SUCCESS: Processed ${processedCount} files.`);
console.log(`MUTATED: Rewrote ${modifiedCount} files with Singularity aesthetics.`);
console.log("==========================================");
