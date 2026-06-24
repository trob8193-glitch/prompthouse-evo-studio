import fs from 'fs';
import path from 'path';

const targetDir = './src/features';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let modifiedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      modifiedCount += processDirectory(fullPath);
    } else if (fullPath.endsWith('Dashboard.jsx') || fullPath.endsWith('View.jsx') || fullPath.endsWith('Center.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // 1. Remove inline object definitions (dangerous, but necessary for global purge)
      content = content.replace(/const\s+card\s*=\s*\{[^}]+\};\s*/g, '');
      content = content.replace(/const\s+button\s*=\s*\{[^}]+\};\s*/g, '');
      content = content.replace(/const\s+panel\s*=\s*\{[^}]+\};\s*/g, '');

      // 2. Replace style usages with Singularity classes
      content = content.replace(/style=\{card\}/g, 'className="glass-extreme rounded-3xl border border-neon-glow p-5"');
      content = content.replace(/style=\{button\}/g, 'className="glass-extreme text-neon-cyan hover:border-cyan-400/80 transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] rounded-xl px-4 py-2 text-xs font-black inline-flex items-center gap-2"');
      content = content.replace(/style=\{panel\}/g, 'className="glass-extreme rounded-3xl border border-neon-glow p-6"');

      // 3. Handle inline merging (e.g. style={{ ...card, marginTop: 10 }})
      content = content.replace(/style=\{\{\s*\.\.\.card,\s*([^}]+)\}\}/g, 'className="glass-extreme rounded-3xl border border-neon-glow p-5" style={{ $1 }}');
      content = content.replace(/style=\{\{\s*\.\.\.button,\s*([^}]+)\}\}/g, 'className="glass-extreme text-neon-cyan hover:border-cyan-400/80 transition-all rounded-xl px-4 py-2 text-xs font-black inline-flex items-center gap-2" style={{ $1 }}');

      // 4. Force background to dark mode if it was hardcoded white/gray
      content = content.replace(/background:\s*['"]#(f8fafc|ffffff|f1f5f9)['"]/gi, 'background: "transparent"');
      content = content.replace(/color:\s*['"]#(0f172a|1e293b|334155)['"]/gi, 'color: "#e2e8f0"');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        modifiedCount++;
        console.log(`[LAYOUT MUTATED] ${fullPath}`);
      }
    }
  }

  return modifiedCount;
}

console.log("==========================================");
console.log("INITIATING INLINE STYLE ERADICATION");
console.log("==========================================");
const modifiedCount = processDirectory(targetDir);
console.log(`SUCCESS: Eradicated inline styles in ${modifiedCount} dashboards.`);
console.log("==========================================");
