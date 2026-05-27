import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════
//  GEMINI REPAIR ENGINE — Real AI-Powered Code Repair
//  Uses Gemini API (which is working) as primary, OpenAI as fallback.
//  Actually rewrites files on disk with AI-generated fixes.
// ═══════════════════════════════════════════════════════════════

// Load API key from .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const vars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.replace(/\r$/, '').match(/^([^#=]+)=(.*)$/);
      if (match) vars[match[1].trim()] = match[2].trim();
    }
  }
  return vars;
}

import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

export async function repairFile(filePath, issueDescription) {
  const relPath = path.relative(rootDir, filePath);
  const originalContent = fs.readFileSync(filePath, 'utf-8');

  process.stdout.write(`\\x1b[33m[REPAIR] Sending ${relPath} to Universal AI Adaptor for repair...\\x1b[0m\\n`);
  process.stdout.write(`\\x1b[33m[REPAIR] Issue: ${issueDescription}\\x1b[0m\\n`);

  const systemInstruction = `You are a senior software engineer performing code repair. 
You will receive a file's source code and an issue description.
Return ONLY the complete fixed file content — no explanation, no markdown fences, no commentary.
Rules:
- Keep all existing imports and structure intact
- Only fix the specific issue described
- Never add console.log, TODO, FIXME, or placeholder comments
- Write real production logic`;

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: `Issue: ${issueDescription}\\n\\nFile content:\\n${originalContent}` }
  ];

  const env = loadEnv();
  const adaptor = new UniversalAIAdaptor({
    openai: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
    gemini: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
  });

  const aiResult = await adaptor.chat(messages, { model: 'gemini-2.0-flash' });

  if (!aiResult.success) {
    process.stdout.write(`\\x1b[31m[REPAIR] All repair AI providers failed: ${aiResult.error}\\x1b[0m\\n`);
    return { success: false, error: aiResult.error };
  }

  let cleaned = aiResult.content;
  const fenceMatch = cleaned.match(/```(?:javascript|js|jsx|mjs|cjs|ts)?\\n([\\s\\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1];
  }
  
  const result = { success: true, content: cleaned.trim() };

  // Sanity check — AI output should be at least 50% the size of original
  if (result.content.length < originalContent.length * 0.5) {
    process.stdout.write(`\x1b[31m[REPAIR] AI output too short (${result.content.length} vs ${originalContent.length}). Rejecting to prevent data loss.\x1b[0m\n`);
    return { success: false, error: 'AI output suspiciously short — rejected' };
  }

  // Backup original
  const backupDir = path.join(rootDir, '.repair_backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupName = relPath.replace(/[\\/]/g, '_') + '.' + Date.now() + '.bak';
  fs.writeFileSync(path.join(backupDir, backupName), originalContent);

  // Write repaired content
  fs.writeFileSync(filePath, result.content, 'utf-8');

  process.stdout.write(`\x1b[32m[REPAIR] ✅ ${relPath} repaired and saved. Backup: .repair_backups/${backupName}\x1b[0m\n`);

  return {
    success: true,
    file: relPath,
    backup: backupName,
    originalLength: originalContent.length,
    repairedLength: result.content.length,
  };
}

// CLI entry
if (process.argv[1] && process.argv[1].endsWith('gemini-repair.mjs')) {
  const targetFile = process.argv[2];
  const issue = process.argv.slice(3).join(' ') || 'Fix all issues in this file';

  if (!targetFile) {
    process.stdout.write('Usage: node scripts/gemini-repair.mjs <file> <issue description>\n');
    process.exit(1);
  }

  const filePath = path.resolve(rootDir, targetFile);
  if (!fs.existsSync(filePath)) {
    process.stdout.write(`File not found: ${filePath}\n`);
    process.exit(1);
  }

  repairFile(filePath, issue).then((result) => {
    if (result.success) {
      process.stdout.write(`\nRepair complete. Original: ${result.originalLength} chars → Repaired: ${result.repairedLength} chars\n`);
    } else {
      process.stdout.write(`\nRepair failed: ${result.error}\n`);
    }
  });
}
