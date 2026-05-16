import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config({ override: true });

const prompt = process.argv.slice(2).join(' ').trim();

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set. Add it to .env or export it in your shell.');
  process.exit(1);
}

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return chunks.join('').trim();
};

const buildPrompt = async () => {
  if (prompt) return prompt;
  if (process.stdin.isTTY) {
    console.error('Usage: npm run ai:dev -- "Describe the code you want"');
    process.exit(1);
  }
  return await readStdin();
};

const main = async () => {
  const userPrompt = await buildPrompt();
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`📡 [AI_Dev] Prompting OpenAI with model ${model}`);
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful developer assistant. Answer clearly, include code examples, and only produce code when explicitly asked.'
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.2
  });

  const output = response.choices?.[0]?.message?.content || '';
  console.log('\n=== OPENAI RESPONSE ===\n');
  console.log(output);
};

main().catch((err) => {
  console.error('❌ ai:dev failed:', err.message || err);
  process.exit(1);
});
