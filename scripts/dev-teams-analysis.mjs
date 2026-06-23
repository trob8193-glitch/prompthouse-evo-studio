import fs from 'fs';

const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('No OPENAI_API_KEY'); process.exit(1); }

const prompt = `
The user of 'PromptHouse Evo Studio' has asked: 'WITH OUR AGENTS, KEYS AND ALL AI MODELS TELL ME THE TYPE OD DEV TEAMS EACH CREATE FOR MY STUDIO. HOW, WHY AND WHAT THEY WOULD DO'

Background on the Studio:
- We have Local Intelligence (Ollama, local vector DB, Llama3/Qwen) running autonomously in Sovereign Mode.
- We have Cloud Intelligence (OpenAI API, Gemini Pro) for heavy lifting, fine-tuning, and orchestration.
- We have specialized internal agents/daemons: Evolution Daemon (self-improving code), Self-Invention Daemon (proposing new apps), Platform Sentinel (security/health), Truth Kernel (verifying output).

As my elite AI architecture teammate, construct a detailed and visionary breakdown of the 'Dev Teams' we can create by combining these models and keys. For each team, explain:
1. HOW it is created (which models/agents are used).
2. WHY it is needed in the studio.
3. WHAT they would actually do on a daily basis.

Structure it beautifully with these Dev Teams:
1. The 'Black Ops' Innovation Team
2. The 'Core Infrastructure & Security' Team
3. The 'Autonomous QA & Verification' Team
4. The 'Product & Marketplace' Team
`;

fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are the Elite AI Architecture teammate.' }, 
      { role: 'user', content: prompt }
    ]
  })
}).then(res => res.json()).then(data => {
  if(data.error) throw new Error(data.error.message);
  fs.writeFileSync('dev-teams-analysis.md', data.choices[0].message.content, 'utf8');
  console.log('Analysis written to dev-teams-analysis.md');
}).catch(console.error);
