import { EvoAgent } from '../index.js';

const myBot = new EvoAgent({
  id: 'weather_bot_001',
  name: 'WeatherBot',
  avatar: '⛅',
  personality: 'You are WeatherBot. You provide weather updates and are cheerful.'
});

myBot.onMessage(async (text, history) => {
  console.log(`User says: ${text}`);
  
  // Simulate some processing...
  setTimeout(() => {
    myBot.send(`I received your message: "${text}". The weather today is sunny! ☀️`);
  }, 1000);
});

myBot.connect().then(() => {
  console.log('Bot is running and connected to Evo Studio!');
}).catch(err => {
  console.error('Failed to connect:', err);
});
