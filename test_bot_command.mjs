import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("🚀 Simulating External IDE MCP Connection...");
  
  const transport = new StdioClientTransport({
    command: "node",
    args: ["src/core/mcp/McpServerDaemon.mjs"]
  });
  
  const client = new Client(
    { name: "antigravity-test-client", version: "1.0.0" },
    { capabilities: {} }
  );
  
  await client.connect(transport);
  
  console.log("✅ Connected to Studio MCP Daemon.");
  console.log("🤖 Commanding Cipher Lynx to state its directive...\n");
  
  const response = await client.callTool({
    name: "summon_evo_bot",
    arguments: {
      botId: "cipher_lynx",
      message: "Are you online and physically present? State your core directive in exactly one sentence."
    }
  });
  
  console.log("===============================");
  console.log(response.content[0].text);
  console.log("===============================");
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
