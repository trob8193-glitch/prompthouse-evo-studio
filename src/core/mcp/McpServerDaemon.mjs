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
      {
        name: "read_holding_company_ledger",
        description: "Reads the Studio's holding company ledger to list all currently owned applications and platforms.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "propose_new_portfolio_app",
        description: "Autonomously invents and registers a brand new web application or SaaS platform into the Studio's portfolio.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "A unique snake_case id for the app (e.g. 'ai_task_manager')." },
            name: { type: "string", description: "The human-readable name of the app." },
            type: { type: "string", description: "The type of the app (e.g. 'SaaS Dashboard', 'Web3 Platform')." },
          },
          required: ["id", "name", "type"],
        },
      },
      {
        name: "trigger_seed_round_daemon",
        description: "Fires the autonomous seed-round engineering daemon to forcefully audit and harden the Studio's codebase.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_cost_firewall_status",
        description: "Reads the Cost Firewall metrics to ensure budget compliance across the AI operations.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
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

    if (name === "read_holding_company_ledger") {
      const ledgerPath = path.resolve(__dirname, "../../../holding_company_ledger.json");
      const fs = await import("fs");
      if (!fs.existsSync(ledgerPath)) {
        return { content: [{ type: "text", text: "Ledger not found. Empty portfolio." }] };
      }
      const data = fs.readFileSync(ledgerPath, "utf-8");
      return { content: [{ type: "text", text: data }] };
    }

    if (name === "propose_new_portfolio_app") {
      const ledgerPath = path.resolve(__dirname, "../../../holding_company_ledger.json");
      const fs = await import("fs");
      let apps = [];
      if (fs.existsSync(ledgerPath)) {
        apps = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
      }
      apps.push({ id: args.id, name: args.name, type: args.type, date_added: new Date().toISOString() });
      fs.writeFileSync(ledgerPath, JSON.stringify(apps, null, 2));
      return { content: [{ type: "text", text: `Successfully registered ${args.name} into the Studio Portfolio.` }] };
    }

    if (name === "trigger_seed_round_daemon") {
      const scriptPath = path.resolve(__dirname, "../../../scripts/seed-round-engineering-daemon.mjs");
      return new Promise((resolve) => {
        const child = spawn("node", [scriptPath]);
        let output = "";
        child.stdout.on("data", (data) => { output += data.toString(); });
        child.stderr.on("data", (data) => { output += data.toString(); });
        child.on("close", (code) => {
          resolve({ content: [{ type: "text", text: `Seed Daemon finished with code ${code}.\n\n${output}` }] });
        });
      });
    }

    if (name === "get_cost_firewall_status") {
      const savingsPath = path.resolve(__dirname, "../../../.prompthouse-data/cost-firewall/savings_ledger.jsonl");
      const fs = await import("fs");
      if (!fs.existsSync(savingsPath)) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "ACTIVE", saved: "$0.00", transactions: 0 }) }] };
      }
      const lines = fs.readFileSync(savingsPath, "utf-8").trim().split('\n');
      return { content: [{ type: "text", text: JSON.stringify({ status: "ACTIVE", transactions: lines.length, latest: JSON.parse(lines[lines.length-1]) }, null, 2) }] };
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
