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

  console.log(`📡 [Train] Requesting high-density Creative Autonomy knowledge from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio. 
The user wants to train the studio on "creative autonomy, design, creativity, and uniqueness for each user (including the user 'Noname' in this session)".
Generate a massive, high-density, production-grade guide covering:
1. **Creative Autonomy**: How the studio should interpret high-level, abstract creative prompts (like "make it magical" or "cyberpunk vibe") and translate them into specific UI components, color palettes, and animations without asking for clarification.
2. **Design & Creativity**: Principles of non-generic, premium design. How to avoid the "bootstrap look." Using asymmetry, custom shapes (like SVGs generated on the fly), and micro-interactions to create a memorable experience.
3. **Uniqueness & Personalization**: How to profile the user (or the current session context) to deliver a unique design every time. How to ensure that work generated for "User A" looks completely different from "User B", tailored to their brand or personality.
4. **Autonomous Execution of Art**: The pipeline from Creative Prompt -> Mood Board (color/style selection) -> Code Generation -> Visual Audit (checking if it looks good) -> Refinement.

Format the output as a clean Markdown file with a professional, sovereign tone.
Include code snippets or system prompt templates where relevant.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master creative director and generative AI artist.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5, // Slightly higher temperature for creativity
      max_tokens: 4000 // Large response
    });

    const content = response.choices[0].message.content;
    const outputPath = path.join(root, 'docs/knowledge/creative_autonomy.md');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ [Train] Knowledge file created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Train] Error:', err.message);
  }
}

train();
