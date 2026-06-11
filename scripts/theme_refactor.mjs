import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walk('./src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We only want to replace standalone words so we don't break camelCase variables like useSovereignStore
    // Replace "Sovereign" with "Evo Studio"
    content = content.replace(/\bSovereign\b/g, 'Evo Studio');
    
    // Replace "SOVEREIGN" with "EVO STUDIO"
    content = content.replace(/\bSOVEREIGN\b/g, 'EVO STUDIO');
    
    // Replace "sovereign" with "evo"
    content = content.replace(/\bsovereign\b/g, 'evo');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log(`Updated visible wording in: ${filePath}`);
    }
  }
});

console.log(`\nSuccess! Re-themed ${modifiedCount} files in the visual layer from Sovereign to Evo Studio.`);
