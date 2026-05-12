import dgram from 'dgram';
import { Log } from '../autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — DISCOVERY SERVER
 * ═══════════════════════════════════════════════════════════════
 * Listens for and responds to physical UDP discovery packets on the LAN.
 * This makes the studio discoverable to other Sovereign nodes.
 */
export class DiscoveryServer {
  constructor(port = 5555) {
    this.port = port;
    this.server = dgram.createSocket('udp4');
  }

  start() {
    this.server.on('error', (err) => {
      Log.error(`📡 [DiscoveryServer] Error: ${err.stack}`);
      this.server.close();
    });

    this.server.on('message', (msg, rinfo) => {
      const packet = msg.toString();
      if (packet === 'SOVEREIGN_PING') {
        Log.info(`📡 [DiscoveryServer] Handshake received from ${rinfo.address}:${rinfo.port}`);
        
        const response = Buffer.from('SOVEREIGN_PONG');
        this.server.send(response, rinfo.port, rinfo.address, (err) => {
          if (err) Log.error(`📡 [DiscoveryServer] Failed to respond to ${rinfo.address}`);
        });
      }
    });

    this.server.on('listening', () => {
      const address = this.server.address();
      Log.success(`📡 [DiscoveryServer] Discovery Server LISTENING on ${address.address}:${address.port}`);
    });

    this.server.bind(this.port);
  }

  stop() {
    this.server.close();
    Log.info('📡 [DiscoveryServer] Discovery Server STOPPED.');
  }
}

export const DISCOVERY_SERVER = new DiscoveryServer();
