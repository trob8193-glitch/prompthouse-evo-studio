import fs from 'node:fs';

const path = 'src/components/Terminal.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = '    bondedNodes\n  } = useSovereignStore();';
const targetStrCRLF = '    bondedNodes\r\n  } = useSovereignStore();';

const replacement = `export function Terminal() {
  const { 
    terminalOpen, 
    setTerminalOpen, 
    terminalSessions, 
    activeTerminalSession,
    setActiveTerminalSession,
    addTerminalLog, 
    clearTerminal,
    terminalTheme,
    setTerminalTheme,
    terminalHistory,
    addTerminalHistory,
    addBondedNode,
    bondedNodes
  } = useSovereignStore();`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully repaired Terminal.jsx (LF)!');
} else if (content.includes(targetStrCRLF)) {
  content = content.replace(targetStrCRLF, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully repaired Terminal.jsx (CRLF)!');
} else {
  // Let's do a search and replace based on the actual lines 65-66:
  const lines = content.split('\n');
  let replaced = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('bondedNodes') && lines[i+1] && lines[i+1].includes('} = useSovereignStore();')) {
      lines.splice(i, 2, ...replacement.split('\n'));
      content = lines.join('\n');
      fs.writeFileSync(path, content, 'utf8');
      console.log('Successfully repaired Terminal.jsx by line splicing!');
      replaced = true;
      break;
    }
  }
  if (!replaced) {
    console.error('Could not find target destructuring pattern in Terminal.jsx!');
  }
}
