import fs from 'fs';
import path from 'path';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import dotenv from 'dotenv';
dotenv.config();

async function runAIReview() {
  console.log('[AI Review] Initiating autonomous code review sequence...');
  
  const userKey = process.env.OPENAI_API_KEY;
  const adaptor = new UniversalAIAdaptor({ openai: userKey });
  
  const contextPath = path.resolve(process.cwd(), '.prompthouse-data/master-context.txt');
  if (!fs.existsSync(contextPath)) {
    console.error('FATAL: Master context not found. Run ai_context_pack.mjs first.');
    process.exit(1);
  }

  let codeContext = fs.readFileSync(contextPath, 'utf8');
  // Truncate to avoid blowing up token limits
  if (codeContext.length > 50000) {
    codeContext = codeContext.slice(0, 50000) + '\n... [TRUNCATED]';
  }

  try {
    const response = await adaptor.generateResponse([
      { role: 'user', content: `Perform a brutal, senior-level code review of the following architecture. Point out architectural flaws, performance bottlenecks, and truth-state violations.\n\nCode:\n${codeContext}` }
    ], "You are Evo's senior architectural auditor.", { provider: 'openai', model: 'gpt-4o' });

    if (response.success) {
      const outPath = path.resolve(process.cwd(), '.prompthouse-data/latest-ai-review.md');
      fs.writeFileSync(outPath, response.message, 'utf8');
      console.log(`[AI Review] SUCCESS: Review generated and saved to ${outPath}`);
    } else {
      console.error('[AI Review] Failed to generate review:', response.message);
    }
  } catch (e) {
    console.error(`[AI Review] Exception during review: ${e.message}`);
  }
}

runAIReview().catch(console.error);