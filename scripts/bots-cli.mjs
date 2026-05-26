import 'dotenv/config';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { EVO_DEV_TEAM } from '../src/bot-characters.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node bots-cli.mjs <bot_name> <message...>');
    process.exit(1);
  }

  const botName = args[0].toLowerCase();
  const message = args.slice(1).join(' ');

  const botObj = EVO_DEV_TEAM.find(b => b.name.toLowerCase() === botName);
  
  if (!botObj) {
    console.log(`Bot '${botName}' not found in the 21-member roster.`);
    process.exit(1);
  }

  console.log(`\n🤖 [${botObj.name}] ${botObj.role.toUpperCase()} ───`);
  console.log(`Thinking...\n`);

  const ai = new UniversalAIAdaptor({
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY
  });

  const systemPrompt = `You are ${botObj.name}, ${botObj.role}. Specialty: ${botObj.specialty}\nTask: ${message}`;
  
  try {
    const response = await ai.chat([{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]);
    const output = response.content || response.error || 'Unknown response format';
    console.log(`\n💬 Response:\n${output}\n`);
  } catch (err) {
    console.error(`\n❌ Error communicating with LLM for ${botName}:`, err.message);
  }
}

main();
