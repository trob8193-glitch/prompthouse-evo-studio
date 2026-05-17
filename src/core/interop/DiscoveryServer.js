import dgram from 'dgram';
import { Log } from '../autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — DISCOVERY SERVER (UDP Edition)
 * ═══════════════════════════════════════════════════════════════
 * Allows the studio to be physically discoverable on the local network.
 * Listening on UDP Port 5555 for Truth-Signed Handshakes.
 */
export class DiscoveryServer {
  constructor() {
    this.socket = dgram.createSocket('udp4');
    this.port = 5555;
  }

  start() {
    this.socket.on('error', (err) => {
      Log.error(`📡 [DiscoveryServer] Socket error: ${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (msg, rinfo) => {
      Log.info(`📡 [DiscoveryServer] Inbound Handshake from ${rinfo.address}:${rinfo.port}`);
      // Future: Implement Sovereign Auth Handshake here
    });

    this.socket.on('listening', () => {
      const address = this.socket.address();
      Log.success(`📡 [DiscoveryServer] ACTIVE and LISTENING at ${address.address}:${address.port}`);
    });

    try {
      this.socket.bind(this.port);
    } catch (err) {
      Log.error(`📡 [DiscoveryServer] Bind Failed: ${err.message}`);
    }
  }

  stop() {
    this.socket.close();
  }
}

export const DISCOVERY_SERVER = new DiscoveryServer();
