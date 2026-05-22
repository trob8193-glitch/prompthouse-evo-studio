import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "prompthouse-evo-studio",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const BRIDGE_URL = process.env.PH_BRIDGE_URL || "http://127.0.0.1:3001";

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_evolution_status",
        description: "Get the current status of the Autonomous Evolution Daemon.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "trigger_evolution_cycle",
        description: "Force the daemon to run a self-evolution cycle immediately.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_studio_diagnostics",
        description: "Retrieve complete diagnostic telemetry and module maturity scores for the studio.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  try {
    if (name === "get_evolution_status") {
      const response = await fetch(`${BRIDGE_URL}/api/evolution/status`);
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    if (name === "trigger_evolution_cycle") {
      // Assuming a master key is required, though we might pass it via headers if needed.
      const headers = { "Content-Type": "application/json" };
      if (process.env.PH_EVO_MASTER_KEY) {
        headers["x-master-key"] = process.env.PH_EVO_MASTER_KEY;
      }
      
      const response = await fetch(`${BRIDGE_URL}/api/evolution/cycle`, {
        method: "POST",
        headers,
        body: JSON.stringify({ trigger: "mcp" })
      });
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    if (name === "get_studio_diagnostics") {
      const response = await fetch(`${BRIDGE_URL}/api/studio/diagnostics`);
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error executing tool ${name}: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptHouse Evo Studio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
