/**
 * PromptHouse Evo Studio — SelfBuild Orchestrator (REAL BUILD)
 * Reads feature specs, sends them through a real 6-layer prompt stack,
 * gets real implementation code from the AI, validates it, writes it to disk.
 * No empty shells. No placeholders. No "return manifested".
 */

const fs = require('fs');
const path = require('path');

const BRIDGE = 'http://127.0.0.1:3001';
const FEATURES_PATH = path.join(__dirname, 'master_features.json');
const OUTPUT_DIR = path.join(__dirname, 'src', 'features');

/**
 * Send a prompt to the AI via the bridge.
 */
async function askAI(prompt) {
  const res = await fetch(`${BRIDGE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: 'You are a senior JavaScript engineer. Write production-ready ES module code. No placeholders. No TODOs. No comments saying "implement later". Every function must contain real logic.'
    }),
  });
  const data = await res.json();
  return data.message || '';
}

/**
 * Build the 6-layer prompt stack for a specific feature.
 */
function build6LayerStack(feature) {
  return {
    identity: `You are a principal-level JavaScript architect specializing in the "${feature.module}" module of PromptHouse Evo Studio.`,

    mission: `Build the complete implementation for the "${feature.name}" feature. Description: ${feature.description}. This is a real production feature — write real, working code.`,

    domainLock: `Domain: JavaScript/ES Modules. Runtime: Browser (localStorage available) + Node.js bridge at http://127.0.0.1:3001. Framework: React 18. State: Zustand. The code will be imported by other modules in the studio.`,

    constraints: `Rules:
1. Export all public functions and classes using ES module syntax (export function / export class)
2. No placeholders, no TODOs, no "implement later" comments
3. No fake return values — every function must produce real, usable output
4. Handle errors with try/catch — never let exceptions crash silently
5. Include JSDoc comments for every exported function
6. MINIMUM 100 LINES of real logic. This is an OMEGA-LEVEL BUILD.
7. Implement deep, complex logic. Use state machines, caching, and multi-step verification.
8. If the feature needs persistence, use fetch() to the bridge API at http://127.0.0.1:3001
9. If the feature needs AI, use fetch() to http://127.0.0.1:3001/chat`,

    variables: `Feature ID: ${feature.id}. Feature Name: ${feature.name}. Module: ${feature.module}. Description: ${feature.description}.`,

    format: `Return ONLY the JavaScript code. No markdown, no explanations, no code fences. Just the raw .js file content starting with imports and ending with exports.`
  };
}

/**
 * Validate generated code: no placeholders, no TODOs, has real logic.
 */
