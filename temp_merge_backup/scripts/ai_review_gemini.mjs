import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import * as guardrails from './ai_guardrails.mjs';

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function review() {
  const configPath = path.join(root, '.ai/config/bridge.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuration missing. Run npm run ai:pack first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const snapshotPath = path.join(root, config.outputSnapshotPath);
  const systemPromptPath = path.join(root, '.ai/prompts/reviewer-system.md');

  if (!fs.existsSync(snapshotPath)) {
    console.log('❌ Context pack missing. Run npm run ai:pack first.');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY is not set. Context pack created, but review call was skipped.');
    process.exit(0);
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
  const model = 'gemini-flash-latest';

  console.log(`📡 [AI_Review_Gemini] Dispatching context to Google Gemini (${model})...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `SYSTEM PROMPT:\n${systemPrompt}\n\nUSER CONTEXT (CODEBASE SNAPSHOT):\n${JSON.stringify(snapshot, null, 2)}`
      }]
    }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Unexpected response format from Gemini API');
    }

    const fullReview = data.candidates[0].content.parts[0].text;
    
    // Save Full Review
    guardrails.writeTextFileSafe(root, config.reviewOutputPath, fullReview);
    
    // Extract Next Pass
    const nextPassMatch = fullReview.match(/# Exact Antigravity Execution Prompt\s*([\s\S]*?)(?=#|$)/);
    const nextPass = nextPassMatch ? nextPassMatch[1].trim() : `Read the full review at ${config.reviewOutputPath} and execute the recommended production pass.`;
    guardrails.writeTextFileSafe(root, config.antigravityPromptOutputPath, nextPass);

    // Extract Checklist
    const checklistMatch = fullReview.match(/# Repair Checklist\s*([\s\S]*?)(?=#|$)/);
    const checklist = checklistMatch ? checklistMatch[1].trim() : 'See full review for the detailed checklist.';
    guardrails.writeTextFileSafe(root, config.repairChecklistOutputPath, checklist);

    console.log('✅ [AI_Review_Gemini] Architecture review completed via Gemini.');
    console.log(`📍 Review: ${config.reviewOutputPath}`);
    console.log(`📍 Next Pass: ${config.antigravityPromptOutputPath}`);
    console.log(`📍 Checklist: ${config.repairChecklistOutputPath}`);

  } catch (err) {
    console.error('❌ [AI_Review_Gemini] Fatal error:', err.message);
    process.exit(1);
  }
}

review().catch(err => {
  console.error('❌ [AI_Review_Gemini] Unhandled fatal error:', err);
  process.exit(1);
});
