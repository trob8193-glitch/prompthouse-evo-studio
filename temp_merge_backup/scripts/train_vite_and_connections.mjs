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

  console.log(`📡 [Train] Requesting high-density Vite/Connections knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "Vite, connections, APIs, and IDEs".
Generate a massive, high-density, production-grade guide covering:
1. **Vite**: Build optimizations, HMR (Hot Module Replacement) principles, plugin structures, and handling asset resolution in a sovereign studio.
2. **Connections**: Bridge server orchestration, WebSocket/HTTP communication patterns between the UI and the local filesystem, and maintaining state across disconnected sessions.
3. **APIs**: Secure key management (redaction), exponential backoff for rate limits, payload minimization, and fallback strategies (like the Local Heuristic Core we just built).
4. **Autonomous IDEs**: Principles of a self-evolving development environment—how an AI should read files, generate tests, apply fixes, and audit its own code safely without breaking the user's workspace.

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets and architecture diagrams (in text or mermaid if applicable) where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master AI architect and system engineer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/vite_and_connections.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
