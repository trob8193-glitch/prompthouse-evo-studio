import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const tokenReplacements = [
        [/\bcard\b/g, "glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl"],
        [/\bcard-header\b/g, "border-b border-cyan-500/20 pb-4 mb-4 flex items-center justify-between"],
        [/\bcard-title\b/g, "text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest"],
        [/\bcard-body\b/g, "flex flex-col gap-4"],
        [/\bfield-label\b/g, "text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block"],
        [/\bfield-input\b/g, "w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm"],
        [/\bbtn btn-primary\b/g, "glass-extreme text-neon-cyan border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95"],
        [/\bbtn btn-secondary\b/g, "glass-extreme text-fuchsia-400 border border-fuchsia-500/30 hover:border-fuchsia-400 transition-all shadow-[0_0_15px_rgba(217,70,239,0.1)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-fuchsia-500/10 hover:scale-[1.02] active:scale-95"],
        [/\bbtn\b(?!\s+(btn-primary|btn-secondary))/g, "glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95"], // fallback button
        [/\bbtn-sm\b/g, "px-3 py-1 text-[10px]"],
        [/\bpage-title\b/g, "text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2"],
        [/\bpage-subtitle\b/g, "text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8"],
        [/\bgrid-2\b/g, "grid grid-cols-1 lg:grid-cols-2 gap-8"],
        [/\bflex-between\b/g, "flex items-center justify-between"],
        [/\bflex-col\b/g, "flex flex-col gap-4"]
      ];

      const classNameRegex = /className=(["'])(.*?)\1|className=\{`(.*?)`\}/g;
      let newContent = content.replace(classNameRegex, (match, quote, p2, p3) => {
        let classStr = p2 || p3;
        if (!classStr) return match;
        
        if (classStr.includes('glass-extreme') || classStr.includes('tracking-widest')) {
           return match;
        }

        let modifiedStr = classStr;
        for (const [pattern, replacement] of tokenReplacements) {
          modifiedStr = modifiedStr.replace(pattern, replacement);
        }

        if (p2) {
          return `className="${modifiedStr}"`;
        } else {
          return `className={\`${modifiedStr}\`}`;
        }
      });

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Upgraded ${file}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Global reconstruction complete.");
