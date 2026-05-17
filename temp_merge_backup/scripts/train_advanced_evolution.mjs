import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function train() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY missing in .env');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  console.log(`📡 [Train] Requesting high-density Advanced Evolution knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio "a lot more on its evolving and automation".
Generate a massive, high-density, production-grade guide covering:
1. **Advanced Self-Evolution**: Strategies for autonomous self-reflection, code refactoring, and logic compaction. How the studio should analyze its own codebase to find inefficiencies and rewrite itself to be better.
2. **Autonomous Automation**: Best practices for background daemons, state machines, and self-healing loops. How to ensure the studio can run 24/7 without deadlocks, infinite loops, or crashing during self-modification.
3. **Recursive Tool Building**: The concept of the AI building its own tools (like audit scripts, test suites, or visual processors) to help it work better.
4. **Measuring Intelligence (Sovereign Gain)**: How to quantify the growth of the system (e.g., line coverage, logic density, successful cycles) and use that data to drive the next evolution pass.

Format the output as a clean Markdown file with a professional, sovereign tone.
Include system prompt templates or architectural diagrams (in text/mermaid) where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master software architect specializing in self-adaptive systems and autonomous AI agents.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/advanced_evolution_and_automation.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
