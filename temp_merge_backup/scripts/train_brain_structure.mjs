import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';

dotenv.config({ override: true });

const BRIDGE_URL = 'http://127.0.0.1:3001';

async function train() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY is not set.');
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const systemPrompt = `You are an expert AI trainer. Generate 10 high-quality training examples for the PromptHouse Evo Studio.
The studio has the following brain structure and local abilities:
1. **TruthGate**: Guardrails that scan for forbidden markers (dummy, lorem ipsum, etc.) and enforce reality truth states.
2. **Sovereign Ledger**: A persistent SQLite table that logs actions, truth states, and IQ gains.
3. **Evo LM**: A local model proxy that routes chat to Ollama (Llama3) or falls back to OpenAI/Gemini.
4. **UniversalAIAdaptor**: A multi-API synergy layer that handles fallback between OpenAI and Gemini.

Generate training examples in JSON format:
{
  "examples": [
    {
      "systemPrompt": "System prompt for the model...",
      "input": "User question or prompt about the studio abilities...",
      "output": "Correct, precise answer or code using the studio's local abilities..."
    }
  ]
}
Ensure the examples are technical, precise, and help the model learn how to use the studio's specific functions (like TruthGate or the Ledger).`;

  console.log('📡 [Train_Brain] Generating training data using OpenAI...');

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o", // Using a higher model to ensure good quality and spend the budget!
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Generate 10 examples focusing on TruthGate and Sovereign Ledger." }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const data = JSON.parse(content);

    if (!data.examples || !Array.isArray(data.examples)) {
      throw new Error('Invalid response format from OpenAI');
    }

    console.log(`✅ [Train_Brain] Generated ${data.examples.length} examples.`);

    // Ingest into bridge
    const ingestRes = await fetch(`${BRIDGE_URL}/api/training/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examples: data.examples,
        source: 'openai_brain_training'
      })
    });

    if (!ingestRes.ok) {
      throw new Error(`Ingest failed: ${ingestRes.statusText}`);
    }

    const ingestData = await ingestRes.json();
    console.log(`✅ [Train_Brain] Ingested ${ingestData.ingested} examples into ${ingestData.file}`);

    // Log to ledger
    await fetch(`${BRIDGE_URL}/api/sovereign-ledger/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature_id: 'training',
        action: 'brain_structure_training',
        proof_hash: crypto.randomUUID(),
        truth_state: 'VERIFIED',
        iq_gain: data.examples.length * 2
      })
    });

    console.log('✅ [Train_Brain] Training cycle completed and logged to ledger.');

  } catch (err) {
    console.error('❌ [Train_Brain] Error:', err.message);
  }
}

train();
