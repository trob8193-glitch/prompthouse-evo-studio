const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'bridge_ignition.log');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${msg}\n`);
}

// 1. Start the Bridge
log('🚀 Starting PromptBridge Server...');
const bridge = spawn('node', ['promptbridge-server.js'], { stdio: 'pipe' });

bridge.stdout.on('data', (data) => log(`[BRIDGE] ${data}`));
bridge.stderr.on('data', (data) => log(`[BRIDGE ERROR] ${data}`));

// 2. Start the Tunnel
log('🦁 Starting Sovereign Tunnel...');
const tunnel = spawn('npx', ['localtunnel', '--port', '3001'], { shell: true });

tunnel.stdout.on('data', (data) => {
  const output = data.toString();
  log(`[TUNNEL] ${output}`);
  if (output.includes('your url is:')) {
    const url = output.split('your url is:')[1].trim();
    log(`✅ SUCCESS: Tunnel Active at ${url}`);
    
    // 3. Update .env with the new Bridge URL
    let env = fs.readFileSync('.env', 'utf8');
    if (env.includes('BRIDGE_URL=')) {
        env = env.replace(/BRIDGE_URL=.*/, `BRIDGE_URL=${url}`);
    } else {
        env += `\nBRIDGE_URL=${url}`;
    }
    fs.writeFileSync('.env', env);
    log('📁 Updated .env with the Tunnel URL.');
  }
});

tunnel.stderr.on('data', (data) => log(`[TUNNEL ERROR] ${data}`));

process.on('exit', () => {
  bridge.kill();
  tunnel.kill();
});
