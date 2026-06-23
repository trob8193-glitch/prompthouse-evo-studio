import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { evaluateCostedRequest } from '../src/core/gateway/index.js';

dotenv.config({ override: true });
dotenv.config({ path: '.env.agent', override: true });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bots = [
  { id: 'evo', role: 'Lead orchestrator, highly regal, intricate lion mane made of cyber-cables' },
  { id: 'dev', role: 'Software engineer, neural interface cables, glowing data streams' },
  { id: 'builder', role: 'Architect, heavy-duty metallic plating, scaffolding-like armor' },
  { id: 'verifier', role: 'Auditor, multiple glowing camera lenses, strict geometric faceplate' },
  { id: 'analyst', role: 'Data analyst, holographic visor, intricate data-processing nodes' },
  { id: 'strategist', role: 'Strategist, sleek corporate cyber-design, calculating and smooth' },
  { id: 'counsel', role: 'Legal advisor, symmetrical scales motif in the armor, stoic' },
  { id: 'artist', role: 'Creative artist, asymmetric expressive design, neon pink splashes' },
  { id: 'launcher', role: 'Deployment, aerodynamic rocket-like crest, built for speed' },
  { id: 'commerce', role: 'Commerce, vault-like armored faceplate, gold coin motifs' },
  { id: 'sentinel', role: 'Security guard, heavy shielded armor, menacing, deep violet and red glow' }
];

async function run() {
  console.log('Evaluating request through Cost Firewall...');
  const fw = evaluateCostedRequest({
    orgId: 'org_test',
    orgPlan: 'paid',
    endpoint: '/api/generate_images',
    taskType: 'image_generation',
    taskComplexity: 'advanced',
    providerAllowed: 'openai',
    messages: [{ role: 'user', content: 'Generate 11 bot headshots via gpt-image-2' }],
    expectedOutputTokens: 0
  });

  if (!fw.allowed) {
    console.error('Cost Firewall BLOCKED the request:', fw.reason);
    process.exit(1);
  }

  console.log('Cost Firewall ALLOWED request.');

  const outDir = path.join(process.cwd(), 'public', 'assets', 'bots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const bot of bots) {
    console.log(`Generating image for ${bot.id}...`);
    const prompt = `A highly detailed, cyberpunk-style mechanical bot headshot profile picture. ${bot.role}. The bot's face should have glowing elements that match neon cyan, violet, and dark obsidian metals. The pupils of the bot must be completely blank or hollow so a glow can be added later. Clean, modern, 100% solid flat black background (no background elements whatsoever). The bot design must incorporate motifs of a lion subtly into its metallic plating. High-tech, crisp vector-like edges.`;
    
    try {
      const response = await openai.images.generate({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });

      // The custom model automatically returns base64 in b64_json! No response_format needed.
      const b64 = response.data[0].b64_json;
      if (!b64) throw new Error("No b64_json received from API");

      const buffer = Buffer.from(b64, 'base64');
      fs.writeFileSync(path.join(outDir, `${bot.id}.png`), buffer);
      console.log(`Saved ${bot.id}.png`);
    } catch (err) {
      console.error(`Failed to generate for ${bot.id}:`, err.message);
    }
  }
}

run();
