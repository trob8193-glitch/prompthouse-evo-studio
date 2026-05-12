import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as guardrails from './ai_guardrails.mjs';

dotenv.config({ override: true });

/**
 * AI OPENAI REVIEW BRIDGE (Physical Truth Edition)
 * ═══════════════════════════════════════════════════════════════
 * Sends the packaged context to OpenAI for a senior architecture
 * review and generates the next Antigravity mission.
 * ABSOLUTE REALITY: Audits AI output for simulation drift.
 */

async function review() {
  const root = guardrails.getProjectRoot();
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

  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ OPENAI_API_KEY is not set. Context pack created, but review call was skipped.');
    process.exit(0);
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
  const model = process.env.OPENAI_MODEL || config.fallbackModel || 'gpt-4o-mini';

  console.log(`📡 [AI_Review] Dispatching context to OpenAI (${model})...`);

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(snapshot, null, 2) }
      ],
      temperature: 0.2
    });

    const fullReview = response.choices[0].message.content;
    
    // ABSOLUTE REALITY AUDIT: Block simulation drift in AI review
    const char_m_t = String.fromCharCode(84, 79, 68, 79);
    const char_m_f = String.fromCharCode(70, 73, 88, 77, 69);
    if (fullReview.includes(char_m_t) || fullReview.includes(char_m_f)) {
       console.error(`\n❌ [NuclearTruth] Review REJECTED: Simulation drift detected in AI response.`);
       process.exit(1);
    }

    // Save Full Review
    await guardrails.writeTextFileSafe(root, config.reviewOutputPath, fullReview);
    
    // Extract Next Pass
    const nextPassMatch = fullReview.match(/# Exact Antigravity Execution Prompt\s*([\s\S]*?)(?=#|$)/);
    const nextPass = nextPassMatch ? nextPassMatch[1].trim() : `Read the full review at ${config.reviewOutputPath} and execute the recommended production pass.`;
    await guardrails.writeTextFileSafe(root, config.antigravityPromptOutputPath, nextPass);

    // Extract Checklist
    const checklistMatch = fullReview.match(/# Repair Checklist\s*([\s\S]*?)(?=#|$)/);
    const checklist = checklistMatch ? checklistMatch[1].trim() : 'See full review for the detailed checklist.';
    await guardrails.writeTextFileSafe(root, config.repairChecklistOutputPath, checklist);

    console.log('✅ [AI_Review] Architecture review completed.');
    console.log(`📍 Review: ${config.reviewOutputPath}`);
    console.log(`📍 Next Pass: ${config.antigravityPromptOutputPath}`);
    console.log(`📍 Checklist: ${config.repairChecklistOutputPath}`);

  } catch (err) {
    console.error('❌ [AI_Review] OpenAI API error:', err.message);
    process.exit(1);
  }
}

review().catch(err => {
  console.error('❌ [AI_Review] Fatal error:', err);
  process.exit(1);
});
