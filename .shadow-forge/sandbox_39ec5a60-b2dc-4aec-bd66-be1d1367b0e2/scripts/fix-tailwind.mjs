import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));

const replacements = [
  [/bg-gradient-to-br/g, 'bg-linear-to-br'],
  [/bg-gradient-to-r/g, 'bg-linear-to-r'],
  [/bg-gradient-to-l/g, 'bg-linear-to-l'],
  [/bg-gradient-to-t/g, 'bg-linear-to-t'],
  [/bg-gradient-to-b/g, 'bg-linear-to-b'],
  [/bg-gradient-to-tl/g, 'bg-linear-to-tl'],
  [/bg-gradient-to-tr/g, 'bg-linear-to-tr'],
  [/bg-gradient-to-bl/g, 'bg-linear-to-bl'],
  [/rounded-\[2rem\]/g, 'rounded-4xl'],
  [/z-\[9999\]/g, 'z-9999'],
  [/blur-\[4px\]/g, 'blur-xs'],
  [/w-\[1px\]/g, 'w-px'],
  [/h-\[1px\]/g, 'h-px'],
  [/from-\[#000\]/g, 'from-black'],
  [/bg-\[#000\]/g, 'bg-black'],
  [/border-\[8px\]/g, 'border-8'],
  [/flex-\[2\]/g, 'flex-2'],
  [/bg-\[radial-gradient\(ellipse_at_center,_var\(--tw-gradient-stops\)\)\]/g, 'bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]'],
  [/bg-\[radial-gradient\(circle_at_top_right,_#111,_#000\)\]/g, 'bg-[radial-gradient(circle_at_top_right,#111,#000)]'],
  [/-left-\[2\.5px\]/g, 'left-[-2.5px]'],
  [/bg-\[length:100%_4px,3px_100%\]/g, 'bg-size-[100%_4px,3px_100%]'],
  [/!min-h-\[120px\]/g, 'min-h-[120px]!'],
  [/!font-mono/g, 'font-mono!'],
  [/!bg-gradient-to-r/g, 'bg-linear-to-r!'],
  [/!from-\[#00ff88\]/g, 'from-[#00ff88]!'],
  [/!to-\[#00f0ff\]/g, 'to-[#00f0ff]!'],
  [/!text-black/g, 'text-black!'],
  [/!border-none/g, 'border-none!'],
  [/!text-\[#b4b4c4\]/g, 'text-[#b4b4c4]!'],
  [/hover:!text-white/g, 'hover:text-white!'],
  [/!border/g, 'border!'],
  [/hover:!border-white\/20/g, 'hover:border-white/20!'],
  [/!bg-\[#00ff88\]\/20/g, 'bg-[#00ff88]/20!'],
  [/!text-\[#00ff88\]/g, 'text-[#00ff88]!'],
  [/!border-\[#00ff88\]\/50/g, 'border-[#00ff88]/50!'],
  [/hover:!bg-\[#00ff88\]\/40/g, 'hover:bg-[#00ff88]/40!'],
];

let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  // Handle duplicate classes simply
  content = content.replace(/className="([^"]+)"/g, (match, classList) => {
    const classes = classList.split(/\s+/);
    const unique = [...new Set(classes)];
    return `className="${unique.join(' ')}"`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
}

console.log(`Updated Tailwind v4 syntax in ${changedCount} files.`);
