import fs from 'node:fs';

const path = 'src/index.css';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<<<<<<< HEAD

=======
>>>>>>> main`;

const replacement = ``;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully cleaned second merge conflict markers in index.css!');
} else {
  console.error('Target second merge conflict block not found in index.css!');
}
