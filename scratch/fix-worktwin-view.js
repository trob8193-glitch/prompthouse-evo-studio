import fs from 'node:fs';

const path = 'src/worktwin-view.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `// Dummy implementations for missing pattern-miner.js
const runPatternMiner = () => [];
const getAllPatterns = () => [];
const generateRecipeFromPattern = (p) => ({ name: 'Mock Recipe' });`;

const replacement = ``;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully cleaned up dummy declarations in worktwin-view.jsx!');
} else {
  console.error('Target dummy declarations block not found in worktwin-view.jsx!');
}
