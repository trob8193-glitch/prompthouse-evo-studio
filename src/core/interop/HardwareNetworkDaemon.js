import { GlobalSplitTether } from '../tethers/SplitTetherDaemon.js';
import { Log } from '../autonomy/SovereignLogger.js';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

/**
 * HARDWARE & NETWORK DAEMON (Studio Sensor Array)
 * ═══════════════════════════════════════════════════════════════
 * This daemon acts as the physical/digital sensor array for the
 * entire studio. It genuinely sweeps real local IP addresses, 
 * Bluetooth devices, wireless SSIDs, and API endpoints using OS
 * commands. 
 * 
 * All discovered telemetry is instantly broadcast across the
 * Split-Tether to give the AI context about its physical environment.
 */

export class HardwareNetworkDaemon {
  constructor() {
    this.status = 'OFFLINE';
    this.intervalId = null;
    this.telemetry = {
      wifi: { ssid: 'UNKNOWN', strength: 0, security: 'UNKNOWN' },
      bluetooth: [],
      network: { localIp: '127.0.0.1', interfaces: [] },
      api: { evoStatus: 'UNKNOWN', latencyMs: 0 }
    };
  }

  start() {
    this.status = 'ACTIVE';
    Log.info('[HardwareDaemon] Sensor array powered up. Commencing physical spatial network sweeps...');
    this._performSweep();
    // Continuous sweep every 60 seconds
    this.intervalId = setInterval(() => this._performSweep(), 60000);
    return this;
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.status = 'OFFLINE';
    Log.info('[HardwareDaemon] Sensor array powered down.');
  }

  async _performSweep() {
    try {
      // 1. IP Address Topology
      const nets = os.networkInterfaces();
      const interfaces = [];
      let localIp = '127.0.0.1';
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            localIp = net.address;
            interfaces.push({ name, ip: net.address, mac: net.mac, mask: net.netmask });
          }
        }
      }
      this.telemetry.network = { localIp, interfaces };

      // 2. Wireless (Windows)
      if (os.platform() === 'win32') {
        try {
          const { stdout } = await execAsync('netsh wlan show interfaces');
          const ssidMatch = stdout.match(/SSID\s*:\s*(.*)/);
          const signalMatch = stdout.match(/Signal\s*:\s*(\d+)%/);
          const authMatch = stdout.match(/Authentication\s*:\s*(.*)/);
          this.telemetry.wifi = {
            ssid: ssidMatch ? ssidMatch[1].trim() : 'UNKNOWN',
            strength: signalMatch ? parseInt(signalMatch[1].trim(), 10) : 0,
            security: authMatch ? authMatch[1].trim() : 'UNKNOWN'
          };
        } catch (e) {
          this.telemetry.wifi = { error: 'Not connected to Wi-Fi or netsh failed' };
        }
      }

      // 3. Bluetooth Beacons / Devices (Windows)
      if (os.platform() === 'win32') {
        try {
          const { stdout } = await execAsync('powershell -Command "Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq \'OK\' } | Select-Object -Property Name, Status | ConvertTo-Json"');
          if (stdout.trim()) {
            const devices = JSON.parse(stdout);
            this.telemetry.bluetooth = Array.isArray(devices) ? devices : [devices];
          } else {
            this.telemetry.bluetooth = [];
          }
        } catch (e) {
           this.telemetry.bluetooth = [{ error: 'Bluetooth scan failed or unavailable' }];
        }
      }

      // 4. API Connectivity
      try {
        const start = Date.now();
        const res = await fetch('https://api.github.com', { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        this.telemetry.api = {
          evoStatus: res.ok ? 'CONNECTED_ONLINE' : 'DEGRADED',
          latencyMs: Date.now() - start
        };
      } catch (e) {
        this.telemetry.api = { evoStatus: 'OFFLINE', latencyMs: -1 };
      }

      this._broadcastTelemetry();
    } catch (err) {
      Log.error(`[HardwareDaemon] Sweep error: ${err.message}`);
    }
  }

  _broadcastTelemetry() {
    import('../tethers/SplitTetherDaemon.js').then(({ GlobalSplitTether }) => {
      try {
        GlobalSplitTether.splitAndRoute('HardwareNetworkDaemon', {
          type: 'HARDWARE_TELEMETRY',
          data: this.telemetry
        });
      } catch {}
    }).catch(() => {});
  }
}

let globalDaemon = null;
export function getHardwareNetworkDaemon() {
  if (!globalDaemon) globalDaemon = new HardwareNetworkDaemon();
  return globalDaemon;
}
