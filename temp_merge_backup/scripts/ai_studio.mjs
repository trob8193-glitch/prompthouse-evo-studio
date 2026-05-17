import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import * as guardrails from './ai_guardrails.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

dotenv.config({ override: true });

const configPath = path.join(root, '.ai', 'config', 'bridge.config.json');
const inboxDir = path.join(root, '.ai', 'inbox');
const outboxDir = path.join(root, '.ai', 'outbox');
const backupDir = path.join(root, '.ai', 'backups', 'studio');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
};

const runCommand = (command) => {
  try {
    const stdout = execSync(command, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: err.stdout ? err.stdout.toString('utf8') : '',
      stderr: err.stderr ? err.stderr.toString('utf8') : String(err.message)
    };
  }
};

const gatherRelevantFiles = (buildErrors) => {
  const fileRegex = /([\w@./\\-]+\.(?:js|mjs|ts|tsx|jsx|json|md|html|css|yml|yaml))/g;
  const matches = new Set();
  let match;

  while ((match = fileRegex.exec(buildErrors)) !== null) {
    if (match[1]) {
      const candidate = match[1].replace(/\r|\n/g, '');
      const resolved = path.resolve(root, candidate);
      if (guardrails.isPathInsideProject(root, resolved) && fs.existsSync(resolved)) {
        matches.add(guardrails.normalizeRelativePath(root, resolved));
      }
    }
  }

  const files = [];
  for (const relative of Array.from(matches).slice(0, 7)) {
    const fullPath = path.join(root, relative);
    try {
      const content = guardrails.redactSensitiveText(fs.readFileSync(fullPath, 'utf8'));
      files.push({ path: relative, content: content.slice(0, 14000) });
    } catch {
      // ignore unreadable file
    }
  }
  return files;
};

const extractJson = (text) => {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;
  const candidate = text.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

const applyPatches = (patches) => {
  if (!Array.isArray(patches)) return [];
  const applied = [];

  for (const patch of patches) {
    if (!patch || !patch.path || typeof patch.content !== 'string') continue;
    const targetPath = path.resolve(root, patch.path);
    if (!guardrails.isPathInsideProject(root, targetPath)) {
      throw new Error(`Patch refers to file outside project root: ${patch.path}`);
    }
    const backupPath = path.join(backupDir, patch.path + '.bak');
    if (fs.existsSync(targetPath)) {
      ensureDir(path.dirname(backupPath));
      writeFile(backupPath, fs.readFileSync(targetPath, 'utf8'));
    }
    writeFile(targetPath, patch.content);
    applied.push(patch.path);
  }

  return applied;
};

const main = async () => {
  if (!fs.existsSync(configPath)) {
    console.error('❌ Missing .ai/config/bridge.config.json. Run npm run ai:pack first to initialize the studio context.');
    process.exit(1);
  }

  ensureDir(inboxDir);
  ensureDir(outboxDir);
  ensureDir(backupDir);

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const summaryPath = path.join(root, config.summaryOutputPath);
  const snapshotPath = path.join(root, config.outputSnapshotPath);
  const summaryText = fs.existsSync(summaryPath) ? fs.readFileSync(summaryPath, 'utf8') : '';
  const snapshot = fs.existsSync(snapshotPath) ? JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) : null;

  console.log('▶ Phase 1: Packing project context...');
  runCommand('node scripts/ai_context_pack.mjs');

  console.log('▶ Phase 2: Running build to capture errors...');
  const buildResult = runCommand('npm run build');
  const buildLog = `${buildResult.stdout || ''}\n${buildResult.stderr || ''}`.trim();
  writeFile(path.join(inboxDir, 'terminal-errors.md'), buildLog);

  const relevantFiles = gatherRelevantFiles(buildLog || JSON.stringify(snapshot || {}));
  const fileSnippets = relevantFiles.map((file) => `--- FILE: ${file.path} ---\n${file.content}`).join('\n\n');

  const prompt = `You are the studio maintainer for a JavaScript/TypeScript repo. Use the current project summary, build results, and relevant file contents to identify and fix compilation or wiring errors.\n\n` +
    `Project Summary:\n${summaryText}\n\n` +
    `Build Result:\n${buildLog || 'Build passed successfully.'}\n\n` +
    `Relevant source snippets:\n${fileSnippets || 'No relevant snippets were extracted.'}\n\n` +
    `Please respond with valid JSON only. The JSON object must contain:\n` +
    `{
  "phasePlan": [{"phase":"...","summary":"..."}],
  "fixSummary":"...",
  "nextSteps":"...",
  "patches":[{"path":"relative/path/to/file","content":"file contents after fix"}],
  "errorsFound":"..."
}\n` +
    `Only include files that need edits in patches. Do not add any files outside the current project. Return no markdown, only JSON.`;

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set. Cannot call OpenAI.');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('▶ Phase 3: Requesting AI studio repair plan...');

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a meticulous AI developer assistant that repairs code in place and returns valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 2800
  });

  const aiText = response.choices?.[0]?.message?.content || '';
  writeFile(path.join(outboxDir, 'ai-studio-response.txt'), aiText);

  const json = extractJson(aiText);
  if (!json) {
    console.error('❌ Could not parse valid JSON from the AI response. Raw response saved at .ai/outbox/ai-studio-response.txt');
    process.exit(1);
  }

  const reportContent = `# AI Studio Repair Report\n\n` +
    `## Build status\n` +
    `- Code: ${buildResult.code}\n` +
    `- Errors captured: ${buildLog ? 'YES' : 'NO'}\n\n` +
    `## Fix Summary\n${json.fixSummary || 'No summary provided.'}\n\n` +
    `## Phase Plan\n${(json.phasePlan || []).map((phase, index) => `${index + 1}. ${phase.phase}: ${phase.summary}`).join('\n')}\n\n` +
    `## Next Steps\n${json.nextSteps || 'None provided.'}\n\n` +
    `## Files Updated\n${(json.patches || []).map((patch) => `- ${patch.path}`).join('\n') || 'None'}\n`;

  writeFile(path.join(outboxDir, 'ai-studio-report.md'), reportContent);

  let appliedFiles = [];
  try {
    appliedFiles = applyPatches(json.patches || []);
  } catch (err) {
    console.error('❌ Failed to apply patches:', err.message);
    process.exit(1);
  }

  if (appliedFiles.length > 0) {
    console.log(`✅ Applied updates to ${appliedFiles.length} file(s):`, appliedFiles.join(', '));
  } else {
    console.log('ℹ️ No file patches were applied. Review .ai/outbox/ai-studio-response.txt and .ai/outbox/ai-studio-report.md');
  }

  console.log('▶ Phase 4: Rebuilding after applied fixes...');
  const rebuildResult = runCommand('npm run build');
  const rebuildLog = `${rebuildResult.stdout || ''}\n${rebuildResult.stderr || ''}`.trim();
  writeFile(path.join(inboxDir, 'terminal-errors-after-fix.md'), rebuildLog);

  const finalReport = reportContent + `\n## Rebuild status\n- Code: ${rebuildResult.code}\n- Rebuild errors captured: ${rebuildLog ? 'YES' : 'NO'}\n`;
  writeFile(path.join(outboxDir, 'ai-studio-report.md'), finalReport);

  if (rebuildResult.code === 0) {
    console.log('✅ Studio rebuild succeeded after applying AI fixes.');
  } else {
    console.warn('⚠️ Studio rebuild still has errors. Check .ai/inbox/terminal-errors-after-fix.md');
  }
};

main().catch((err) => {
  console.error('❌ ai_studio failed:', err.message || err);
  process.exit(1);
});
