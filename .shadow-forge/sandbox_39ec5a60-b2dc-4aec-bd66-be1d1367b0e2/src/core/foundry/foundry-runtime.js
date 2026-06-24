import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export function resolveFoundryPath(name) {
  return path.join(moduleDir, name);
}

export function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export function normalizeOutputText(output) {
  if (typeof output === 'string') return output;
  if (output == null) return '';
  if (typeof output.text === 'string') return output.text;
  if (typeof output.message === 'string') return output.message;
  return JSON.stringify(output);
}
