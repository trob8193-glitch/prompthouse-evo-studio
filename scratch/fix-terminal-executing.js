import fs from 'node:fs';

const path = 'src/components/Terminal.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        ))}
      </div>
        {executing && (`;

const replacement = `        ))}
        {executing && (`;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully adjusted executing block inside Terminal.jsx!');
} else {
  console.error('Target executing/div block not found in Terminal.jsx!');
}
