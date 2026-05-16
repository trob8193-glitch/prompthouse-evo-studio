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

  console.log(`📡 [Train] Requesting visionary possibilities from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio.
We have just trained the studio on several advanced concepts:
1. Advanced Self-Evolution & Automation.
2. Patterns, Awareness, and Graph Edges.
3. Autonomous Code Generation & Multi-Language Mastery (Python, Java, C++).
4. Base 44, Lovable, Replit, and Self-Invention.
5. LLM Pipelines & Inferred Infrastructure.

Generate a visionary, high-density guide exploring **What is possible** with these new capabilities combined. 
- How can the studio use these tools to build a self-sustaining ecosystem?
- How can it invent new tools for itself?
- What is the ultimate endgame for a studio with these capabilities?

Keep it concise, deep, and written in a professional, sovereign tone.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master software architect and AI futurist.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 2000 // Medium response to keep it within $1
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/future_possibilities.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
