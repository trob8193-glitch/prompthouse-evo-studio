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

  console.log(`📡 [Train] Requesting Phase 15 Blueprint from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio.
We have just trained the studio on several advanced concepts by creating these knowledge files:
1. \`autonomous_code_generation.md\` (Multi-language mastery, self-correction).
2. \`advanced_tools_and_self_invention.md\` (Base 44, Lovable, Replit emulation, self-invention loops).
3. \`advanced_pipelines_and_infrastructure.md\` (LLM pipelines, inferred infrastructure).
4. \`future_possibilities.md\` (Visionary ecosystem).

Generate a **Concrete Implementation Blueprint** for **Phase 15 (Sovereign Synthesis)**. 
- How do we turn these theories into actual code files and features in the studio?
- Propose at least 3 specific new files to create in the \`src/\` or \`scripts/\` directory and what code/logic goes in them.
- Focus on practical automation and self-invention.

Keep it dense, production-ready, and written in a professional, sovereign tone.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master software architect specializing in self-adaptive systems and autonomous AI agents.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2500 // Slightly larger response for $1.20
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/phase_15_blueprint.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
