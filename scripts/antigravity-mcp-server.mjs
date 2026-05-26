import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import 'dotenv/config';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { EVO_DEV_TEAM } from '../src/bot-characters.js';

const server = new Server(
  { name: "antigravity-evo-bots", version: "1.0.0" },
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
            message: { type: "string", description: "The task, question, or prompt for the bot." }
          },
          required: ["bot_name", "message"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "ask_evo_bot") {
    const { bot_name, message } = request.params.arguments;
    const botObj = EVO_DEV_TEAM.find(b => b.name.toLowerCase() === bot_name.toLowerCase());
    
    if (!botObj) {
      return {
        content: [{ type: "text", text: `Error: Bot '${bot_name}' not found. Valid bots are: ${BOT_NAMES}` }],
        isError: true
      };
    }
    
    const systemPrompt = `You are ${botObj.name}, ${botObj.role}. Specialty: ${botObj.specialty}\nTask: ${message}`;
    
    try {
      const response = await ai.chat([
        { role: 'system', content: systemPrompt }, 
        { role: 'user', content: message }
      ]);
      
      const output = response.content || response.error || 'Unknown response format';
      
      return {
        content: [{ type: "text", text: `🤖 [${botObj.name}] Response:\n${output}` }]
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: Failed communicating with AI for ${bot_name}. ${err.message}` }],
        isError: true
      };
    }
  }
  
  throw new Error("Unknown tool");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Antigravity Evo Bots MCP Server running on stdio");
}

run().catch((error) => {
  console.error("MCP Server Error:", error);
  process.exit(1);
});
