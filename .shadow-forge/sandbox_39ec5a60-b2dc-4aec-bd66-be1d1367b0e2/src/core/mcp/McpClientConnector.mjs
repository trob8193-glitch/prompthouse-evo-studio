import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

let mcpClient = null;
let isConnected = false;

export async function getIdeMcpClient() {
  if (isConnected && mcpClient) return mcpClient;

  const transport = new SSEClientTransport(new URL("http://localhost:5174/ide/sse"));
  mcpClient = new Client({
    name: "Evo-Studio-Client",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  try {
    await mcpClient.connect(transport);
    isConnected = true;
    console.log("[IDE Bridge] Successfully bonded with Antigravity God-Mode MCP Server.");
  } catch (error) {
    console.error("[IDE Bridge] Failed to connect to Antigravity MCP:", error.message);
    isConnected = false;
  }

  return mcpClient;
}

export async function executeIdeAction(actionName, args) {
  const client = await getIdeMcpClient();
  if (!client || !isConnected) {
    throw new Error("IDE Bond is offline. Ensure ide-god-mode-mcp-server is running.");
  }

  try {
    const result = await client.callTool({
      name: actionName,
      arguments: args
    });
    
    if (result.isError) {
      throw new Error(result.content[0].text);
    }
    
    return result.content[0].text;
  } catch (err) {
    console.error(`[IDE Bridge] Tool ${actionName} failed:`, err);
    throw err;
  }
}
