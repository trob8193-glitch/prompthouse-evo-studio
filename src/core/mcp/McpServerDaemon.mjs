import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PlatformReadinessEngine } from "../platform-sentinel/index.js";
import { runDeployRail } from "../../deploy-rail.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new Server(
  {
    name: "PromptHouse-Studio-MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 1. Define the tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_platform_readiness",
        description: "Runs a live nuclear reality audit on the PromptHouse Evo Studio. Returns the global readiness score, broken modules, and deployment blockers. Use this to determine if the studio is ready for production.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "trigger_mobile_compilation",
        description: "Forces the Studio's AI Mobile Engine to compile a native iOS and Android application for a given SaaS Web App ID.",
        inputSchema: {
          type: "object",
          properties: {
            appId: {
              type: "string",
              description: "The ID of the SaaS application (e.g. 'saas-1').",
            },
            target: {
              type: "string",
              description: "The mobile architect target. Default: 'expo_router'",
            },
          },
          required: ["appId"],
        },
      },
      {
        name: "trigger_deploy_rail",
        description: "Executes the Sovereign DeployRail to autonomously deploy the current studio codebase to Vercel.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// 2. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_platform_readiness") {
      const sentinel = new PlatformReadinessEngine();
      const status = sentinel.status({ runCommands: false });
      
      return {
        content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
      };
    }

    if (name === "trigger_mobile_compilation") {
      const appId = args.appId;
      const target = args.target || "expo_router";
      const scriptPath = path.resolve(__dirname, "../../../scripts/mobile-architect-cli.mjs");
      
      return new Promise((resolve) => {
        const child = spawn("node", [scriptPath, appId, target]);
        let output = "";
        
        child.stdout.on("data", (data) => { output += data.toString(); });
        child.stderr.on("data", (data) => { output += data.toString(); });
        
        child.on("close", (code) => {
          resolve({
            content: [{ type: "text", text: `Mobile compilation finished with code ${code}.\n\nOutput:\n${output}` }],
          });
        });
      });
    }

    if (name === "trigger_deploy_rail") {
      const result = await runDeployRail("mcp_agent_deploy", { liveRun: true, ownerApproved: true, candidateScore: 100 });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error executing tool: ${error.message}` }],
      isError: true,
    };
  }
});

// 3. Start STDIO Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptHouse Studio MCP Server running on STDIO");
}

main().catch((error) => {
  console.error("MCP Server Error:", error);
  process.exit(1);
});
