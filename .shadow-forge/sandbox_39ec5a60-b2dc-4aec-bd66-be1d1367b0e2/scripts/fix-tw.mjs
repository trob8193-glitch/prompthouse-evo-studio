import fs from 'fs';
import path from 'path';
import { twMerge } from 'tailwind-merge';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Match className="..."
      content = content.replace(/className="([^"]+)"/g, (match, classes) => {
        const merged = twMerge(classes);
        if (merged !== classes) {
          modified = true;
          return `className="${merged}"`;
        }
        return match;
      });

      // Match className={`...`}
      content = content.replace(/className=\{`([\s\S]+?)`\}/g, (match, classes) => {
        let mergedClasses = classes;
        const dynamics = [];
        
        // Temporarily replace ${...} with tw-dyn-X
        mergedClasses = mergedClasses.replace(/\$\{[\s\S]+?\}/g, (dynMatch) => {
            const id = `tw-dyn-${dynamics.length}`;
            dynamics.push(dynMatch);
            return id;
        });
        
        mergedClasses = twMerge(mergedClasses);
        
        // Restore dynamic blocks
        mergedClasses = mergedClasses.replace(/tw-dyn-(\d+)/g, (m, id) => {
            return dynamics[Number(id)];
        });
        
        if (mergedClasses !== classes) {
            modified = true;
            return `className={\`${mergedClasses}\`}`;
        }
        return match;
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src'));
console.log("Done merging classes.");
