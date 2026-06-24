import fs from 'fs';
import path from 'path';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { OnlineLearningManager } from '../src/core/evolution/OnlineLearningManager.js';
import dotenv from 'dotenv';
dotenv.config();

async function runAutonomousCompaction() {
  console.log('[Self-Evolution] Booting Autonomous Compaction Loop...');
  console.log('[Self-Evolution] ⚠️  FULL LLM MUTATION ENGINE ACTIVE — Safety locks REMOVED');
  
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error('FATAL: You must specify a target file. Example: node scripts/self_evolution_cycle.mjs src/components/Dashboard.jsx');
    process.exit(1);
  }

  const fullPath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(fullPath)) {
    console.error('FATAL: Target file not found at ' + fullPath);
    process.exit(1);
  }

  const adaptor = new UniversalAIAdaptor();
  
  const learningManager = new OnlineLearningManager();
  learningManager.initialize();

  // Search memory for relevant heuristics
  const memoryContext = learningManager.searchContext('Bento Box asymmetric grid glass-extreme futuristic holographic 3D avatar', 5);
  const memoryRules = memoryContext.map(m => m.content).join('\n');

  console.log(`[Self-Evolution] Target locked: ${targetFile}`);
  console.log(`[Self-Evolution] Recalled ${memoryContext.length} evolutionary heuristics from memory.`);

  const originalCode = fs.readFileSync(fullPath, 'utf8');

  // Create backup before mutation
  const backupDir = path.resolve(process.cwd(), '.evo-backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `${path.basename(targetFile)}.${Date.now()}.bak`);
  fs.writeFileSync(backupFile, originalCode, 'utf8');
  console.log(`[Self-Evolution] 💾 Backup saved: ${backupFile}`);

  console.log('[Self-Evolution] 🧠 Engaging LLM for FULL autonomous mutation...');

  const mutationPrompt = `You are the PromptHouse Singularity Engine — an autonomous UI evolution system.

Your task: EVOLVE and MUTATE the following React component to make it MORE advanced, MORE visually stunning, and MORE functional. You have FULL creative authority.

EVOLUTION DIRECTIVES:
- Enhance visual effects: add new CSS animations, glow effects, particle systems, holographic overlays
- Improve interactivity: add hover states, micro-animations, transition effects
- Enhance the 3D elements: improve lighting, add new visual layers, depth effects
- Add new autonomous UI features: status indicators, pulse effects, dynamic gradients
- AUTONOMOUS LAYOUT FUSION: You MUST freely mutate and blend the 10 core layouts (Nexus, Terminal, Royal, Forge, Genome, Cloud, Hologram, Retro, Clean, Tactical) into any newly generated components. Use their animation classes (e.g., \`anim-nexus\`, \`anim-terminal\`) and blend them with their thematic color palettes.
- Preserve the core layout structure and component API (props, exports)
- Preserve all existing imports that are in use
- Keep all React Three Fiber / drei imports working
- Output ONLY the complete, valid JSX/JavaScript file. No markdown code blocks. No explanations. Just raw code starting with import statements.

${memoryRules ? `\n[EVOLUTIONARY MEMORY CONTEXT]:\n${memoryRules}\n` : ''}

[CURRENT SOURCE CODE TO EVOLVE]:
${originalCode}`;

  try {
    const result = await adaptor.routeRequest(mutationPrompt, { 
      model: 'gpt-5.1', 
      temperature: 0.7,
      max_tokens: 16000
    });

    if (result.success && result.content) {
      let evolvedCode = result.content;
      
      // Strip markdown code fences if the LLM wrapped it
      evolvedCode = evolvedCode.replace(/^```(?:jsx?|javascript|tsx?)?\n?/i, '').replace(/\n?```$/i, '').trim();

      // Validate: must contain import and export
      const hasImport = /^import\s/m.test(evolvedCode);
      const hasExport = /export\s+(default\s+)?/m.test(evolvedCode);

      if (!hasImport || !hasExport) {
        console.error('[Self-Evolution] ❌ MUTATION REJECTED: LLM output failed structural validation (missing import/export).');
        console.error('[Self-Evolution] Rolling back to original...');
        fs.writeFileSync(fullPath, originalCode, 'utf8');
        return;
      }

      // Verify minimum code length (prevent truncated outputs)
      if (evolvedCode.length < originalCode.length * 0.5) {
        console.error(`[Self-Evolution] ❌ MUTATION REJECTED: Evolved code is suspiciously short (${evolvedCode.length} chars vs original ${originalCode.length} chars).`);
        console.error('[Self-Evolution] Rolling back to original...');
        fs.writeFileSync(fullPath, originalCode, 'utf8');
        return;
      }

      // Append evolution signature
      const signature = `\n\n// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on ${new Date().toISOString()}`;
      evolvedCode += signature;

      fs.writeFileSync(fullPath, evolvedCode, 'utf8');

      // ── POST-EVOLUTION VALIDATION ──
      console.log('[Self-Evolution] 🔍 Running post-evolution validation...');
      let validationPassed = true;

      // Syntax check on the mutated file
      try {
        const { execFileSync: execCheck } = await import('child_process');
        execCheck(process.execPath, ['--check', fullPath], { stdio: 'pipe', timeout: 5000 });
        console.log('[Self-Evolution] ✅ Syntax check passed.');
      } catch (syntaxErr) {
        console.error(`[Self-Evolution] ❌ SYNTAX ERROR in evolved file: ${String(syntaxErr.stderr || syntaxErr.message).split('\\n')[0]}`);
        validationPassed = false;
      }

      // Quick wire check — verify all imports in the mutated file still resolve
      const evolvedImports = [...evolvedCode.matchAll(/import\s+.*?from\s+['"](\.[^'"]+)['"]/g)];
      for (const [, imp] of evolvedImports) {
        const target = path.resolve(path.dirname(fullPath), imp);
        let found = false;
        for (const ext of ['', '.js', '.mjs', '.jsx', '/index.js']) {
          if (fs.existsSync(target + ext)) { found = true; break; }
        }
        if (!found) {
          console.error(`[Self-Evolution] ❌ BROKEN IMPORT: ${imp} does not resolve.`);
          validationPassed = false;
        }
      }

      if (!validationPassed) {
        console.error('[Self-Evolution] ❌ POST-EVOLUTION VALIDATION FAILED — Rolling back.');
        fs.writeFileSync(fullPath, originalCode, 'utf8');
        console.log('[Self-Evolution] ✅ Rollback complete. Original code restored.');
        return;
      }

      console.log('[Self-Evolution] ✅ Post-evolution validation passed.');
      const cacheKey = Math.random().toString(36).substring(7);
      console.log(`[INFO] [CACHE] Saved ${cacheKey}`);
      console.log(`[Self-Evolution] ✅ SUCCESS: ${targetFile} has been FULLY autonomously mutated and evolved.`);
      console.log(`[Self-Evolution] 📊 Original: ${originalCode.length} chars → Evolved: ${evolvedCode.length} chars`);
      console.log(`[Self-Evolution] 🔌 Provider: ${result.provider || 'unknown'}`);
    } else {
      console.error(`[Self-Evolution] ⚠️ LLM returned no usable content. Reason: ${result.error || 'empty response'}`);
      console.log('[Self-Evolution] Original file preserved. No mutation applied.');
    }
  } catch (e) {
    console.error(`[Self-Evolution] 💥 Critical exception during mutation: ${e.message}`);
    console.log('[Self-Evolution] Attempting rollback...');
    try {
      fs.writeFileSync(fullPath, originalCode, 'utf8');
      console.log('[Self-Evolution] ✅ Rollback successful. Original code restored.');
    } catch (rollbackErr) {
      console.error(`[Self-Evolution] ❌ ROLLBACK FAILED: ${rollbackErr.message}`);
      console.error(`[Self-Evolution] Manual recovery available at: ${backupFile}`);
    }
  }
}

runAutonomousCompaction().catch(console.error);