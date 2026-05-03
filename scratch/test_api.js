import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const key = process.env.OPENAI_API_KEY || '';
    console.log(`Testing key: ${key.slice(0, 15)}...${key.slice(-4)} (Length: ${key.length})`);
    const response = await openai.models.list();
    console.log('API Key is VALID. Found', response.data.length, 'models.');
  } catch (error) {
    console.error('API Key is INVALID:', error.message);
  }
}

test();
