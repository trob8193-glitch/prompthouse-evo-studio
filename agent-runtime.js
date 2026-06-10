/**
 * PromptHouse Evo Studio — Agent Runtime
 * Handles agent interactions, thread management, and streaming responses
 * 
 * Usage:
 *   import { EvoAgent } from './agent-runtime.js';
 *   const evo = new EvoAgent();
 *   const response = await evo.chat("Create a Flutter auth flow");
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

const runtimeBridgePort = process.env.BRIDGE_PORT;
dotenv.config({ path: '.env.agent', override: true });
dotenv.config({ override: true });
if (runtimeBridgePort) {
  process.env.BRIDGE_PORT = runtimeBridgePort;
}

export class EvoAgent {
  constructor(agentId = null) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
    });
    this.agentId = agentId || process.env.AGENT_ID;
    this.threadId = null;
    this.conversationHistory = [];

    if (!this.agentId) {
      throw new Error('AGENT_ID not found in .env.agent. Run: node openai-agent-modern.js');
    }
  }

  /**
   * Initialize a new conversation thread
   */
  async initThread() {
    console.log('🧵 Creating new conversation thread...');
    const thread = await this.openai.beta.threads.create();
    this.threadId = thread.id;
    console.log(`✅ Thread created: ${this.threadId}\n`);
    return this.threadId;
  }

  /**
   * Send a message and get a streamed response
   */
  async chat(userMessage, opts = {}) {
    if (!this.threadId) {
      await this.initThread();
    }

    const { verbose = true, temperature = 0.7, instructions = null } = opts;

    if (verbose) {
      console.log(`\n🦁 User: ${userMessage}\n`);
      console.log('⏳ Evo is thinking...\n');
    }

    await this.openai.beta.threads.messages.create(this.threadId, {
      role: 'user',
      content: userMessage,
    });

    const runParams = {
      assistant_id: this.agentId,
      tools: [{ type: 'code_interpreter' }],
      temperature,
    };
    if (instructions) {
      runParams.instructions = instructions;
    }

    const run = await this.openai.beta.threads.runs.create(this.threadId, runParams);
    let runStatus = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: this.threadId });

    while (!['completed', 'failed', 'cancelled', 'expired'].includes(runStatus.status)) {
      if (verbose) {
        console.log(`⏳ Status: ${runStatus.status}...`);
      }

      if (runStatus.status === 'requires_action') {
        throw new Error('Agent run requested external tool execution; file access, mutation, and deploy actions require explicit owner-approved Studio routes.');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: this.threadId });
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'No completed response was returned.'}`);
    }

    const messages = await this.openai.beta.threads.messages.list(this.threadId);
    const assistantMessages = messages.data
      .filter((m) => m.role === 'assistant')
      .sort((a, b) => b.created_at - a.created_at);

    if (assistantMessages.length === 0) {
      throw new Error('No response from agent');
    }

    const latestMessage = assistantMessages[0];
    const response = latestMessage.content
      .map((block) => (block.type === 'text' ? block.text.value : ''))
      .join('\n');

    // Store in history
    this.conversationHistory.push({
      timestamp: new Date(),
      user: userMessage,
      assistant: response,
    });

    if (verbose) {
      console.log('🦁 Evo:\n');
      console.log(response);
      console.log('\n' + '═'.repeat(60) + '\n');
    }

    return response;
  }

  /**
   * Start interactive REPL mode
   */
  async repl() {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n🦁 PromptHouse Evo Studio REPL');
    console.log('Type "exit" to quit\n');

    await this.initThread();

    const askQuestion = () => {
      rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          console.log('\n👋 Goodbye!\n');
          rl.close();
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
          console.error(`❌ Error: ${err.message}`);
          askQuestion();
        }
      });
    };

    askQuestion();
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Save conversation to file
   */
  async saveConversation(filename = 'conversation.json') {
    import('fs').then((fs) => {
      fs.writeFileSync(filename, JSON.stringify(this.conversationHistory, null, 2));
      console.log(`💾 Saved to ${filename}`);
    });
  }
}

// CLI usage
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1].toLowerCase() === __filename.toLowerCase() || __filename.toLowerCase().endsWith(process.argv[1].toLowerCase()))) {
  console.log('DEBUG: Agent Runtime CLI Entry detected');
  const evo = new EvoAgent();

  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--repl') {
    // Start REPL
    evo.repl();
  } else {
    // Single message mode
    const message = args.join(' ');
    evo
      .chat(message)
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error(`❌ ${err.message}`);
        process.exit(1);
      });
  }
}

export default EvoAgent;
