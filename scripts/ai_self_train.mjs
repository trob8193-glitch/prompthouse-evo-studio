import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const configPath = path.join(root, '.ai', 'config', 'bridge.config.json');
const outboxDir = path.join(root, '.ai', 'outbox');

const loadConfig = () => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing ai bridge config at ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

const fetchJson = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const errMsg = payload?.error || payload?.message || res.statusText;
    throw new Error(`Request failed ${res.status} ${errMsg}`);
  }
  return payload;
};

const readFileSafe = (filePath) => {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  } catch {
    return '';
  }
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const main = async () => {
  const config = loadConfig();
  ensureDir(outboxDir);

  console.log('📦 Creating context pack...');
  execSync('node scripts/ai_context_pack.mjs', { cwd: root, stdio: 'inherit' });

  const reviewPath = path.join(root, config.reviewOutputPath);
  const nextPassPath = path.join(root, config.antigravityPromptOutputPath);
  const checklistPath = path.join(root, config.repairChecklistOutputPath);

  const review = readFileSafe(reviewPath).trim();
  const nextPass = readFileSafe(nextPassPath).trim();
  const checklist = readFileSafe(checklistPath).trim();

  if (!review || !nextPass) {
    throw new Error('Required review or next-pass output is missing; run ai:review first.');
  }

  const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';
  const capture = {
    id: `training_${Date.now()}`,
    source: 'ai_self_train.mjs',
    project: path.basename(root),
    model: process.env.OPENAI_MODEL || config.fallbackModel,
    reviewPath: config.reviewOutputPath,
    nextPassPath: config.antigravityPromptOutputPath,
    checklistPath: config.repairChecklistOutputPath,
    summary: review.slice(0, 3000),
    next_pass_excerpt: nextPass.split('\n').slice(0, 120).join('\n'),
    checklist: checklist.split('\n').slice(0, 120).join('\n'),
    createdAt: new Date().toISOString()
  };

  console.log(`🔁 Posting training capture to ${bridgeUrl}/api/training-capture`);
  await fetchJson(`${bridgeUrl}/api/training-capture`, capture);

  const runId = capture.id;
  console.log(`🚀 Activating local evo runtime at ${bridgeUrl}/api/evo-runtime/activate`);
  await fetchJson(`${bridgeUrl}/api/evo-runtime/activate`, { source: capture.source, runId });

  console.log(`🛠️ Requesting self-implementation cycle at ${bridgeUrl}/api/self-implementation/cycle`);
  const implementationResult = await fetchJson(`${bridgeUrl}/api/self-implementation/cycle`, {
    applyFixes: true,
    runTests: true,
    runBuild: true,
    source: capture.source,
    runId
  });

  const reportContent = [
    `# AI Self-Training Report`,
    `Generated: ${new Date().toISOString()}`,
    `Bridge: ${bridgeUrl}`,
    `Training capture: ${capture.id}`,
    `Model: ${capture.model}`,
    '',
    `## Review Snapshot`,
    review.slice(0, 4000),
    '',
    `## Next-Pass Summary`,
    nextPass.split('\n').slice(0, 120).join('\n'),
    '',
    `## Implementation Result`,
    JSON.stringify(implementationResult, null, 2)
  ].join('\n');

  const reportPath = path.join(outboxDir, 'ai-self-train-report.md');
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`✅ Training cycle complete. Report written to ${reportPath}`);
};

main().catch((err) => {
  console.error('❌ ai_self_train failed:', err.message || err);
  process.exit(1);
});
