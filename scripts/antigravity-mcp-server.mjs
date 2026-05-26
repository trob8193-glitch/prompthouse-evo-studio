import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import 'dotenv/config';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { EVO_DEV_TEAM } from '../src/bot-characters.js';
import { spawn } from 'child_process';

const server = new Server(
  { name: "antigravity-evo-bots", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

const ai = new UniversalAIAdaptor({
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  gemini: process.env.GEMINI_API_KEY
});

const BOT_NAMES = EVO_DEV_TEAM.map(b => b.name).join(", ");

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ask_evo_bot",
        description: `Ask a specific bot from the 21-member Evo Dev Team a question or assign them a task. Valid bots include: ${BOT_NAMES}.`,
        inputSchema: {
          type: "object",
          properties: {
            bot_name: { type: "string", description: "The exact name of the bot (e.g., LION, NOVA, KAI)." },
            message: { type: "string", description: "The task, question, or prompt for the bot." },
            race: { type: "boolean", description: "If true, race all available providers for fastest response." }
          },
          required: ["bot_name", "message"]
        }
      },
      {
        name: "ask_squad",
        description: `Send a task to multiple bots simultaneously and get all their responses in parallel. Provide a comma-separated list of bot names. Valid bots: ${BOT_NAMES}.`,
        inputSchema: {
          type: "object",
          properties: {
            bot_names: { type: "string", description: "Comma-separated list of bot names (e.g., 'LION,TIGER,WOLF')." },
            message: { type: "string", description: "The shared task or question for all bots." }
          },
          required: ["bot_names", "message"]
        }
      },
      {
        name: "run_test_suite",
        description: "Run the studio's test suite asynchronously in the background. Does not block the IDE.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "run_omni_missions",
        description: "Run the full Omni-Orchestrator asynchronously in the background, firing up all 12 evolution and audit daemons.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "run_training_cycle",
        description: "Execute a training cycle that generates new training data and ingests it into the studio's brain. Uses the self-train pipeline.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_bot_status",
        description: "Get the current status of the AI adaptor — which provider is active, latency stats, and cache health.",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  };
});

/**
 * Helper: dispatch a single bot query
 */
async function dispatchBot(botObj, message, options = {}) {
  const systemPrompt = [
    `You are ${botObj.name}, ${botObj.role}. Specialty: ${botObj.specialty}.`,
    `You are part of the 21-member Evo Dev Team inside PromptHouse Evo Studio.`,
    `Respond concisely and precisely. Focus on actionable output.`
  ].join('\n');

  const result = await ai.chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ], { race: options.race || false });

  return {
    bot: botObj.name,
    role: botObj.role,
    response: result.content || result.error || 'No response',
    provider: result.provider,
    latency_ms: result.latency_ms || 0,
    from_cache: result.from_cache || false
  };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // ─── ask_evo_bot ───
  if (request.params.name === "ask_evo_bot") {
    const { bot_name, message, race } = request.params.arguments;
    const botObj = EVO_DEV_TEAM.find(b => b.name.toLowerCase() === bot_name.toLowerCase());
    
    if (!botObj) {
      return {
        content: [{ type: "text", text: `Error: Bot '${bot_name}' not found. Valid bots are: ${BOT_NAMES}` }],
        isError: true
      };
    }
    
    try {
      const result = await dispatchBot(botObj, message, { race: !!race });
      const header = `🤖 [${result.bot}] (${result.provider}, ${result.latency_ms}ms${result.from_cache ? ', cached' : ''})`;
      return {
        content: [{ type: "text", text: `${header}\n${result.response}` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: Failed communicating with AI for ${bot_name}. ${err.message}` }],
        isError: true
      };
    }
  }

  // ─── ask_squad (parallel multi-bot) ───
  if (request.params.name === "ask_squad") {
    const { bot_names, message } = request.params.arguments;
    const names = bot_names.split(',').map(n => n.trim().toUpperCase());
    const bots = names.map(n => EVO_DEV_TEAM.find(b => b.name === n)).filter(Boolean);
    const notFound = names.filter(n => !EVO_DEV_TEAM.find(b => b.name === n));

    if (bots.length === 0) {
      return {
        content: [{ type: "text", text: `Error: No valid bots found. Valid bots are: ${BOT_NAMES}` }],
        isError: true
      };
    }

    // Fire all bots in parallel
    const results = await Promise.allSettled(
      bots.map(bot => dispatchBot(bot, message))
    );

    const lines = results.map((r, i) => {
      if (r.status === 'fulfilled') {
        const d = r.value;
        return `### 🤖 ${d.bot} (${d.role}) — ${d.provider}, ${d.latency_ms}ms${d.from_cache ? ' [cached]' : ''}\n${d.response}`;
      }
      return `### ❌ ${bots[i].name} — Failed: ${r.reason?.message || 'Unknown error'}`;
    });

    if (notFound.length > 0) {
      lines.push(`\n⚠️ Bots not found: ${notFound.join(', ')}`);
    }

    return {
      content: [{ type: "text", text: lines.join('\n\n---\n\n') }]
    };
  }

  // ─── run_test_suite ───
  if (request.params.name === "run_test_suite") {
    const child = spawn('npm', ['test'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    child.unref();
    return {
      content: [{ type: "text", text: "✅ Test suite started asynchronously in the background." }]
    };
  }

  // ─── run_omni_missions ───
  if (request.params.name === "run_omni_missions") {
    const child = spawn('node', ['scripts/omni_orchestrator.mjs'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    child.unref();
    return {
      content: [{ type: "text", text: "🌌 Omni-Orchestrator ignited asynchronously. All 12 daemons are spinning up." }]
    };
  }

  // ─── run_training_cycle ───
  if (request.params.name === "run_training_cycle") {
    const child = spawn('node', ['scripts/ai_self_train.mjs'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    child.unref();
    return {
      content: [{ type: "text", text: "🧠 Training cycle started asynchronously. The studio is generating new training data and ingesting it into the brain." }]
    };
  }

  // ─── get_bot_status ───
  if (request.params.name === "get_bot_status") {
    const provider = ai.getBestProvider();
    const latencies = {};
    for (const [p, hist] of Object.entries(ai.providerLatency)) {
      if (hist.length > 0) {
        latencies[p] = {
          avg_ms: Math.round(hist.reduce((a, b) => a + b, 0) / hist.length),
          samples: hist.length,
          last_ms: hist[hist.length - 1]
        };
      }
    }

    const status = {
      active_provider: provider,
      available_providers: [],
      latency_stats: latencies,
      bots_online: EVO_DEV_TEAM.length,
      cache_dir: ai.cache.cacheDir
    };

    if (ai.keys.openai) status.available_providers.push('openai');
    if (ai.keys.gemini) status.available_providers.push('gemini');
    status.available_providers.push('ph_evo (local)');

    return {
      content: [{ type: "text", text: JSON.stringify(status, null, 2) }]
    };
  }
  
  throw new Error("Unknown tool");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Antigravity Evo Bots MCP Server v2.0 running on stdio");
}

run().catch((error) => {
  console.error("MCP Server Error:", error);
  process.exit(1);
});
