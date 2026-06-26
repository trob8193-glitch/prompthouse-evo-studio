import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';
import { TerminalExecutionAdaptor } from '../../../lib/terminal/TerminalExecutionAdaptor.js';
import { runProofCommands } from '../evolution/ProofRunner.js';
import { EvoGitLedger } from '../evo-llm/EvoGitLedger.js';
import { resolveASTContext } from '../evolution/ASTRagEngine.js';
import { createEphemeralSandbox, destroySandbox } from '../evolution/EphemeralSandbox.js';
import { SHADOW_FORGE } from '../autonomy/ShadowForge.js';

function loadEnv(rootDir) {
  const envPath = path.join(rootDir, '.env');
  const vars = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.replace(/\r$/, '').match(/^([^#=]+)=(.*)$/);
      if (m) vars[m[1].trim()] = m[2].trim();
    }
  }
  return vars;
}

export class BlendedEvolutionEngine {
  constructor(rootDir = process.cwd(), aiAdaptor = null) {
    this.rootDir = rootDir;
    this.aiAdaptor = aiAdaptor;
  }

  resolveCssTargetFile(targetFile) {
    const requested = typeof targetFile === 'string' && targetFile.trim() ? targetFile.trim() : 'src/index.css';
    const relativeTarget = path.extname(requested).toLowerCase() === '.css' ? requested : 'src/index.css';
    const resolved = path.resolve(this.rootDir, relativeTarget);
    const rootWithSeparator = this.rootDir.endsWith(path.sep) ? this.rootDir : `${this.rootDir}${path.sep}`;
    if (!resolved.startsWith(rootWithSeparator)) return null;
    return resolved;
  }

  applyCssChange(suggestion) {
    if (!suggestion.cssRule) return false;

    const cssPath = this.resolveCssTargetFile(suggestion.targetFile);
    if (!cssPath) {
      Log.info('\x1b[33m⚠️ Target CSS file is outside the workspace. Skipping.\x1b[0m');
      return false;
    }

    if (!fs.existsSync(cssPath)) {
      Log.info(`\x1b[33m⚠️ Target CSS file not found: ${cssPath}\x1b[0m`);
      return false;
    }

    const content = fs.readFileSync(cssPath, 'utf-8');
    const marker = `\n/* [EVO-ENGINE] ${suggestion.description} */\n${suggestion.cssRule}\n`;

    if (content.includes(suggestion.cssRule)) {
      Log.info('\x1b[33m⚠️ This CSS rule already exists. Skipping.\x1b[0m');
      return true;
    }

    fs.writeFileSync(cssPath, content + marker, 'utf-8');
    Log.info(`\x1b[32m✅ CSS applied to ${path.relative(this.rootDir, cssPath)}\x1b[0m`);
    return true;
  }

  async applyPhantomChange(suggestion) {
    const changeType = suggestion.architectureChange ? 'Architecture' : 'Component';
    Log.info(`\x1b[35m[EVO-ENGINE] Autonomous ${changeType} Override Initiated for ${suggestion.targetFile}...\x1b[0m`);
    
    const adaptor = new TerminalExecutionAdaptor(this.rootDir, true);
    const targetPath = path.join(this.rootDir, suggestion.targetFile);
    
    const ledger = new EvoGitLedger(this.rootDir);
    const snapshot = ledger.createCryptographicSnapshot(suggestion.targetFile);
    if (!snapshot.success) {
      Log.error(`\x1b[31m❌ Could not capture cryptographic snapshot for ${suggestion.targetFile}\x1b[0m`);
      return false;
    }
    const preHash = snapshot.hash;

    // --- 1. Semantic Chunking (AST RAG Layer) ---
    Log.info(`\x1b[36m[EVO-ENGINE] Retrieving localized AST context for hallucination prevention...\x1b[0m`);
    const astContext = resolveASTContext(targetPath, this.rootDir, 1);
    
    if (!astContext) {
      Log.error(`\x1b[31m❌ Could not read target file or its AST context.\x1b[0m`);
      return false;
    }

    Log.info(`\x1b[36m[EVO-ENGINE] Requesting Gemini to rewrite the physical file in Ephemeral Sandbox...\x1b[0m`);
    const improvementInstruction = suggestion.architectureChange || suggestion.componentChange;
    const rewritePrompt = `Rewrite the following file to implement this improvement: "${improvementInstruction}". 
Return ONLY the raw file content for the target file, no markdown blocks. 
Use the provided AST context to ensure you do not hallucinate imported variables or types.`;

    const env = loadEnv(this.rootDir);
    let newContent = null;
    
    try {
      const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!this.aiAdaptor && (!openaiKey || openaiKey === 'PHYSICAL_BYPASS_ENGAGED')) {
        Log.info('\x1b[33m⚠️ Using physical phantom rewrite success due to bypassed keys.\x1b[0m');
        return false;
      }

      const userMessage = `${rewritePrompt}\n\n=== AST CONTEXT ===\n${astContext}`;

      if (this.aiAdaptor) {
        const rewriteData = await this.aiAdaptor.generateResponse([{ role: 'user', content: userMessage }], '', { model: 'gpt-4o-mini' });
        newContent = rewriteData.message;
      } else if (openaiKey && openaiKey !== 'PHYSICAL_BYPASS_ENGAGED') {
        const rewriteRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: userMessage }]
          })
        });
        
        const rewriteData = await rewriteRes.json();
        newContent = rewriteData.choices?.[0]?.message?.content;
      }
      
      if (newContent) {
        // Remove potential markdown blocks if the AI still hallucinates them
        newContent = newContent.replace(/^```[a-z]*\n/gm, '').replace(/```\n?$/g, '').trim();

        // --- 1.5 ShadowForge AST Validation ---
        Log.info(`\x1b[36m[EVO-ENGINE] Validating logic through ShadowForge Sandbox...\x1b[0m`);
        const isSafe = await SHADOW_FORGE.shadowBuild(suggestion.targetFile, newContent);
        if (!isSafe) {
          Log.error(`\x1b[31m🚨 SHADOWFORGE REJECTED MUTATION. ABORTING.\x1b[0m`);
          return false;
        }

        // --- 2. Ephemeral Sandboxing ---
        const runId = crypto.randomUUID();
        Log.info(`\x1b[32m✅ File generated and AST validated. Spinning up Ephemeral Sandbox [${runId}]...\x1b[0m`);
        const sandboxDir = createEphemeralSandbox(this.rootDir, runId);
        
        const sandboxTargetPath = path.join(sandboxDir, suggestion.targetFile);
        
        // Write the modification INSIDE the sandbox
        fs.writeFileSync(sandboxTargetPath, newContent, 'utf8');

        Log.info(`\x1b[32m✅ File isolated in Ephemeral Sandbox. Verifying via ProofRunner...\x1b[0m`);
        
        const receiptDir = path.join(sandboxDir, 'proof_receipts', 'verification');
        const proof = await runProofCommands({
          workspaceDir: sandboxDir,
          commands: ['npm run build'],
          receiptDir
        });
        
        if (!proof.passed) {
          Log.error(`\x1b[31m🚨 BUILD FAILED AFTER EVOLUTION. HALLUCINATION CONTAINED IN SANDBOX.\x1b[0m`);
          Log.info(`\x1b[33m⚠️ Rollback complete. Sandbox destroyed. Math snapshot preserved.\x1b[0m`);
          destroySandbox(sandboxDir);
          return false;
        } else {
          Log.info(`\x1b[32m🛡️ Build verified! Auto-merging from Ephemeral Sandbox into main repository.\x1b[0m`);
          
          // Copy verified file from sandbox back to host
          fs.copyFileSync(sandboxTargetPath, targetPath);
          destroySandbox(sandboxDir);

          const finalContent = fs.readFileSync(targetPath, 'utf8');
          const postHash = ledger.hashContent(finalContent);
          ledger.writeLedgerCommit({
            targetFile: suggestion.targetFile,
            preHash,
            postHash,
            intention: improvementInstruction
          });
          Log.success(`\x1b[32m✨ Merged successfully and signed into Unbreakable Evo Git Ledger!\x1b[0m`);
          return true;
        }
      }
    } catch (e) {
      Log.error(`\x1b[31m❌ Rewrite failed: ${e.message}\x1b[0m`);
    }
    return false;
  }

  async runIntelligenceCycle(spatialData) {
    const env = loadEnv(this.rootDir);
    const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!this.aiAdaptor && (!openaiKey || openaiKey === 'PHYSICAL_BYPASS_ENGAGED')) {
      Log.error('\x1b[31m❌ No OPENAI_API_KEY found in .env and no AI Adaptor available.\x1b[0m');
      return null;
    }

    const url = 'https://api.openai.com/v1/chat/completions';
    const systemPrompt = `You are the QuadBrain Systems Architect analyzing a spatial map of a React application and its underlying intelligence network.
The spatial map contains exact bounding rectangles of every UI element, alongside real-time Wi-Fi topology, active bonds, and Global Hub status.
Your job: identify ONE specific, actionable CSS, React, or Architecture improvement.
Return ONLY a JSON object with this exact schema:
{
  "targetFile": "src/index.css, src/components/..., or src/core/...",
  "description": "What to improve and why",
  "cssRule": "selector { property: value; }" OR null,
  "componentChange": "description of React change" OR null,
  "architectureChange": "description of router/tether/bond/networking improvement" OR null
}
Rules: No markdown fences. No explanations outside the JSON. Only one change per response.
Focus on: spacing, visual hierarchy, micro-animations, or strengthening QuadBrain resilience (e.g., tether logic, offline fallbacks).`;

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Spatial map data:\n${JSON.stringify(spatialData, null, 2).slice(0, 6000)}` }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    };

    try {
      if (this.aiAdaptor) {
        const response = await this.aiAdaptor.generateResponse([{ role: 'user', content: `Spatial map data:\n${JSON.stringify(spatialData, null, 2).slice(0, 6000)}` }], systemPrompt, { model: 'gpt-4o-mini' });
        const text = response.message;
        if (!text) throw new Error('Empty response');

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        return JSON.parse(jsonMatch[0]);
      } else if (openaiKey && openaiKey !== 'PHYSICAL_BYPASS_ENGAGED') {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('Empty response');

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      Log.error(`\x1b[33m⚠️ AI Intelligence generation failed: ${e.message}.\x1b[0m`);
    }

    return null;
  }
}
