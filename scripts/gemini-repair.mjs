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

async function callGemini(prompt, code) {
  const env = loadEnv();
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'No GEMINI_API_KEY found' };
  }

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const systemInstruction = `You are a senior software engineer performing code repair. 
You will receive a file's source code and an issue description.
Return ONLY the complete fixed file content — no explanation, no markdown fences, no commentary.
Rules:
- Keep all existing imports and structure intact
- Only fix the specific issue described
- Never add console.log, TODO, FIXME, or placeholder comments
- Write real production logic`;

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: `Issue: ${prompt}\n\nFile content:\n${code}` }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { success: false, error: 'Empty response from Gemini' };
    }

    // Strip markdown code fences if present
    let cleaned = text;
    const fenceMatch = cleaned.match(/```(?:javascript|js|jsx|mjs|cjs)?\n([\s\S]*?)```/);
    if (fenceMatch) {
      cleaned = fenceMatch[1];
    }

    return { success: true, content: cleaned.trim() };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function repairFile(filePath, issueDescription) {
  const relPath = path.relative(rootDir, filePath);
  const originalContent = fs.readFileSync(filePath, 'utf-8');

  process.stdout.write(`\x1b[33m[REPAIR] Sending ${relPath} to Gemini for AI repair...\x1b[0m\n`);
  process.stdout.write(`\x1b[33m[REPAIR] Issue: ${issueDescription}\x1b[0m\n`);

  const result = await callGemini(issueDescription, originalContent);

  if (!result.success) {
    process.stdout.write(`\x1b[33m[REPAIR] Gemini failed: ${result.error}. Trying OpenAI...\x1b[0m\n`);
    
    // Fallback: OpenAI GPT-4o
    const env = loadEnv();
    const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const systemInstruction = `You are a senior software engineer performing code repair.
Return ONLY the complete fixed file content — no explanation, no markdown fences, no commentary.
Keep all existing imports and structure intact. Only fix the specific issue described.
Never add console.log, TODO, FIXME, or placeholder comments. Write real production logic.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: `Issue: ${issueDescription}\n\nFile content:\n${originalContent}` },
            ],
            temperature: 0.1,
            max_tokens: 8192,
          }),
        });
        const data = await response.json();
        if (!data.error && data.choices?.[0]?.message?.content) {
          let cleaned = data.choices[0].message.content;
          const fenceMatch = cleaned.match(/```(?:javascript|js|jsx|mjs|cjs)?\n([\s\S]*?)```/);
          if (fenceMatch) cleaned = fenceMatch[1];
          result = { success: true, content: cleaned.trim() };
          process.stdout.write(`\x1b[32m[REPAIR] OpenAI repair succeeded.\x1b[0m\n`);
        } else {
          throw new Error(data.error?.message || 'Empty OpenAI response');
        }
      } catch (oe) {
        process.stdout.write(`\x1b[31m[REPAIR] OpenAI also failed: ${oe.message}\x1b[0m\n`);
        return { success: false, error: `All providers failed. Gemini: ${result.error}. OpenAI: ${oe.message}` };
      }
    } else {
      return { success: false, error: result.error };
    }
  }

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
