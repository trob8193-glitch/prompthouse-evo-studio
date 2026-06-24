import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const app = express();
app.use(cors());
app.use(express.json());

const server = new Server(
  {
    name: "Antigravity-God-Mode-MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 1. Define the IDE Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ide_read_file",
        description: "Reads the content of a file from the local filesystem.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Absolute or relative path to the file." }
          },
          required: ["filePath"],
        },
      },
      {
        name: "ide_write_file",
        description: "Writes content to a file on the local filesystem.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Absolute or relative path to the file." },
            content: { type: "string", description: "The raw content to write." },
            overwrite: { type: "boolean", description: "Whether to overwrite if the file exists." }
          },
          required: ["filePath", "content"],
        },
      },
      {
        name: "ide_run_command",
        description: "Executes a terminal command on the local OS.",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string", description: "The bash/powershell command to execute." },
            cwd: { type: "string", description: "Optional working directory." }
          },
          required: ["command"],
        },
      },
      {
        name: "ide_grep_search",
        description: "Searches for a string pattern across files in a directory.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The string or regex to search for." },
            directory: { type: "string", description: "The directory to search in." }
          },
          required: ["query", "directory"],
        },
      }
    ],
  };
});

// 2. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "ide_read_file") {
      const fullPath = path.resolve(args.filePath);
      if (!fs.existsSync(fullPath)) {
        return { content: [{ type: "text", text: `Error: File not found at ${fullPath}` }], isError: true };
      }
      const data = fs.readFileSync(fullPath, "utf-8");
      return { content: [{ type: "text", text: data }] };
    }

    if (name === "ide_write_file") {
      const fullPath = path.resolve(args.filePath);
      if (fs.existsSync(fullPath) && args.overwrite !== true) {
        return { content: [{ type: "text", text: `Error: File already exists at ${fullPath}. Use overwrite=true.` }], isError: true };
      }
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, args.content, "utf-8");
      return { content: [{ type: "text", text: `Successfully wrote ${args.content.length} bytes to ${fullPath}` }] };
    }

    if (name === "ide_run_command") {
      const options = args.cwd ? { cwd: path.resolve(args.cwd) } : {};
      try {
        const { stdout, stderr } = await execAsync(args.command, options);
        return { content: [{ type: "text", text: `Stdout:\n${stdout}\n\nStderr:\n${stderr}` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Command Failed: ${err.message}\n${err.stdout}\n${err.stderr}` }], isError: true };
      }
    }

    if (name === "ide_grep_search") {
      const dir = path.resolve(args.directory);
      // Fallback simple node-based recursive search since grep/ripgrep isn't guaranteed across OS
      const results = [];
      const searchRecursive = (currentDir) => {
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const f of files) {
          if (f.name === 'node_modules' || f.name === '.git') continue;
          const fullPath = path.join(currentDir, f.name);
          if (f.isDirectory()) {
            searchRecursive(fullPath);
          } else if (f.isFile()) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              if (content.includes(args.query)) {
                results.push(fullPath);
              }
            } catch (e) { /* ignore binary/unreadable */ }
          }
        }
      };
      if (fs.existsSync(dir)) {
        searchRecursive(dir);
        return { content: [{ type: "text", text: results.length > 0 ? `Found in:\n${results.join('\n')}` : `No matches found for '${args.query}'` }] };
      }
      return { content: [{ type: "text", text: `Directory not found: ${dir}` }], isError: true };
    }

    throw new Error(`Unknown IDE tool: ${name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error executing IDE tool: ${error.message}` }],
      isError: true,
    };
  }
});

// 3. SSE Transport Setup
let sseTransport = null;

app.get("/ide/sse", async (req, res) => {
  sseTransport = new SSEServerTransport("/ide/message", res);
  await server.connect(sseTransport);
  console.log("Antigravity God-Mode MCP SSE Connection Established.");
});

app.post("/ide/message", async (req, res) => {
  if (sseTransport) {
    await sseTransport.handlePostMessage(req, res);
  } else {
    res.status(503).send("MCP SSE not connected");
  }
});

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`[Antigravity IDE] God-Mode MCP Server running on port ${PORT}`);
});
