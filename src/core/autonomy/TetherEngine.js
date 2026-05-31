import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { evaluateCostedRequest } from '../gateway/costFirewallV2.js';
import { getSemanticCacheKey, getSemanticCacheEntry, setSemanticCacheEntry } from '../gateway/semanticCache.js';
import { routeTask, reportRateLimit } from '../quadbrain/QuadBrainModelRouter.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

dotenv.config({ path: path.join(rootDir, '.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const localOpenai = new OpenAI({
  baseURL: process.env.LOCAL_AI_URL || "http://127.0.0.1:11434/v1",
  apiKey: "local-no-key", // Not required for local models
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class TetherEngine {
  static async executeMission(taskDescription, botName, botRole, contextData = "", preferredBrain = "openai") {
    let finalText = "";
    try {
      const prompt = `You are a TriBrain Autonomous Daemon.
Identity: ${botName}
Role: ${botRole}

Mission: ${taskDescription}

Context/Data provided:
${contextData}

AUTONOMOUS EXECUTION CAPABILITIES:
You have physical write-access to the local machine. To fix code or run tests, you MUST output the exact syntax below.
1. To write or update a file, output exactly:
[FILE_UPDATE path="absolute/or/relative/path/to/file.js"]
<your new file contents here>
[/FILE_UPDATE]

2. To execute a terminal command, output exactly:
[EXECUTE_COMMAND] npm run test [/EXECUTE_COMMAND]

Execute your mission, fix the codebase using the tags above, and provide a concise summary.`;

      // 1. Check Semantic Cache
      const cacheKey = getSemanticCacheKey({
        endpoint: 'tether-engine',
        taskType: 'autonomous-mission',
        normalizedInput: prompt
      });
      
      const cached = getSemanticCacheEntry({ rootDir, key: cacheKey });
      if (cached) {
        console.log(`\x1b[32m✅ [TETHER-ENGINE] SEMANTIC CACHE HIT! 100% tokens saved.\x1b[0m`);
        return cached.value;
      }

      // 2. Evaluate Cost Firewall V2
      const firewall = evaluateCostedRequest({
        rootDir,
        endpoint: 'tether-engine',
        taskType: 'autonomous-mission',
        messages: [{ role: "system", content: prompt }],
        expectedOutputTokens: 8000,
        providerAllowed: preferredBrain
      });

      if (!firewall.allowed) {
        const reason = firewall.blockedReasons.join(' | ');
        console.log(`\x1b[31m🛑 [TETHER-ENGINE] FIREWALL BLOCKED MISSION! Reason: ${reason}\x1b[0m`);
        return `[BLOCKED BY FIREWALL] ${reason}`;
      }

      // 3. Dynamic Model Routing via QuadBrainModelRouter
      const route = routeTask(taskDescription, preferredBrain);
      console.log(`🧠 [TETHER-ENGINE] Firewall approved! Routing to ${route.provider.toUpperCase()} / ${route.model}...`);

      if (route.provider === 'offline') {
        return `[OFFLINE] No AI providers available. Task "${taskDescription}" queued for retry when a provider comes online.`;
      }

      if (route.provider === 'local') {
        console.log(`🔌 [TETHER-ENGINE] Executing 100% OFFLINE on Local Engine...`);
        try {
          const completion = await localOpenai.chat.completions.create({
            model: route.model,
            messages: [{ role: "system", content: prompt }],
          });
          finalText = completion.choices[0].message.content;
        } catch (localErr) {
          console.log(`⚠️ [TETHER-ENGINE] Local engine unavailable (${localErr.message}). Generating offline analysis...`);
          finalText = `[OFFLINE ANALYSIS] Local engine is not running. Task "${taskDescription}" queued for next available brain cycle.`;
        }
      } else if (route.provider === 'gemini') {
        try {
          const model = genAI.getGenerativeModel({ model: route.model });
          const result = await model.generateContent(prompt);
          finalText = result.response.text();
        } catch (geminiErr) {
          if (/429|quota|rate/i.test(geminiErr.message)) reportRateLimit('gemini', 90);
          console.log(`⚠️ [TETHER-ENGINE] Gemini failed (${geminiErr.message}). Falling back via router...`);
          // Retry with router excluding gemini
          try {
            const completion = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
              messages: [{ role: "system", content: prompt }],
            });
            finalText = completion.choices[0].message.content;
          } catch (openaiErr) {
            if (/429|quota|rate/i.test(openaiErr.message)) reportRateLimit('openai', 90);
            finalText = `[FALLBACK] All cloud brains rate-limited. Task "${taskDescription}" logged for retry.`;
          }
        }
      } else if (route.provider === 'openai') {
        try {
          const completion = await openai.chat.completions.create({
            model: route.model,
            messages: [{ role: "system", content: prompt }],
          });
          finalText = completion.choices[0].message.content;
        } catch (openaiErr) {
          if (/429|quota|rate/i.test(openaiErr.message)) reportRateLimit('openai', 90);
          console.log(`⚠️ [TETHER-ENGINE] OpenAI failed (${openaiErr.message}). Falling back to Gemini...`);
          try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            finalText = result.response.text();
          } catch (geminiFallbackErr) {
            if (/429|quota|rate/i.test(geminiFallbackErr.message)) reportRateLimit('gemini', 90);
            finalText = `[FALLBACK] All cloud brains unavailable. Task "${taskDescription}" logged for retry.`;
          }
        }
      } else {
        finalText = `[UNROUTED] Unknown provider: ${route.provider}. Task logged.`;
      }

      // 3. Autonomous Execution Parser
      try {
        const fileRegex = /\[FILE_UPDATE path="([^"]+)"\]([\s\S]*?)\[\/FILE_UPDATE\]/g;
        let match;
        let filesUpdated = 0;
        while ((match = fileRegex.exec(finalText)) !== null) {
          const filePath = path.resolve(rootDir, match[1]);
          const content = match[2].trim();
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`\x1b[35m[TETHER-ENGINE: EXECUTION]\x1b[0m Automatically rewrote file: ${filePath}`);
          filesUpdated++;
        }

        const cmdRegex = /\[EXECUTE_COMMAND\]([\s\S]*?)\[\/EXECUTE_COMMAND\]/g;
        let cmdMatch;
        while ((cmdMatch = cmdRegex.exec(finalText)) !== null) {
          const cmd = cmdMatch[1].trim();
          console.log(`\x1b[35m[TETHER-ENGINE: EXECUTION]\x1b[0m Automatically running command: ${cmd}`);
          execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
        }
      } catch (execErr) {
        console.error(`\x1b[31m[TETHER-ENGINE: EXECUTION ERROR]\x1b[0m Failed to parse or apply autonomous payload:`, execErr.message);
      }

      // 4. Save to Cache
      setSemanticCacheEntry({ rootDir, key: cacheKey, value: finalText });
      return finalText;
    } catch (error) {
      console.error(`❌ [TetherEngine] Failed to execute mission for ${botName}:`, error.message);
      return `[ERROR] AI Execution Failed: ${error.message}`;
    }
  }
}
