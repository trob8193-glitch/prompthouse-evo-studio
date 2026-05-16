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

  console.log(`📡 [Train] Requesting high-density Visuals knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "everything used for TS visuals, layouts, buttons, graphics, etc and how to evolve them".
Note: "TS" likely refers to TypeScript or Tailwind CSS in this context of visuals and layouts. Cover both.
Generate a massive, high-density, production-grade guide covering:
1. **Visuals & Graphics**: Principles of premium UI design (Glassmorphism, vibrant gradients, dark modes, blur effects). How to create stunning first impressions.
2. **Components & Layouts**: Designing buttons, cards, grids, and navigation elements. Using TypeScript for prop safety and Tailwind CSS for rapid, maintainable styling.
3. **Micro-Animations**: Using Framer Motion or CSS transitions to make the interface feel alive and responsive.
4. **How to Evolve Them**: Principles of iterative UI evolution. How an AI should assess current UI code, identify low-fidelity areas, and generate upgrades (e.g., adding gradients, hover effects, or improving spacing) without breaking functionality.

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets and component templates where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master UI/UX designer and frontend engineer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/visuals_and_evolution.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
