import { getEvoWiFiStatus, getEvoWiFiTopology, evaluateBrainRoute, listBonds } from '../src/core/signals/EvoWiFi.js';
import os from 'os';
import { execSync } from 'child_process';

function sendOk(res, payload = {}) {
  return res.json({ success: true, ...payload });
}

function sendFailure(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error?.message || String(error) });
}

export default function registerEvoWiFiRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/evo-wifi/status', async (req, res) => {
    try {
      const status = await getEvoWiFiStatus(rootDir);
      sendOk(res, status);
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.get('/api/evo-wifi/topology', async (req, res) => {
    try {
      const topology = await getEvoWiFiTopology(rootDir);
      sendOk(res, topology);
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.get('/api/evo-wifi/devices', (req, res) => {
    try {
      const bonds = listBonds(rootDir);
      sendOk(res, { devices: bonds.map(b => b.deviceName) });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.get('/api/evo-wifi/scan', (req, res) => {
    try {
      const discovered = [];
      
      // 1. Get this machine's own local IPs
      const interfaces = os.networkInterfaces();
      let hostIp = null;
      for (const [name, nets] of Object.entries(interfaces)) {
        for (const net of nets) {
          if (!net.internal && net.family === 'IPv4') {
            hostIp = net.address;
            discovered.push({ 
              ip: net.address, 
              type: 'SELF', 
              name: `This PC (${name})`, 
              mac: net.mac || 'unknown',
              status: 'active'
            });
          }
        }
      }
      
      // 2. Run ARP table scan to find real devices on the network
      try {
        const arpOutput = execSync('arp -a', { encoding: 'utf-8', timeout: 5000 });
        const lines = arpOutput.split('\n');
        for (const line of lines) {
          // Windows ARP format: "  192.168.1.1       aa-bb-cc-dd-ee-ff     dynamic"
          const match = line.match(/\s+([\d.]+)\s+([\w-]+)\s+(dynamic|static)/i);
          if (match) {
            const ip = match[1];
            const mac = match[2];
            const isDynamic = match[3].toLowerCase() === 'dynamic';
            
            // Skip multicast and broadcast addresses
            if (ip.startsWith('224.') || ip.startsWith('239.') || ip.endsWith('.255')) continue;
            // Skip self
            if (hostIp && ip === hostIp) continue;
            
            // Guess device type from IP
            let type = 'UNKNOWN';
            let name = `Device ${ip}`;
            if (ip.endsWith('.1')) { type = 'GATEWAY'; name = 'Network Gateway/Router'; }
            else if (isDynamic) { type = 'WIFI_DEVICE'; name = `Wi-Fi Device (${ip})`; }
            else { type = 'STATIC_NODE'; name = `Static Node (${ip})`; }
            
            discovered.push({ ip, type, name, mac, status: 'active' });
          }
        }
      } catch (arpErr) {
        // ARP scan failed, still return what we have from OS interfaces
        console.warn('[EvoWiFi Scan] ARP scan failed:', arpErr.message);
      }
      
      sendOk(res, { discovered, hostIp, scannedAt: new Date().toISOString() });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.post('/api/evo-wifi/route-intent', async (req, res) => {
    try {
      const body = req.body || {};
      const status = await getEvoWiFiStatus(rootDir);
      const bonds = listBonds(rootDir);
      
      const routingDecision = evaluateBrainRoute(body, status, bonds);
      sendOk(res, routingDecision);
    } catch (error) {
      sendFailure(res, error);
    }
  });
}
