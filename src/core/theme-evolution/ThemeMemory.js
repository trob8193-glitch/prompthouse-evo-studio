import fs from 'fs';
import path from 'path';

const memoryFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'theme-evolution', 'memory.json');

export function loadThemeMemory(rootDir = process.cwd()) {
  const file = memoryFile(rootDir);
  if (!fs.existsSync(file)) {
    return {
      activeThemeId: 'evoCore',
      approvedThemeId: 'evoCore',
      lastPreview: null,
      usageSignals: {},
      receipts: []
    };
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {
      activeThemeId: 'evoCore',
      approvedThemeId: 'evoCore',
      lastPreview: null,
      usageSignals: {},
      receipts: []
    };
  }
}

export function saveThemeMemory(memory, rootDir = process.cwd()) {
  const file = memoryFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(memory, null, 2), 'utf8');
  return memory;
}

export function recordThemeSignal({ rootDir = process.cwd(), page = 'dashboard', action = 'view', intensity = 1 } = {}) {
  const memory = loadThemeMemory(rootDir);
  const key = `${page}:${action}`;
  memory.usageSignals[key] = Number(memory.usageSignals[key] || 0) + Number(intensity || 1);
  memory.updatedAt = new Date().toISOString();
  return saveThemeMemory(memory, rootDir);
}

export function appendThemeReceipt(receipt = {}, rootDir = process.cwd()) {
  const memory = loadThemeMemory(rootDir);
  memory.receipts = [
    {
      id: receipt.id || `theme_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...receipt
    },
    ...(memory.receipts || [])
  ].slice(0, 100);
  memory.updatedAt = new Date().toISOString();
  return saveThemeMemory(memory, rootDir);
}
