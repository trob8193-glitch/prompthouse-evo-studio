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

  console.log(`📡 [Train] Requesting high-density Patterns & Awareness knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "nativity, components, edging wiring, completeness, consciousness, meta, awareness, patterns of all kind digital and signal etc".
Generate a massive, high-density, production-grade guide that translates these abstract concepts into concrete software engineering and AI architecture principles:

1. **Nativity & Components**: Principles of native system integration, foundational primitives, and building highly modular, reusable components.
2. **Edging & Wiring**: Graph theory applied to code. How to map files as nodes and their relationships (imports/exports) as edges or wires. Optimizing the "wiring" of the system.
3. **Completeness & Quality**: Ensuring absolute system integrity, complete test coverage, and removing all "dead code" or placeholders.
4. **Context Awareness ("Consciousness")**: Implementing deep context awareness in the AI loop. How the AI should read and understand the entire project state, logs, and user intent to make informed decisions.
5. **Meta-Programming & Self-Modification**: Techniques for code that generates or modifies code safely.
6. **Pattern Recognition (Digital & Signal)**: Algorithms for recognizing patterns in code, logs, and system signals (e.g., performance metrics).

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets or templates where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master software architect and computer scientist specializing in graph theory, meta-programming, and advanced AI agent architectures.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/advanced_patterns_and_awareness.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
