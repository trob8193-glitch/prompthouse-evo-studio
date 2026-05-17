import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ override: true });

const BRIDGE_URL = 'http://127.0.0.1:3001';

async function ingest() {
  const root = process.cwd();
  const promptbasePath = path.join(root, '.prompthouse-data', 'promptbase.json');

  if (!fs.existsSync(promptbasePath)) {
    console.log('❌ promptbase.json missing.');
    process.exit(1);
  }

  console.log('📂 Reading promptbase.json...');
  const promptbase = JSON.parse(fs.readFileSync(promptbasePath, 'utf8'));
  console.log(`📊 Found ${promptbase.length} items in promptbase.`);

  const examples = [];

  for (const item of promptbase) {
    const title = item.title || item.id;
    const content = item.content || item.body;

    if (!content) continue;

    // Create a training example mapping the title/intent to the content
    examples.push({
      systemPrompt: "You are the PromptHouse archive assistant. You know all the classic prompts and roles.",
      input: `What is the prompt for "${title}" and how do I use it?`,
      output: `Here is the prompt content for "${title}":\n\n${content}`
    });
  }

  console.log(`✅ Prepared ${examples.length} training examples.`);

  // Ingest in batches of 5 to avoid large payload issues
  const batchSize = 5;
  let ingestedCount = 0;

  for (let i = 0; i < examples.length; i += batchSize) {
    const batch = examples.slice(i, i + batchSize);
    console.log(`▶ Ingesting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(examples.length / batchSize)}...`);

    try {
      const ingestRes = await fetch(`${BRIDGE_URL}/api/training/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples: batch,
          source: 'promptbase_import'
        })
      });

      if (!ingestRes.ok) {
        console.error(`❌ Batch failed: ${ingestRes.statusText}`);
        continue;
      }

      const ingestData = await ingestRes.json();
      ingestedCount += ingestData.ingested;

    } catch (err) {
      console.error('❌ Error during ingest:', err.message);
    }
  }

  console.log(`\n🎉 Successfully plugged ${ingestedCount} prompts from promptbase into the automated training loop!`);
}

ingest();
