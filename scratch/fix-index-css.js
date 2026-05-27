import fs from 'node:fs';

const path = 'src/index.css';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<<<<<<< HEAD

  /* ── COMPONENT-LEVEL TOKENS (bot, forge, chrome-ext) ── */
  --char-size: 48px;
  --bot-accent: var(--accent-violet);
  --bot-glow: rgba(139, 92, 246, 0.2);
  --bot-primary: var(--accent-violet);
  --lane-color: var(--accent-cyan);
  --rare-accent: var(--accent-gold);
  --score-percent: 0%;
  --bg: var(--bg-void);
  --text: var(--text-primary);
  --cyan: var(--accent-cyan);
  --violet: var(--accent-violet);
  --pink: var(--accent-pink);
  --dim: var(--text-dim);
  --panel2: var(--bg-elevated);
  --gold: var(--accent-gold);
=======
>>>>>>> main`;

const replacement = `  /* ── COMPONENT-LEVEL TOKENS (bot, forge, chrome-ext) ── */
  --char-size: 48px;
  --bot-accent: var(--accent-violet);
  --bot-glow: rgba(139, 92, 246, 0.2);
  --bot-primary: var(--accent-violet);
  --lane-color: var(--accent-cyan);
  --rare-accent: var(--accent-gold);
  --score-percent: 0%;
  --bg: var(--bg-void);
  --text: var(--text-primary);
  --cyan: var(--accent-cyan);
  --violet: var(--accent-violet);
  --pink: var(--accent-pink);
  --dim: var(--text-dim);
  --panel2: var(--bg-elevated);
  --gold: var(--accent-gold);`;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully removed merge conflict markers in index.css!');
} else {
  console.error('Target merge conflict block not found in index.css!');
}
