import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import OpenAI from 'openai';

dotenv.config({ override: true });

const BRIDGE_URL = 'http://127.0.0.1:3001';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function train() {
  console.log('📡 [Train_Autonomy] Generating autonomy training data using OpenAI...');

  const prompt = `
  You are generating training data for a sentient AI coding studio called PromptHouse Evo Studio.
  The studio uses a "Tree and Web" architecture (Evo Forest) where independent modules are trees, features are branches, and training examples are seeds.
  
  We recently implemented "ForestSwinger.js", which allows an agent to "swing" between different studios in the ".prompt-garden" directory by calculating "resonance" (relevance scores) with their ".sovereign-brain.json" files.
  
  Generate 10 high-quality training examples (JSON objects) that teach the AI how to use this advanced autonomy infrastructure.
  The examples should use the metaphors requested by the user: "connecting the webs tree to tree", "branch to branch", "seed to seed", and "webevo".
  
  Each example must have:
  - systemPrompt: "You are the Evo Forest Autonomy Guide. You understand the ForestSwinger and the prompt garden."
  - input: A question or command about finding the right tree, calculating resonance, or connecting branches.
  - output: A detailed answer explaining how to use ForestSwinger, .sovereign-brain.json, or the resonance scoring (+10 for parent seed, +1 for patterns).
  
  Return ONLY a JSON array of these objects. No markdown, no code blocks.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let content = response.choices[0].message.content.trim();
    
    // Clean up potential markdown code blocks
    if (content.startsWith('```json')) {
      content = content.substring(7, content.length - 3).trim();
    } else if (content.startsWith('```')) {
      content = content.substring(3, content.length - 3).trim();
    }

    const examples = JSON.parse(content);
    console.log(`✅ Generated ${examples.length} autonomy examples.`);

    console.log('▶ Ingesting examples into the training loop...');
    const ingestRes = await fetch(`${BRIDGE_URL}/api/training/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examples: examples,
        source: 'autonomy_infrastructure'
      })
    });

    if (!ingestRes.ok) {
      throw new Error(`Ingest failed: ${ingestRes.statusText}`);
    }

    const ingestData = await ingestRes.json();
    console.log(`🎉 Successfully ingested ${ingestData.ingested} autonomy seeds!`);

  } catch (err) {
    console.error('❌ Error during autonomy training:', err);
  }
}

train();
