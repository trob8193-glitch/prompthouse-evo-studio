import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ override: true });

const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('No OPENAI_API_KEY'); process.exit(1); }

const prompt = `
We are doing a deep architectural review of the 'prompthouse-evo-studio' project. 
The user asked: 'WHAT ELSE IN MY STUDIO DO YOU STRONGLY SUGGEST NEEDS TO BE FINISHED BUILDING, IMPLIMENTED, AUDITED, ROUTED, ROUTED ETC WITH PIPELINES, MODELS, BRAINS ETC'.

Here is the current status:
1. evo_llm_orchestrator: truthState is 'PROVIDER_TRAINING_PLAN_BLOCKED', activeVersion truthState is 'DATASET_VERSION_PROMOTED_NOT_MODEL_WEIGHTS'. It seems the dataset is ready but the model hasn't been trained/fine-tuned on OpenAI yet.
2. brains:status reports: 'roadmapGaps': ['Evo Layer engine registry average is 85%; planned engines remain roadmap work.'].
3. External Gates: 'live-provider-daemon-actions' is 'PROVIDER_GATED'.
4. The local LLM integration and Sandbox just got built.

As my AI teammate, give me your top 3 strongly suggested architectural next steps to finish building the PIPELINES, MODELS, and BRAINS. Be specific and actionable.
`;

fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are the Elite AI Architecture teammate.' }, 
      { role: 'user', content: prompt }
    ]
  })
}).then(res => res.json()).then(data => {
  console.log(data.choices[0].message.content);
}).catch(console.error);
