#!/usr/bin/env node
import dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

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
  '## Online Blockers',
  '',
  ...result.onlineBlockers.map((item, index) => `${index + 1}. **${item.severity}** ${item.label}\n   - Provider: ${item.provider}\n   - Reasons: ${item.reasons.join('; ')}\n   - Route: ${item.route}\n   - Proof: ${item.proofCommand}\n   - Next: ${item.nextAction}`),
  '',
];
const out = join(process.cwd(), 'docs', 'platform-ready', 'REPAIR_QUEUE.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join('\n'), 'utf8');
Log.info(`Wrote ${out}`);
