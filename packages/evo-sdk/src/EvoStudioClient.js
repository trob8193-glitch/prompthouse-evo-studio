import WebSocket from 'ws';

export class EvoStudioClient {
  constructor(gatewayUrl = 'ws://127.0.0.1:3001') {
    this.gatewayUrl = gatewayUrl;
    this.ws = null;
    this.agents = new Map();
  }

  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    agent.setClient(this);
    console.log(`[EvoStudioClient] Registered agent: ${agent.name} (${agent.id})`);
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.gatewayUrl);

      this.ws.on('open', () => {
        console.log(`[EvoStudioClient] Connected to gateway at ${this.gatewayUrl}`);
        
        // Broadcast all registered agents to the studio
        for (const agent of this.agents.values()) {
          this.ws.send(JSON.stringify({
            type: 'REGISTER_AGENT',
            payload: {
              id: agent.id,
              name: agent.name,
              personality: agent.personality,
              avatar: agent.avatar,
              tools: agent.tools
            }
          }));
        }
        resolve();
      });

      this.ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data);
          if (msg.type === 'AGENT_MESSAGE') {
            const { agentId, text, history } = msg.payload;
            const agent = this.agents.get(agentId);
            if (agent) {
              await agent.receiveMessage(text, history);
            }
          }
        } catch (e) {
          console.error('[EvoStudioClient] Failed to parse message:', e);
        }
      });

      this.ws.on('close', () => {
        console.log('[EvoStudioClient] Disconnected from gateway. Retrying in 5s...');
        setTimeout(() => this.connect(), 5000);
      });

      this.ws.on('error', (err) => {
        console.error('[EvoStudioClient] WebSocket error:', err.message);
      });
    });
  }

  sendMessage(agentId, text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'AGENT_REPLY',
        payload: {
          agentId,
          text
        }
      }));
    }
  }
}
