#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

const result = new PlatformReadinessEngine().status({ runCommands: false });
const lines = [
  '# Platform Sentinel Repair Queue',
  '',
  `Generated: ${result.generatedAt}`,
  `Verdict: ${result.release.verdict}`,
  `Score: ${result.score}`,
  '',
  '## Repairs',
  '',
  ...result.repairQueue.map((item, index) => `${index + 1}. **${item.priority}** ${item.title}\n   - Detail: ${String(item.detail || '').replace(/\n/g, ' ').slice(0, 500)}`),
  '',
];
const out = join(process.cwd(), 'docs', 'platform-ready', 'REPAIR_QUEUE.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`Wrote ${out}`);
