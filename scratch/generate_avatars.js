import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BOT_ROSTER = [
  { id: 'evo', name: 'Evo', species: 'Lion', role: 'Leader' },
  { id: 'dev', name: 'Dev', species: 'Panther', role: 'Architect' },
  { id: 'builder', name: 'Builder', species: 'Bear', role: 'Engineer' },
  { id: 'verifier', name: 'Verifier', species: 'Owl', role: 'Auditor' },
  { id: 'companion', name: 'Companion', species: 'Fox', role: 'Alliance' },
  { id: 'conductor', name: 'Conductor', species: 'Falcon', role: 'Orchestrator' },
  { id: 'boundary', name: 'Boundary', species: 'Rhino', role: 'Guardian' },
  { id: 'ledger', name: 'Ledger', species: 'Raven', role: 'Recorder' },
  { id: 'memory', name: 'Memory', species: 'Elephant', role: 'Librarian' },
  { id: 'heartbeat', name: 'Heartbeat', species: 'Cheetah', role: 'Momentum' },
  { id: 'sovereignty', name: 'Sovereignty', species: 'Tiger', role: 'Overseer' },
  { id: 'cipher_lynx', name: 'Cipher Lynx', species: 'Lynx', role: 'Security' },
  { id: 'vector_wolf', name: 'Vector Wolf', species: 'Wolf', role: 'Context' },
  { id: 'compiler_bearcat', name: 'Compiler Bearcat', species: 'Bearcat', role: 'Compiler' },
  { id: 'schema_beaver', name: 'Schema Beaver', species: 'Beaver', role: 'Contract' },
  { id: 'eval_mantis', name: 'Eval Mantis', species: 'Mantis', role: 'Evaluation' },
  { id: 'swarm_falcon', name: 'Swarm Falcon', species: 'Falcon', role: 'Swarm' },
  { id: 'blueprint_orca', name: 'Blueprint Orca', species: 'Orca', role: 'Blueprint' },
  { id: 'signal_foxhound', name: 'Signal Foxhound', species: 'Foxhound', role: 'Signal' },
  { id: 'temporal_raven', name: 'Temporal Raven', species: 'Raven', role: 'Foresight' },
  { id: 'forge_rhino', name: 'Forge Rhino', species: 'Rhino', role: 'Harden' },
];

async function generateAvatar(bot) {
  const prompt = `A professional futuristic robotic ${bot.species} portrait for a character named '${bot.name}'. Role: ${bot.role}. Detailed metallic plating with glowing ${bot.id === 'evo' ? 'gold' : 'cyan'} lights. Front-facing studio portrait. Pure black background. High-fidelity digital art.`;
  
  console.log(`Generating for ${bot.name}...`);
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const filePath = path.join('public', 'bots', `${bot.id}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved ${bot.name} to ${filePath}`);
  } catch (error) {
    console.error(`Error for ${bot.name}:`, error.message);
  }
}

async function run() {
  if (!fs.existsSync('public/bots')) {
    fs.mkdirSync('public/bots', { recursive: true });
  }

  for (const bot of BOT_ROSTER) {
    await generateAvatar(bot);
    // Wait a bit between calls to avoid rate limits if any
    await new Promise(r => setTimeout(r, 2000));
  }
}

run();
