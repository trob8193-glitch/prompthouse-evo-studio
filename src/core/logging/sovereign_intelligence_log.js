import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const DEFAULT_LOG_PATH = join(process.cwd(), 'proof_receipts', 'sovereign_intelligence_log.json');

export function readSovereignIntelligenceLog(logPath = DEFAULT_LOG_PATH) {
  if (!existsSync(logPath)) {
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(logPath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

export function summarizeSovereignIntelligenceLog(logPath = DEFAULT_LOG_PATH) {
  const records = readSovereignIntelligenceLog(logPath);
  return {
    path: logPath,
    count: records.length,
    latest: records[records.length - 1] || null,
  };
}

