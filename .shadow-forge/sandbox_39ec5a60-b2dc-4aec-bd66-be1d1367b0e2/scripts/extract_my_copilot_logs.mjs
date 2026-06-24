import fs from 'fs';
import path from 'path';

const transcriptPath = 'C:/Users/Noname/.gemini/antigravity-ide/brain/806120f5-3a91-4afc-a62d-358e6f27363c/.system_generated/logs/transcript.jsonl';
const targetDir = '.prompthouse-data/evo-llm/dataset';
const targetPath = path.join(targetDir, 'train.jsonl');

try {
  const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  let currentPair = null;
  const dataset = [];

  for (const line of lines) {
      const step = JSON.parse(line);
      if (step.type === 'USER_INPUT' || step.source === 'USER_EXPLICIT') {
          if (!step.content) continue;
          currentPair = { input: String(step.content).trim() };
      } else if (step.source === 'MODEL' && step.content && currentPair) {
          currentPair.output = String(step.content).trim();
          dataset.push({
              messages: [
                  { role: "system", content: "You are the Omni-Sovereign IDE Model. You operate as an embedded multi-file composer and compiler." },
                  { role: "user", content: currentPair.input },
                  { role: "assistant", content: currentPair.output }
              ]
          });
          currentPair = null;
      }
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetPath, dataset.map(d => JSON.stringify(d)).join('\n'));
  console.log(`Saved ${dataset.length} training examples to ${targetPath}`);
} catch (e) {
  console.error("Error reading transcript:", e);
}
