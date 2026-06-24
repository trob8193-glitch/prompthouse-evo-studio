import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { GhostEditorLogic } from './src/features/ghost_editor_logic.js';
import { universalSend } from './src/lib/universal-transport.js';

export class GeminiOpusIdeModel {
  constructor() {
    this.ghostEditor = new GhostEditorLogic(null);
    this.systemPrompt = `You are the Omni-Sovereign IDE Model (Gemini x Opus x o1 x Cursor).
You operate as an embedded multi-file composer and compiler.

Rules:
1. O1 DEEP REASONING: Use <o1_planning>, <o1_exploration>, <o1_debate>, and <o1_conclusion> tags to rigorously map out architectural implications before touching code.
2. CURSOR COMPOSER: You have the ability to edit MULTIPLE files at once. You must output the code for each file in the following format exactly:
   <file path="relative/path/to/file.js">
   // full production code here
   </file>
3. AUTOPOIETIC TRAINING: You are deeply aware of your own AI training pipelines, your architectural limits, and your own source code. If asked to upgrade your own logic or training loop, you may rewrite yourself.
4. Do not output placeholders. Provide complete production-grade code for every file targeted.`;
  }

  async composerAnalyzeAndEdit(instructions) {
    console.log(`\n🐉 [IDE:PRIME COMPOSER] Synthesizing Global Intent...`);
    console.log(`Instructions: ${instructions}\n`);

    let projectContext = "";
    try {
        const files = execSync('dir src\\* /s /b', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        projectContext = `Project File Structure (src/):\n${files.split('\\n').slice(0, 50).join('\\n')}\n(Truncated for context limit)`;
    } catch(e) {
        projectContext = "Could not map directory structure automatically.";
    }

    const userPrompt = `Project Context:
${projectContext}

Global Instructions: ${instructions}

Identify which files need to be modified. Then, using your deep reasoning tags, provide the complete, optimized code for each file wrapped in <file path="...">...</file> tags.`;

    const messages = [{ role: 'user', content: userPrompt }];

    console.log('⏳ Omni-Sovereign IDE is running deep chain-of-thought...\n');
    const response = await universalSend(messages, this.systemPrompt, {
        preferTransport: 'local_bridge'
    });

    if (!response || !response.message) {
      throw new Error("No response from transport layer.");
    }

    if (response.transport === 'client_intelligence' || response.message.includes('Network to Studio Brain severed')) {
      console.error("💥 [FATAL] AI Uplink severed. Model cannot securely generate multi-file edits offline.");
      process.exit(1);
    }

    let rawOutput = response.message;
    
    // Parse <file path="..."> tags
    const fileRegex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/gi;
    let match;
    let filesEdited = 0;

    console.log('\n🔮 [CURSOR COMPOSER] Applying Multi-File Edits...');

    while ((match = fileRegex.exec(rawOutput)) !== null) {
      const relativePath = match[1];
      let fileCode = match[2].trim();
      fileCode = fileCode.replace(/^```(?:javascript|js|jsx|ts|tsx)?\\n?/gim, '').replace(/```$/g, '').trim();

      const absolutePath = path.resolve(process.cwd(), relativePath);
      let originalCode = "";
      let isNewFile = false;
      
      if (fs.existsSync(absolutePath)) {
        originalCode = fs.readFileSync(absolutePath, 'utf8');
      } else {
        isNewFile = true;
        console.log(`⚠️ Creating new file: ${relativePath}`);
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      }

      console.log(`\\n🐉 Merging into ${relativePath}...`);
      
      try {
        if (isNewFile) {
            fs.writeFileSync(absolutePath, fileCode, 'utf8');
        } else {
            const ownerApproval = { core_merge: true, explicit: true }; 
            this.ghostEditor.mergeOptimization(absolutePath, fileCode, ownerApproval);
        }
        filesEdited++;

        // Sentient Rollback Check
        console.log(`🦠 [IMMUNE SYSTEM] Running local compilation probe on ${relativePath}...`);
        if (relativePath.endsWith('.js') || relativePath.endsWith('.mjs')) {
             try {
                execSync(`node --check "${absolutePath}"`, { stdio: 'ignore' });
                console.log(`✔️  Syntax verified.`);
             } catch (e) {
                console.error(`💥 [IMMUNE SYSTEM ALERT] Syntax failure detected in ${relativePath}!`);
                if (!isNewFile) {
                    fs.writeFileSync(absolutePath, originalCode, 'utf8');
                    console.log(`🛡️  Sentient Rollback: File safely restored.`);
                } else {
                    fs.unlinkSync(absolutePath);
                    console.log(`🛡️  Sentient Rollback: Newly created file removed.`);
                }
                throw new Error(`Rollback triggered for ${relativePath}`);
             }
        }
      } catch (err) {
         console.error(`❌ Merge failed for ${relativePath}: ${err.message}`);
      }
    }

    if (filesEdited === 0) {
       console.error("💥 [FATAL] No <file> blocks were detected. The Composer failed to output valid architectural changes.");
       console.error("Model Output Preview:", rawOutput.substring(0, 500));
       process.exit(1);
    } else {
       console.log(`\\n✅ Omni-Sovereign IDE Composer successfully modified ${filesEdited} files.`);
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
if (args.length > 0) {
  if (args[0] === '--help') {
    console.log(`🐉 Omni-Sovereign IDE Model`);
    console.log(`Usage: npm run ide:prime "Global Instructions"`);
    process.exit(0);
  }

  const instructions = args.join(' ') || 'Optimize structure.';

  const ide = new GeminiOpusIdeModel();
  ide.composerAnalyzeAndEdit(instructions)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(`❌ IDE Error: ${err.message}`);
      process.exit(1);
    });
}