function validateCode(code, featureName) {
  const errors = [];

  if (!code || code.trim().length < 100) {
    errors.push(`Code is too short (${code?.length || 0} chars). Need real implementation.`);
  }

  const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('/*'));
  if (lines.length < 20) {
    errors.push(`Only ${lines.length} lines of logic. Need 20+ lines of real code.`);
  }

  if (/\/\/\s*(TODO|FIXME|implement|placeholder)/i.test(code)) {
    errors.push('Contains TODO/FIXME/placeholder comments. Not allowed.');
  }

  if (/return\s*['"]manifested['"]/i.test(code)) {
    errors.push('Contains fake "manifested" return value.');
  }

  if (/throw new Error\(['"]Not implemented['"]\)/i.test(code)) {
    errors.push('Contains "Not implemented" throws.');
  }

  if (!/export\s+(function|class|const|default)/i.test(code)) {
    errors.push('No exports found. Code must export public API.');
  }

  return errors;
}

/**
 * Strip markdown code fences from AI response.
 */
function stripCodeFences(raw) {
  return raw.replace(/^```(?:javascript|js|jsx)?\n?/gm, '').replace(/```$/gm, '').trim();
}

/**
 * Build a single feature: prompt AI, validate, retry once if needed, write to disk.
 */
async function buildFeature(feature) {
  const stack = build6LayerStack(feature);
  const fullPrompt = [stack.identity, stack.mission, stack.domainLock, stack.constraints, stack.variables, stack.format].join('\n\n');

  console.log(`\n[SelfBuild] Building: ${feature.name} (${feature.id})...`);

  // Attempt 1
  let raw = await askAI(fullPrompt);
  let code = stripCodeFences(raw);
  let errors = validateCode(code, feature.name);

  // Retry once if validation fails
  if (errors.length > 0) {
    console.log(`[SelfBuild] Attempt 1 failed validation: ${errors.join('; ')}`);
    console.log('[SelfBuild] Retrying with error feedback...');

    const retryPrompt = `Your previous code for "${feature.name}" failed validation:
${errors.map(e => `- ${e}`).join('\n')}

Fix ALL of these issues. Write the complete, corrected implementation.
${fullPrompt}`;

    raw = await askAI(retryPrompt);
    code = stripCodeFences(raw);
    errors = validateCode(code, feature.name);
  }

  if (errors.length > 0) {
    console.error(`[SelfBuild] ❌ ${feature.name} FAILED after retry: ${errors.join('; ')}`);
    return { feature, success: false, errors };
  }

  // Write to disk
  const fileName = `${feature.name.toLowerCase().replace(/ /g, '_')}.js`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Add header comment
  const header = `/**
 * ${feature.name} — ${feature.description}
 * Module: ${feature.module} | ID: ${feature.id}
 * Generated by SelfBuild Orchestrator at ${new Date().toISOString()}
 * Validated: ${code.split('\n').length} lines, no placeholders, no TODOs
 */\n\n`;

  fs.writeFileSync(filePath, header + code, 'utf8');
  console.log(`[SelfBuild] ✅ ${feature.name} built successfully (${code.split('\n').length} lines) → ${fileName}`);

  return { feature, success: true, file: fileName, lines: code.split('\n').length };
}

// ─── Main Execution ───────────────────────────────────────────────────────────
async function main() {
  const features = JSON.parse(fs.readFileSync(FEATURES_PATH, 'utf8'));
  const targetCount = parseInt(process.argv[2]) || 5; // Default: build 5 features
  const targets = features.slice(0, targetCount);

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  SELFBUILD ORCHESTRATOR — REAL BUILD ENGINE  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`Building ${targets.length} of ${features.length} features...`);

  // Check bridge is online
  try {
    const statusRes = await fetch(`${BRIDGE}/status`);
    if (!statusRes.ok) throw new Error('Bridge not responding');
    console.log('[SelfBuild] Bridge: ONLINE ✓');
  } catch (e) {
    console.error('[SelfBuild] ❌ Bridge is offline. Run "npm run bridge" first.');
    process.exitCode = 1;
    return;
  }

  const results = [];
  for (const feature of targets) {
    try {
      const result = await buildFeature(feature);
      results.push(result);
    } catch (e) {
      console.error(`[SelfBuild] ❌ ${feature.name} crashed: ${e.message}`);
      results.push({ feature, success: false, errors: [e.message] });
    }
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${succeeded} built / ${failed} failed                ║`);
  console.log('╚══════════════════════════════════════════════╝');

  results.filter(r => !r.success).forEach(r => {
    console.log(`  ❌ ${r.feature.name}: ${r.errors?.join('; ')}`);
  });

  // Save build report
  const reportPath = path.join(__dirname, 'proof_receipts', 'selfbuild_report.json');
  fs.mkdirSync(path.join(__dirname, 'proof_receipts'), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    id: `selfbuild_${Date.now()}`,
    timestamp: new Date().toISOString(),
    total: targets.length,
    succeeded,
    failed,
    results: results.map(r => ({ name: r.feature.name, success: r.success, file: r.file, lines: r.lines, errors: r.errors })),
  }, null, 2));
  console.log(`\n📋 Build report saved: ${reportPath}`);

  process.exitCode = failed > 0 ? 1 : 0;
}

main();
