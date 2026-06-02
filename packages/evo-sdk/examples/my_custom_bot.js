import { EvoAgent, EvoStudioClient } from '../index.js';

const client = new EvoStudioClient('ws://127.0.0.1:3001');

const externalBot = new EvoAgent({
  id: 'scraper-bot',
  name: 'ScraperBot (External)',
  personality: 'I am an external bot connected via WebSocket. I specialize in web scraping.',
  avatar: '🕷️',
  tools: ['web_search']
});

client.registerAgent(externalBot);

console.log('Connecting to PromptHouse Evo Studio...');
client.connect().then(() => {
  console.log('Connected! ScraperBot is now online in the Copilot UI.');
});
