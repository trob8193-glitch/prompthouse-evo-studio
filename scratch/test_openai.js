import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function test() {
  try {
    const list = await client.models.list();
    console.log('✅ Key is VALID. Models found:', list.data.length);
  } catch (e) {
    console.error('❌ Key is INVALID:', e.message);
  }
}
test();
