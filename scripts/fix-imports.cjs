const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("import('core/interop/UniversalBridge.js')") || content.includes("import('..")) {
        // Fix standard core import
        let newContent = content.replace(/import\('core\/interop\/UniversalBridge\.js'\)/g, "import('./core/interop/UniversalBridge.js')");
        
        // Ensure imports starting with ".." are resolved correctly if they are missing extension or need mapping
        // We only care about the specific UniversalBridge ones we just generated
        const match = /import\('((?:\.\.|\.)[^']+)'\)/g;
        newContent = newContent.replace(match, (m, p1) => {
          if (!p1.startsWith('.') && !p1.startsWith('/')) {
             return `import('./${p1}')`;
          }
          return m;
        });

        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent);
          console.log('Fixed', fullPath);
        }
      }
    }
  }
}
processDirectory(path.join(process.cwd(), 'src'));
