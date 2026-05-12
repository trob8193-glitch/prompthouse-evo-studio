import { universalSend } from '../src/lib/universal-transport.js';
import { StressTester } from '../src/core/autonomy/StressTester.js';

const tester = new StressTester();

/**
 * THE SOVEREIGN DUEL: GEMINI VS OPENAI
 * ═══════════════════════════════════════════════════════════════
 * Two models enter. One truth emerges.
 */
async function runDuel() {
  const intent = "Synthesize a high-density Sovereign Dashboard Component in React with Glassmorphism and Nuclear Rate Limiting hooks.";

  console.log(`⚔️ [Duel] Dispatching Intent to Gemini Pro 1.5...`);
  const geminiResult = await universalSend([{ role: 'user', content: intent }], "You are Antigravity.", { provider: 'gemini' });

  console.log(`⚔️ [Duel] Dispatching Intent to GPT-4o...`);
  const openaiResult = await universalSend([{ role: 'user', content: intent }], "You are Antigravity.", { provider: 'openai' });

  // 1. Audit Gemini
  console.log(`📊 [Duel] Auditing Gemini Synthesis...`);
  const geminiScore = await tester.auditEvolutionVariant(geminiResult, 'Dashboard');

  // 2. Audit OpenAI
  console.log(`📊 [Duel] Auditing OpenAI Synthesis...`);
  const openaiScore = await tester.auditEvolutionVariant(openaiResult, 'Dashboard');

  console.log(`\n🏆 [Duel] WINNER: ${geminiScore.score > openaiScore.score ? 'GEMINI' : 'OPENAI'}`);
  console.log(`   - Gemini Score: ${geminiScore.score}`);
  console.log(`   - OpenAI Score: ${openaiScore.score}`);
}

runDuel();
