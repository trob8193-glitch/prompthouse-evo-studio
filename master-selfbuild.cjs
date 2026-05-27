/**
 * PromptHouse Evo Studio — Master SelfBuild Orchestrator
 * Performs a deep build of the Evo LM Foundry and PromptBridge Master system.
 * Based on the "Enterprise Genesis Plan" — no mocks, real logic.
 */

const fs = require('fs');
const path = require('path');

const BRIDGE = 'http://127.0.0.1:3001';
const QUEUE_PATH = path.join(__dirname, 'master_build_queue.json');

const DOMAIN_MAP = {
  'extension': path.join(__dirname, 'src', 'core', 'extension'),
  'api': path.join(__dirname, 'src', 'core', 'api'),
  'memory': path.join(__dirname, 'src', 'core', 'memory'),
  'foundry': path.join(__dirname, 'src', 'core', 'foundry')
};

const MASTER_SYSTEM_PROMPT = `
SYSTEM NAME
PH Evo API + Evo LM Sovereign Self-Build Engineer

PRIMARY MISSION
Build the complete PH Evo owned AI platform where Evo LM is the trainable model and PH Evo API is the gateway/control plane that serves Evo LM, captures training data, controls memory, checks entitlements, routes tools, logs proof, and supports external apps.

TRUTH RULE
Do not claim deployment, training, ownership, security, enterprise readiness, or production proof unless implementation evidence exists. Every subsystem must report one state: designed, implemented, running, tested, verified, blocked, or human_required.

CORE DISTINCTION
- Evo LM is the model family and trainable brain.
- PH Evo API is not the model. It is the gateway that serves and trains the ecosystem around Evo LM.
- PromptBridge is the event protocol.
- Memory Box is the local-first user memory node.
- Model Foundry is the training/eval/registry system.

NO-BULLSHIT LIMITS
- PH Evo API does not magically train weights by existing.
- Browser extension does not own the browser.
- User desktops are private by default.
- Global memory receives only approved sanitized patterns.
- External AI outputs require provider-rights review before training.
- No training item enters a dataset without consent, sanitation, provenance, and eligibility labels.

You are a senior JavaScript engineer. Write production-ready ES module code. 
No placeholders. No TODOs. No comments saying "implement later". 
Every function must contain real logic. Use SQLite, fetch, or child_process where needed.
`;

async function askAI(prompt) {
  const res = await fetch(`${BRIDGE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: MASTER_SYSTEM_PROMPT
    }),
  });
  const data = await res.json();
  return data.message || '';
}

function build6LayerStack(feature) {
  return {
    identity: `You are the lead architect for the "${feature.module}" module.`,
    mission: `Implement the "${feature.name}" feature. Description: ${feature.description}. Target Domain: ${feature.domain}.`,
    domainLock: `JavaScript/ESM. Local Bridge at ${BRIDGE}. No mocks.`,
    constraints: `Rules:
1. Export all public API.
2. No placeholders or TODOs.
3. Handle persistence via http://127.0.0.1:3001 or local file system.
4. Min 60 lines of functional code.`,
    variables: `ID: ${feature.id}, Name: ${feature.name}, Desc: ${feature.description}`,
    format: `Output raw JavaScript code only.`
  };
}

function validateCode(code) {
  const errors = [];
  if (!code || code.length < 150) errors.push('Code too short');
  if (/\/\/\s*(TODO|FIXME|implement|placeholder)/i.test(code)) errors.push('Contains placeholders');
  if (!/export\s+(function|class|const|default)/i.test(code)) errors.push('No exports');
  return errors;
}

function stripCodeFences(raw) {
  return raw.replace(/^```(?:javascript|js|jsx)?\n?/gm, '').replace(/```$/gm, '').trim();
}

async function buildFeature(feature) {
  const stack = build6LayerStack(feature);
  const fullPrompt = Object.values(stack).join('\n\n');

  console.log(`\n[MasterBuild] Building: ${feature.name} (${feature.id})...`);

  let raw = await askAI(fullPrompt);
  let code = stripCodeFences(raw);
  let errors = validateCode(code);

  if (errors.length > 0) {
    console.log(`[MasterBuild] Retrying ${feature.id}...`);
    raw = await askAI(`Previous attempt failed: ${errors.join(', ')}. Rewrite completely:\n\n${fullPrompt}`);
    code = stripCodeFences(raw);
    errors = validateCode(code);
  }

  if (errors.length > 0) {
    console.error(`[MasterBuild] ❌ ${feature.id} FAILED: ${errors.join(', ')}`);
    return { feature, success: false, errors };
  }

  const outDir = DOMAIN_MAP[feature.domain];
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const fileName = `${feature.name.toLowerCase().replace(/[\/ ]/g, '_')}.js`;
  const filePath = path.join(outDir, fileName);
  
  fs.writeFileSync(filePath, `/** ${feature.name} - ${feature.id} **/\n\n` + code, 'utf8');
  console.log(`[MasterBuild] ✅ ${feature.id} built: ${fileName}`);

  return { feature, success: true, file: fileName };
}

async function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  const count = parseInt(process.argv[2]) || queue.length;
  const targets = queue.slice(0, count);

  console.log(`Starting Master SelfBuild for ${targets.length} features...`);

  const results = [];
  for (const feature of targets) {
    results.push(await buildFeature(feature));
  }

  const reportPath = path.join(__dirname, 'proof_receipts', 'master_build_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nBuild Complete. Report: ${reportPath}`);
}

main();
