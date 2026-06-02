import { WebSocketServer, WebSocket } from 'ws';
import { verifyAuthToken } from './auth-helpers.js';
import { Log } from '../../core/autonomy/SovereignLogger.js';

let wss = null;
const clients = new Map(); // ws -> metadata
const externalAgents = new Map(); // agentId -> { ws, metadata }

export function attachWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    clients.set(ws, { ip, authenticated: false, userId: null, isAgent: false });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle auth handshake
        if (data.type === 'auth') {
          try {
            const user = verifyAuthToken(data.token);
            const clientInfo = clients.get(ws);
            clientInfo.authenticated = true;
            clientInfo.userId = user.sub;
            ws.send(JSON.stringify({ type: 'auth_success' }));
            Log.info(`[WS] Client authenticated: ${user.email || user.sub}`);
          } catch (e) {
            ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
            ws.close(4001, 'Unauthorized');
          }
        }
        
        // Handle Agent Registration from SDK
        else if (data.type === 'REGISTER_AGENT') {
          const agentData = data.payload;
          const clientInfo = clients.get(ws);
          clientInfo.isAgent = true;
          clientInfo.agentIds = clientInfo.agentIds || [];
          clientInfo.agentIds.push(agentData.id);
          
          externalAgents.set(agentData.id, { ws, ...agentData });
          Log.info(`[WS] External Agent Registered: ${agentData.name} (${agentData.id})`);
          
          // Broadcast to all normal clients that roster updated
          broadcastRoster();
        }
        
        // Handle messages from React Copilot -> External Agent
        else if (data.type === 'CHAT_WITH_AGENT') {
          const { agentId, text, history } = data.payload;
          const agentInfo = externalAgents.get(agentId);
          if (agentInfo && agentInfo.ws.readyState === WebSocket.OPEN) {
            agentInfo.ws.send(JSON.stringify({
              type: 'AGENT_MESSAGE',
              payload: { agentId, text, history }
            }));
          }
        }
        
        // Handle replies from External Agent -> React Copilot
        else if (data.type === 'AGENT_REPLY') {
          const { agentId, text } = data.payload;
          // Broadcast reply to UI clients
          broadcastEvent('AGENT_MESSAGE_REPLY', { agentId, text });
        }
        
      } catch (e) {
        Log.error('[WS] Invalid message format', e);
      }
    });

    ws.on('close', () => {
      const clientInfo = clients.get(ws);
      if (clientInfo && clientInfo.isAgent && clientInfo.agentIds) {
        for (const id of clientInfo.agentIds) {
          externalAgents.delete(id);
          Log.info(`[WS] External Agent Disconnected: ${id}`);
        }
        broadcastRoster();
      }
      clients.delete(ws);
    });
  });

  Log.info('[WS] Server attached to Bridge HTTP server.');
}

export function broadcastEvent(event, payload, requireAuth = false) {
  if (!wss) return;
  const message = JSON.stringify({ type: event, payload });
  
  for (const [ws, info] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN && !info.isAgent) {
      if (!requireAuth || info.authenticated) {
        ws.send(message);
      }
    }
  }
}

function broadcastRoster() {
  const roster = Array.from(externalAgents.values()).map(a => ({
    id: a.id,
    name: a.name,
    personality: a.personality,
    avatar: a.avatar,
    tools: a.tools
  }));
  broadcastEvent('AGENT_ROSTER_UPDATE', roster);
}
