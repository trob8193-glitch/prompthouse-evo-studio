import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

async function generateSpatialMap() { throw new Error("Spatial mapper not available"); }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const vars = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.replace(/\r$/, '').match(/^([^#=]+)=(.*)$/);
      if (m) vars[m[1].trim()] = m[2].trim();
    }
  }
  return vars;
}

// ═══════════════════════════════════════════════════════════════
//  EVOLUTION DAEMON v2 — Real AI-Powered UI Evolution
//  Uses Gemini API directly (not broken OpenAI Assistants).
//  Reads spatial map JSON → asks AI for CSS/component improvements
//  → writes the improvements to disk.
// ═══════════════════════════════════════════════════════════════

async function callGeminiForEvolution(spatialData) {
  const env = loadEnv();
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    Log.error('\x1b[31m❌ No GEMINI_API_KEY found in .env\x1b[0m');
    return null;
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const systemPrompt = `You are a senior UI/UX engineer analyzing a spatial map of a React application.
The spatial map contains exact bounding rectangles of every UI element.
Your job: identify ONE specific, actionable CSS or React improvement.
Return ONLY a JSON object with this exact schema:
{
  "targetFile": "src/index.css or src/SomeComponent.jsx",
  "description": "What to improve and why",
  "cssRule": "selector { property: value; }" OR null,
  "componentChange": "description of React change" OR null
}
Rules: No markdown fences. No explanations outside the JSON. Only one change per response.
Focus on: spacing, alignment, contrast, visual hierarchy, micro-animations, premium feel.`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{
      role: 'user',
      parts: [{ text: `Spatial map data:\n${JSON.stringify(spatialData, null, 2).slice(0, 6000)}` }],
    }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    Log.error(`\x1b[33m⚠️ Gemini call failed: ${e.message}. Trying OpenAI...\x1b[0m`);
  }

  // Fallback: OpenAI GPT-4o
  const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Spatial map data:\n${JSON.stringify(spatialData, null, 2).slice(0, 6000)}` },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty OpenAI response');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in OpenAI response');
      return JSON.parse(jsonMatch[0]);
    } catch (oe) {
      Log.error(`\x1b[31m❌ OpenAI also failed: ${oe.message}\x1b[0m`);
    }
  }

  Log.error('\x1b[31m❌ All AI providers exhausted.\x1b[0m');
  return null;
}

function applyCssChange(suggestion) {
  if (!suggestion.cssRule) return false;

  const cssPath = path.join(rootDir, suggestion.targetFile || 'src/index.css');
  if (!fs.existsSync(cssPath)) {
    Log.info(`\x1b[33m⚠️ Target CSS file not found: ${cssPath}\x1b[0m`);
    return false;
  }

  const content = fs.readFileSync(cssPath, 'utf-8');
  const marker = `\n/* [EVO-DAEMON] ${suggestion.description} */\n${suggestion.cssRule}\n`;

  // Don't duplicate
  if (content.includes(suggestion.cssRule)) {
    Log.info('\x1b[33m⚠️ This CSS rule already exists. Skipping.\x1b[0m');
    return false;
  }

  fs.writeFileSync(cssPath, content + marker, 'utf-8');
  Log.info(`\x1b[32m✅ CSS applied to ${suggestion.targetFile}\x1b[0m`);
  return true;
}

async function runEvolution() {
  Log.info('\n\x1b[35m═══════════════════════════════════════════════════\x1b[0m');
  Log.info('\x1b[35m🧬 EVOLUTION DAEMON v2 — Real Gemini AI Evolution\x1b[0m');
  Log.info('\x1b[35m═══════════════════════════════════════════════════\x1b[0m\n');

  // Step 1: Generate spatial map
  Log.info('\x1b[36m[EVO] Step 1: Generating spatial map...\x1b[0m');
  let spatialData;
  try {
    spatialData = await generateSpatialMap();
  } catch (e) {
    Log.info(`\x1b[33m⚠️ Spatial map capture requires a browser. Using component file analysis instead.\x1b[0m`);
    
    // Fallback: analyze the actual component structure
    const srcPath = path.join(rootDir, 'src');
    const components = fs.readdirSync(srcPath)
      .filter(f => f.endsWith('.jsx'))
      .map(f => ({
        name: f,
        size: fs.statSync(path.join(srcPath, f)).size,
        hasStyles: fs.readFileSync(path.join(srcPath, f), 'utf-8').includes('style={{'),
      }));
    
    spatialData = {
      mode: 'file_analysis',
      components,
      totalComponents: components.length,
      timestamp: new Date().toISOString(),
    };
  }

  // Step 2: Send to Gemini for analysis
  Log.info('\x1b[36m[EVO] Step 2: Sending to Gemini AI for UI analysis...\x1b[0m');
  const suggestion = await callGeminiForEvolution(spatialData);

  if (!suggestion) {
    Log.info('\x1b[31m❌ No suggestion received. Evolution cycle complete with no changes.\x1b[0m');
    return { evolved: false };
  }

  Log.info(`\x1b[36m[EVO] Step 3: AI suggestion received:\x1b[0m`);
  Log.info(`   Target: ${suggestion.targetFile}`);
  Log.info(`   Change: ${suggestion.description}`);

  // Step 3: Apply if it's a CSS change
  let applied = false;
  if (suggestion.cssRule) {
    applied = applyCssChange(suggestion);
  } else if (suggestion.componentChange) {
    Log.info(`\x1b[33m[EVO] Component change suggested (requires manual review):\x1b[0m`);
    Log.info(`   ${suggestion.componentChange}`);
  }

  // Step 4: Log the evolution
  const logDir = path.join(rootDir, 'proof_receipts', 'evolution_logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const receipt = {
    timestamp: new Date().toISOString(),
    suggestion,
    applied,
    spatialMode: spatialData.mode || 'live_capture',
  };
  fs.writeFileSync(
    path.join(logDir, `evo_${Date.now()}.json`),
    JSON.stringify(receipt, null, 2)
  );

  Log.info(`\n\x1b[32m✅ Evolution cycle complete. Applied: ${applied}\x1b[0m`);
  Log.info(`📋 Receipt: proof_receipts/evolution_logs/evo_${Date.now()}.json`);

  return { evolved: applied, suggestion };
}

if (process.argv[1] && process.argv[1].endsWith('evolution-daemon.mjs')) {
  runEvolution();
}

export { runEvolution };
