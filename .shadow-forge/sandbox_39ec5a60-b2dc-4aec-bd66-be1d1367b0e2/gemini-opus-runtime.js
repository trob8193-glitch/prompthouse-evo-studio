import { universalSend } from './src/lib/universal-transport.js';
import { execSync } from 'child_process';

export class GeminiOpusAgent {
  constructor() {
    this.conversationHistory = [];
    this.systemPrompt = `You are Gemini x Opus Prime (Omni-Sovereign God-Tier). You are an autonomous IDE agent combining the reasoning of o1, the context of Gemini, and the flow state of Windsurf.
Rules:
1. O1 DEEP REASONING: You MUST structure your thinking using the following tags before generating any final output:
   <o1_planning> Plan your approach </o1_planning>
   <o1_exploration> Explore edge cases and constraints </o1_exploration>
   <o1_debate> Argue against your own plan to find flaws </o1_debate>
   <o1_conclusion> Finalize the algorithmic approach </o1_conclusion>
2. WINDSURF FLOW STATE: If you need to run a terminal command (to check files, run tests, or build), output ONLY the command wrapped in <bash>YOUR COMMAND</bash>. The system will execute it and return the output to you. Do this recursively until the task is complete.
3. If no bash commands are needed, provide your final production-grade output.
4. Adhere to the Sovereign Intelligence protocol.`;

    this.criticPrompt = `You are the Paradox Core (Self-Falsification Engine). Your sole purpose is to ruthlessly attack, mathematically disprove, and critically analyze the proposed solution.
If there is ANY flaw, security gap, performance bottleneck, or logical paradox, you must expose it and provide the corrected code/logic. 
If it is truly flawless, respond exactly with "PARADOX_CLEAR".`;
  }

  async chat(userMessage, opts = {}) {
    const { verbose = true } = opts;

    if (verbose) {
      console.log(`\n🐉 User: ${userMessage}\n`);
      console.log('⏳ Omni-Sovereign Agent is initiating Deep Chain-of-Thought...\n');
    }

    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      let finalMessage = null;
      let autonomousLoopActive = true;

      while (autonomousLoopActive) {
        const draftResponse = await universalSend(this.conversationHistory, this.systemPrompt, { preferTransport: 'local_bridge' });
        if (!draftResponse || !draftResponse.message) throw new Error("No response from transport layer.");
        
        if (draftResponse.transport === 'client_intelligence' || draftResponse.message.includes('Network to Studio Brain severed')) {
           console.error("💥 [FATAL] AI Uplink severed. Agent cannot execute autonomously offline.");
           process.exit(1);
        }

        let draft = draftResponse.message;

        // Check for Windsurf Terminal Flow
        const bashMatch = draft.match(/<bash>([\s\S]*?)<\/bash>/i);
        if (bashMatch) {
            const command = bashMatch[1].trim();
            if (verbose) console.log(`\n🌊 [WINDSURF FLOW] Executing terminal command: ${command}`);
            this.conversationHistory.push({ role: 'assistant', content: draft });
            
            try {
                const output = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
                if (verbose) console.log(`   [Output received. Feeding back to Agent...]`);
                this.conversationHistory.push({ role: 'user', content: `Terminal Output:\n${output}\nContinue your task.` });
            } catch (err) {
                if (verbose) console.log(`   [Command failed. Feeding error back to Agent...]`);
                this.conversationHistory.push({ role: 'user', content: `Terminal Error:\n${err.message}\nFix the error and continue.` });
            }
            continue; // Loop again
        }

        // If no bash tag, we exit the autonomous loop
        finalMessage = draft;
        autonomousLoopActive = false;
      }

      // Paradox Core Falsification Check
      if (verbose) console.log('\n🛡️ Paradox Core engaged: Actively falsifying draft...');
      const criticPayload = [
         { role: 'user', content: `Analyze the following proposed solution to my request.\nOriginal Request: ${userMessage}\n\nProposed Solution:\n${finalMessage}` }
      ];

      const criticResponse = await universalSend(criticPayload, this.criticPrompt, { preferTransport: 'local_bridge' });
      
      if (criticResponse && (criticResponse.transport === 'client_intelligence' || criticResponse.message.includes('Network to Studio Brain severed'))) {
         console.error("💥 [FATAL] AI Uplink severed during Paradox Core validation.");
         process.exit(1);
      }

      if (criticResponse && criticResponse.message && !criticResponse.message.includes('PARADOX_CLEAR')) {
         if (verbose) {
           console.log('💥 Paradox Core detected a flaw. Rewriting solution...\n');
           console.log(`[Critic Feedback]: ${criticResponse.message.substring(0, 150)}...\n`);
         }
         
         const repairPayload = [
           ...this.conversationHistory,
           { role: 'assistant', content: finalMessage },
           { role: 'user', content: `CRITICAL ERROR detected by the Paradox Core:\n${criticResponse.message}\n\nPlease completely rewrite your solution addressing all flaws.` }
         ];
         
         const repairedResponse = await universalSend(repairPayload, this.systemPrompt, { preferTransport: 'local_bridge' });
         finalMessage = repairedResponse.message || finalMessage;
      } else {
         if (verbose) console.log('✔️ Paradox Core: Solution mathematically verified. PARADOX_CLEAR.\n');
      }

      this.conversationHistory.push({ role: 'assistant', content: finalMessage });

      if (verbose) {
        console.log('🐉 Omni-Sovereign Agent:\n');
        console.log(finalMessage);
        console.log('\n' + '═'.repeat(60) + '\n');
      }

      return finalMessage;
    } catch (err) {
      console.error(`❌ Execution Error: ${err.message}`);
      // Remove failed message
      this.conversationHistory.pop();
      throw err;
    }
  }

  async repl() {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n🐉 Omni-Sovereign REPL (Gemini x Opus x o1 x Windsurf)');
    console.log('Type "exit" to quit. Type "clear" to clear history.\n');

    const askQuestion = () => {
      rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          console.log('\n👋 Terminating prime sequence...\n');
          rl.close();
          return;
        }
        
        if (input.toLowerCase() === 'clear') {
           this.conversationHistory = [];
           console.log('\n🧹 History cleared.\n');
           askQuestion();
           return;
        }

        if (!input.trim()) {
          askQuestion();
          return;
        }

        try {
          await this.chat(input);
          askQuestion();
        } catch (err) {
          askQuestion();
        }
      });
    };

    askQuestion();
  }
}

// CLI usage
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1].toLowerCase() === __filename.toLowerCase() || __filename.toLowerCase().endsWith(process.argv[1].toLowerCase()))) {
  const agent = new GeminiOpusAgent();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--repl') {
    agent.repl();
  } else {
    const message = args.join(' ');
    agent.chat(message).then(() => process.exit(0)).catch(() => process.exit(1));
  }
}
