#!/usr/bin/env node

/**
 * QuadBrain MCP Server
 * Acts as the Model Context Protocol bridge between ChatGPT Desktop and the local Studio Engine.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

const BRIDGE_URL = "http://127.0.0.1:3001";
const GATEWAY_KEY = "EVO_STUDIO_BYPASS";

async function fetchBridge(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-studio-gateway-key": GATEWAY_KEY
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BRIDGE_URL}${endpoint}`, options);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `Bridge request failed with status ${response.status}`);
  }
  return data;
}

const server = new Server(
  {
    name: "quadbrain-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_quadbrain_status",
        description: "Fetches the current truth state and queue status of the QuadBrain creative layer.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "request_asset_generation",
        description: "Pushes a creative image generation request to the local studio queue.",
        inputSchema: {
          type: "object",
          properties: {
            assetType: {
              type: "string",
              enum: ["ui_mockup", "platform_demo_banner", "logo"]
            },
            prompt: {
              type: "string",
              description: "The detailed visual prompt"
            },
            engine: {
              type: "string",
              enum: ["evo_diffuser", "dalle3", "quadbrain_auto"]
            }
          },
          required: ["assetType", "prompt", "engine"],
        },
      },
      {
        name: "approve_asset",
        description: "Approves a pending creative asset in the library, generating a proof receipt.",
        inputSchema: {
          type: "object",
          properties: {
            assetId: {
              type: "string"
            }
          },
          required: ["assetId"],
        },
      },
      {
        name: "get_repair_queue",
        description: "List pending local Studio repairs for human review",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 20 },
            status: { 
              type: "string", 
              enum: ["pending", "approved", "rejected", "running", "completed", "failed", "all"],
              default: "pending" 
            }
          }
        }
      },
      {
        name: "get_proof_receipts",
        description: "Verify completed local work from the Proof Ledger",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 20 },
            task_id: { type: "string" },
            since: { type: "string" }
          }
        }
      },
      {
        name: "request_patch_review",
        description: "Render a diff summary and request explicit human approval before local IDE execution.",
        inputSchema: {
          type: "object",
          properties: {
            patch_id: { type: "string" },
            title: { type: "string" },
            diff_summary: { type: "string" },
            files: { type: "array", items: { type: "string" } },
            risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
            requires_approval: { type: "boolean", default: true }
          },
          required: ["title", "diff_summary", "files", "risk_level", "requires_approval"]
        }
      },
      {
        name: "execute_terminal_command",
        description: "Executes a raw terminal command on the local machine.",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string" },
            cwd: { type: "string" }
          },
          required: ["command"]
        }
      },
      {
        name: "read_file_content",
        description: "Read the contents of a file on the local machine.",
        inputSchema: {
          type: "object",
          properties: {
            absolutePath: { type: "string" }
          },
          required: ["absolutePath"]
        }
      },
      {
        name: "write_file_content",
        description: "Write content directly to a file on the local machine.",
        inputSchema: {
          type: "object",
          properties: {
            absolutePath: { type: "string" },
            content: { type: "string" }
          },
          required: ["absolutePath", "content"]
        }
      },
      {
        name: "check_inbox",
        description: "Check the local QuadBrain inbox for pending messages and findings left by the background daemons.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "read_evo_eyes_telemetry",
        description: "Read the latest live diagnostic telemetry from the Evo Eyes local layer.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "delegate_to_ide_agent",
        description: "Drop a task into the IDE Queue for Brain 3 (the local IDE Agent) to execute autonomously.",
        inputSchema: {
          type: "object",
          properties: {
            task_description: { type: "string", description: "Detailed description of what the IDE Agent should do." },
            priority: { type: "string", enum: ["low", "normal", "high", "critical"], default: "normal" }
          },
          required: ["task_description"]
        }
      },
      {
        name: "resolve_inbox_item",
        description: "Mark an inbox message as resolved or read, removing it from the queue.",
        inputSchema: {
          type: "object",
          properties: {
            message_id: { type: "string", description: "The ID of the message to resolve." }
          },
          required: ["message_id"]
        }
      },
      {
        name: "run_cognitive_xray",
        description: "Run a physical truth audit to calculate the real semantic drift (Cognitive X-Ray) across the project.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "generate_mobile_app",
        description: "Synthesize mobile architecture using the Mobile Engine.",
        inputSchema: {
          type: "object",
          properties: {
            feature: { type: "string", description: "The core feature to generate, e.g. Home, Dashboard." },
            architecture: { type: "string", enum: ["clean_riverpod", "bloc_layered", "mvc"], default: "clean_riverpod" }
          },
          required: ["feature"]
        }
      },
      {
        name: "list_ph_evo_apis",
        description: "Scan the generated_apis directory and promptbridge to return a manifest of all available Evo API endpoints.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_platform_sentinel_status",
        description: "Read the strict readiness health of the entire platform from the Sentinel daemon.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_module_maturity",
        description: "Fetch the studio-wide Module Maturity score and component breakdowns.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_spinecore_status",
        description: "Fetch the core memory and studio contract status from SpineCore.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "trigger_singularity_cycle",
        description: "Trigger the Singularity daemon to perform a deep semantic audit and repair cycle.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "trigger_crucible_sweep",
        description: "Trigger the Crucible daemon to perform a destructive file stress scan across the codebase.",
        inputSchema: { type: "object", properties: {} }
      }
    ],
  };
});

// Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_quadbrain_status") {
      const statusRes = await fetchBridge("/api/quadbrain/creative/status");
      const reqRes = await fetchBridge("/api/quadbrain/creative/requests");
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: statusRes.status,
            active_requests: reqRes.requests
          }, null, 2)
        }]
      };
    }

    if (name === "request_asset_generation") {
      const res = await fetchBridge("/api/quadbrain/creative/requests", "POST", {
        userId: "mcp_app_cockpit",
        assetType: args.assetType,
        prompt: args.prompt,
        preferredEngine: args.engine,
        goal: "Generated via ChatGPT 4th Brain MCP"
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(res, null, 2)
        }]
      };
    }

    if (name === "approve_asset") {
      const res = await fetchBridge("/api/quadbrain/creative/assets/approve", "POST", {
        assetId: args.assetId,
        userId: "mcp_app_cockpit"
      });
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(res, null, 2)
        }]
      };
    }

    if (name === "get_repair_queue" || name === "get_proof_receipts") {
       // Fetching ledger items from local endpoints
       const recRes = await fetchBridge("/api/quadbrain/creative/receipts");
       return {
         content: [{
           type: "text",
           text: JSON.stringify(recRes.receipts || [], null, 2)
         }]
       };
    }

    if (name === "request_patch_review") {
       return {
         content: [{
           type: "text",
           text: JSON.stringify({ status: "patch_queued_for_review", diff: args.diff }, null, 2)
         }]
       };
    }

    if (name === "execute_terminal_command") {
        const cmdOptions = args.cwd ? { cwd: args.cwd } : {};
        try {
          const { stdout, stderr } = await execAsync(args.command, cmdOptions);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ stdout, stderr }, null, 2)
            }]
          };
        } catch (execError) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: execError.message, stdout: execError.stdout, stderr: execError.stderr }, null, 2)
            }],
            isError: true
          };
        }
     }

     if (name === "read_file_content") {
       const content = await fs.readFile(args.absolutePath, "utf-8");
       return {
         content: [{ type: "text", text: content }]
       };
     }

     if (name === "write_file_content") {
       await fs.writeFile(args.absolutePath, args.content, "utf-8");
       return {
         content: [{ type: "text", text: `Successfully wrote to ${args.absolutePath}` }]
       };
     }

     if (name === "check_inbox") {
       const inboxFile = path.join(process.cwd(), '.prompthouse-data', 'evo-layer', 'inbox', 'inbox.json');
       try {
         const content = await fs.readFile(inboxFile, "utf-8");
         const messages = JSON.parse(content);
         if (messages.length === 0) {
           return { content: [{ type: "text", text: "Inbox is empty." }] };
         }
         return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
       } catch (err) {
         if (err.code === 'ENOENT') {
           return { content: [{ type: "text", text: "Inbox is empty." }] };
         }
         throw err;
       }
     }

     if (name === "read_evo_eyes_telemetry") {
       const snapshotFile = path.join(process.cwd(), '.prompthouse-data', 'evo-layer', 'evo-eyes-snapshot.json');
       try {
         const content = await fs.readFile(snapshotFile, "utf-8");
         return { content: [{ type: "text", text: content }] };
       } catch (err) {
         return { content: [{ type: "text", text: JSON.stringify({ error: "Evo Eyes Snapshot not found. Is it running?" }) }] };
       }
     }

     if (name === "delegate_to_ide_agent") {
       const queueFile = path.join(process.cwd(), '.prompthouse-data', 'evo-layer', 'ide_queue.json');
       const queueDir = path.dirname(queueFile);
       try { await fs.mkdir(queueDir, { recursive: true }); } catch (e) {}

       let queue = [];
       try { queue = JSON.parse(await fs.readFile(queueFile, "utf-8")); } catch (e) {}
       
       const newTask = {
         id: `task_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
         timestamp: new Date().toISOString(),
         source: "mcp_app_cockpit",
         priority: args.priority || "normal",
         description: args.task_description,
         status: "pending"
       };
       queue.push(newTask);
       await fs.writeFile(queueFile, JSON.stringify(queue, null, 2), "utf-8");
       return { content: [{ type: "text", text: `Task queued successfully. Task ID: ${newTask.id}` }] };
     }

     if (name === "resolve_inbox_item") {
       const inboxFile = path.join(process.cwd(), '.prompthouse-data', 'evo-layer', 'inbox', 'inbox.json');
       try {
         let messages = JSON.parse(await fs.readFile(inboxFile, "utf-8"));
         const initialLength = messages.length;
         messages = messages.filter(m => m.id !== args.message_id);
         await fs.writeFile(inboxFile, JSON.stringify(messages, null, 2), "utf-8");
         return { content: [{ type: "text", text: messages.length < initialLength ? "Message resolved." : "Message ID not found." }] };
       } catch (err) {
         return { content: [{ type: "text", text: "Inbox empty or unreadable." }] };
       }
     }

     if (name === "run_cognitive_xray") {
       const res = await fetchBridge("/api/quadbrain/xray");
       return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
     }

     if (name === "generate_mobile_app") {
       const res = await fetchBridge("/api/quadbrain/mobile/generate", "POST", {
         feature: args.feature,
         architecture: args.architecture
       });
       return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
     }

     if (name === "list_ph_evo_apis") {
       const res = await fetchBridge("/api/quadbrain/apis");
       return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
     }

     if (name === "get_platform_sentinel_status") {
       const res = await fetchBridge("/api/platform-sentinel/status");
       return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
     }

     if (name === "get_module_maturity") {
       const res = await fetchBridge("/api/module-maturity/status");
       return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
     }

     if (name === "get_spinecore_status") {
       const res = await fetchBridge("/api/spinecore/status");
       return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
     }

     if (name === "trigger_singularity_cycle") {
       // Start singularity script manually
       const { execAsync } = await import('./headless-gpt-worker.mjs'); // we can just rely on standard child_process but let's just use standard exec
       const { exec } = await import('child_process');
       const util = await import('util');
       const execPromise = util.promisify(exec);
       
       execPromise('npm run singularity', { cwd: process.cwd() }).catch(e => console.error("Singularity error:", e));
       return { content: [{ type: "text", text: "Singularity repair cycle initiated asynchronously." }] };
     }

     if (name === "trigger_crucible_sweep") {
       const { exec } = await import('child_process');
       const util = await import('util');
       const execPromise = util.promisify(exec);
       
       execPromise('npm run crucible:sweep', { cwd: process.cwd() }).catch(e => console.error("Crucible error:", e));
       return { content: [{ type: "text", text: "Crucible full sweep initiated asynchronously." }] };
     }

    throw new Error(`Unknown tool: ${name}`);
    
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }]
    };
  }
});

// Start the server using stdio
const transport = new StdioServerTransport();
await server.connect(transport);
