import fetch from 'node-fetch';
import { EVO_DEV_TEAM } from '../bot-characters.js';

export default class {
  async execute(args, session) {
    if (!args || args.length === 0) {
      return { 
        success: false, 
        output: 'Usage: /bot <name> <prompt>\nAvailable bots: ' + EVO_DEV_TEAM.map(b => b.name.toLowerCase()).join(', ')
      };
    }

    const botName = args[0].toUpperCase();
    const prompt = args.slice(1).join(' ');

    const bot = EVO_DEV_TEAM.find(b => b.name === botName);
    
    if (!bot) {
      return { 
        success: false, 
        output: `Bot '${botName}' not found in the 21-member Evo Dev Team. Try: LION, PANTHER, OWL, etc.` 
      };
    }

    if (!prompt) {
      return {
        success: false,
        output: `${bot.name} is standing by. What is your request?`
      };
    }

    const systemPrompt = `You are ${bot.name}, the ${bot.role} specializing in ${bot.specialty}. You are a bio-mechanical sentient agent in gold-and-green cybernetic armor. Respond concisely and professionally in character.`;

    try {
      const BRIDGE_URL = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';
      const res = await fetch(`${BRIDGE_URL}/api/evo-eyes/team-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: prompt,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          includeProviders: ['evo_lm', 'openai', 'gemini']
        })
      });

      if (!res.ok) {
        throw new Error(`Bridge returned ${res.statusText}`);
      }

      const data = await res.json();
      // Try to get synthesis message, fallback to first provider output
      const outputText = data.synthesis?.message || 
                         data.providerOutputs?.[0]?.content || 
                         'No response generated.';

      return {
        success: true,
        output: `[${bot.name}] ${outputText}`
      };
    } catch (e) {
      return {
        success: false,
        output: `[${bot.name} ERROR] Failed to connect to intelligence bridge: ${e.message}`
      };
    }
  }
}
