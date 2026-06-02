import WebSocket from 'ws';
import crypto from 'crypto';

export class EvoAgent {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.name = config.name || 'EvoBot';
    this.avatar = config.avatar || '🤖';
    this.personality = config.personality || 'A helpful assistant.';
    this.bridgeUrl = config.bridgeUrl || 'ws://127.0.0.1:3001';
    
    this.ws = null;
    this.messageHandler = null;
  }

  /**
   * Connects to the Evo Studio WebSocket Bridge.
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.bridgeUrl);

      this.ws.on('open', () => {
        console.log(`[EvoAgent] Connected to ${this.bridgeUrl}`);
        
        // Register the agent with the studio
        this.ws.send(JSON.stringify({
          type: 'REGISTER_AGENT',
          payload: {
            id: this.id,
            name: this.name,
            avatar: this.avatar,
            personality: this.personality
          }
        }));
        
        resolve();
      });

      this.ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'AGENT_MESSAGE' && msg.payload.agentId === this.id) {
            console.log(`[EvoAgent] Received message: ${msg.payload.text}`);
            if (this.messageHandler) {
              await this.messageHandler(msg.payload.text, msg.payload.history);
            }
          }
        } catch (err) {
          console.error('[EvoAgent] Error processing message:', err.message);
        }
      });

      this.ws.on('error', (err) => {
        console.error('[EvoAgent] WebSocket Error:', err.message);
        reject(err);
      });

      this.ws.on('close', () => {
        console.log('[EvoAgent] Disconnected from studio.');
      });
    });
  }

  /**
   * Registers a callback handler for incoming messages from the Studio Copilot.
   * @param {Function} handler - async (text, history) => void
   */
  onMessage(handler) {
    this.messageHandler = handler;
  }

  /**
   * Sends a message back to the Studio Copilot UI.
   * @param {string} text - The response text.
   */
  send(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected.');
    }

    this.ws.send(JSON.stringify({
      type: 'AGENT_REPLY',
      payload: {
        agentId: this.id,
        text
      }
    }));
  }

  /**
   * Disconnects from the Studio Bridge.
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
