import fs from 'node:fs';

const path = 'src/components/Terminal.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `  const runCatalogCommand = async (item) => {
    if (executing) return;
    if (item.session && item.session !== activeTerminalSession) {
      setActiveTerminalSession(item.session);
    }
    setCommand(item.command);
    setHistoryIndex(-1);
    await runCommandText(item.command, item.session || activeTerminalSession);
  };

    addTerminalLog('System: Terminal output copied to clipboard.', 'system', activeTerminalSession);
  };`;

const replacement = `  const runCatalogCommand = async (item) => {
    if (executing) return;
    if (item.session && item.session !== activeTerminalSession) {
      setActiveTerminalSession(item.session);
    }
    setCommand(item.command);
    setHistoryIndex(-1);
    await runCommandText(item.command, item.session || activeTerminalSession);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < terminalHistory.length) {
        setHistoryIndex(nextIndex);
        setCommand(terminalHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setCommand(terminalHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const copyToClipboard = () => {
    const text = logs.map(l => l.content).join('\\n');
    navigator.clipboard.writeText(text);
    addTerminalLog('System: Terminal output copied to clipboard.', 'system', activeTerminalSession);
  };`;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully restored handleKeyDown and copyToClipboard in Terminal.jsx!');
} else {
  console.error('Target catalog/clipboard block not found in Terminal.jsx!');
}
