import { WebSocketServer } from 'ws';

export function setupWebSocketBridge(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  let connectedDevices = [];

  wss.on('connection', (ws) => {
    console.log('[WebSocket Bridge] Device connected');
    const deviceId = `mobile_${Date.now()}`;
    const device = { id: deviceId, ws, connectedAt: Date.now() };
    connectedDevices.push(device);

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message);
        console.log(`[WebSocket Bridge] Received from ${deviceId}:`, payload.type);
        
        // Handle ping/pong for real latency testing
        if (payload.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (err) {
        console.error('[WebSocket Bridge] Failed to parse message', err);
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket Bridge] Device ${deviceId} disconnected`);
      connectedDevices = connectedDevices.filter(d => d.id !== deviceId);
    });
    
    // Send initial connection success
    ws.send(JSON.stringify({ type: 'connected', deviceId }));
  });

  return {
    getConnectedDevices: () => connectedDevices,
    broadcast: (msg) => {
      const payload = JSON.stringify(msg);
      connectedDevices.forEach(d => d.ws.send(payload));
    }
  };
}
