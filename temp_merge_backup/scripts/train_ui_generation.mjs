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

  console.log(`📡 [Train] Requesting high-density UI/Image knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "everything possible regarding image generation, UI generation, and layout generation".
Generate a massive, high-density, production-grade guide covering:
1. **Image Generation**: Advanced prompting strategies, style consistency, controls (seeds, CFG), and handling common defects.
2. **UI Generation**: Component-driven design, state management, and semantic structure.
3. **Layout Generation**: Modern CSS (Grid, Flexbox), responsive design, and AI-assisted layout principles (how an AI should structure a layout).

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets and prompt templates where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master AI architect and UI/UX engineer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/ui_and_image_generation.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
