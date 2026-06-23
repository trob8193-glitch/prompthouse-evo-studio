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
    } else if (
      fullPath.endsWith('Dashboard.jsx') || 
      fullPath.endsWith('View.jsx') || 
      fullPath.endsWith('Center.jsx') || 
      fullPath.endsWith('Cockpit.jsx')
    ) {
      if (file === 'SovereignIntelligenceDashboard.jsx') continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Aggressive replacement for 4 column inline grids
      content = content.replace(
        /style=\{\{\s*display:\s*['"]grid['"],\s*gridTemplateColumns:\s*['"]repeat\(4,\s*minmax\([^,]+,\s*1fr\)\)['"],\s*gap:\s*[0-9]+([^}]*)\}\}/g,
        'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2" style={{$1}}'
      );

      // Aggressive replacement for 2 column inline grids
      content = content.replace(
        /style=\{\{\s*display:\s*['"]grid['"],\s*gridTemplateColumns:\s*['"]1fr\s+1fr['"],\s*gap:\s*[0-9]+([^}]*)\}\}/g,
        'className="grid grid-cols-1 lg:grid-cols-3 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2" style={{$1}}'
      );

      // Aggressive replacement for standard tailwind grids
      content = content.replace(
        /className="grid grid-cols-2 md:grid-cols-4 gap-\d+"/g,
        'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2"'
      );

      // Handle any lingering auto-fit inline grids
      content = content.replace(
        /style=\{\{\s*display:\s*['"]grid['"],\s*gridTemplateColumns:\s*['"]repeat\(auto-fit,\s*minmax\([^,]+,\s*1fr\)\)['"],\s*gap:\s*[0-9]+([^}]*)\}\}/g,
        'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2" style={{$1}}'
      );

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        modifiedCount++;
        console.log(`[BENTO MUTATED] ${fullPath}`);
      }
    }
  }

  return modifiedCount;
}

console.log("==========================================");
console.log("INITIATING ASYMMETRIC BENTO GRID MUTATION V2");
console.log("==========================================");
const modifiedCount = processDirectory(targetDir);
console.log(`SUCCESS: Mutated layouts to asymmetrical bento in ${modifiedCount} files.`);
console.log("==========================================");
