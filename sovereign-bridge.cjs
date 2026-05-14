const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

// NATIVE DISCOVERY & SMART BRIDGE
let DiscoveryServer, SmartBridge;
try {
  DiscoveryServer = require('./discovery-native.js').DiscoveryServer;
  SmartBridge = require('./smart-bridge-native.js').SmartBridge;
} catch (e) {
  console.log('[SovereignBridge] Native discovery modules not yet optimized.');
}

app.post('/api/proxy/fs/readFileSync', (req, res) => {
  try {
    const content = fs.readFileSync(req.body.path, 'utf8');
    res.json({ success: true, content });
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/system/write_file', (req, res) => {
  try {
    const dir = path.dirname(req.body.path);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(req.body.path, req.body.content);
    res.json({ success: true });
  } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/system/shell_exec', (req, res) => {
  exec(req.body.command, (err, stdout, stderr) => {
    res.json({ success: !err, output: stdout, error: stderr });
  });
});

app.post('/api/network/audit-grid', (req, res) => {
  if (DiscoveryServer) {
    const ds = new DiscoveryServer();
    ds.start();
    setTimeout(() => {
      res.json({ success: true, devices: ds.getDevices() });
      ds.stop();
    }, 5000);
  } else {
    res.json({ success: false, error: 'DISCOVERY_UNAVAILABLE' });
  }
});

app.listen(3001, () => {
  console.log('[SUCCESS] SovereignBridge listening on port 3001');
});
