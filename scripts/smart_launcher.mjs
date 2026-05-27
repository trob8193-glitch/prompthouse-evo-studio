import net from 'net';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findOpenPort(startPort) {
  let port = startPort;
  while (!(await checkPort(port))) {
    port++;
    if (port > startPort + 100) throw new Error(`No open ports found near ${startPort}`);
  }
  return port;
}

function updateEnv(bridgePort, vitePort) {
  const envPath = path.join(rootDir, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  // Update or append BRIDGE_PORT
  if (envContent.includes('BRIDGE_PORT=')) {
    envContent = envContent.replace(/BRIDGE_PORT=.*/g, `BRIDGE_PORT=${bridgePort}`);
  } else {
    envContent += `\nBRIDGE_PORT=${bridgePort}`;
  }

  // Update or append VITE_BRIDGE_URL
  const bridgeUrl = `http://127.0.0.1:${bridgePort}`;
  if (envContent.includes('VITE_BRIDGE_URL=')) {
    envContent = envContent.replace(/VITE_BRIDGE_URL=.*/g, `VITE_BRIDGE_URL=${bridgeUrl}`);
  } else {
    envContent += `\nVITE_BRIDGE_URL=${bridgeUrl}`;
  }

  // Update or append CORS_ORIGINS
  const corsOrigins = `http://localhost:${vitePort},http://127.0.0.1:${vitePort}`;
  if (envContent.includes('CORS_ORIGINS=')) {
    envContent = envContent.replace(/CORS_ORIGINS=.*/g, `CORS_ORIGINS=${corsOrigins}`);
  } else {
    envContent += `\nCORS_ORIGINS=${corsOrigins}`;
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
}

async function startSmartLauncher() {
  console.log('\n===================================================');
  console.log('🚀 PromptHouse Smart Launcher: Collision Detection');
  console.log('===================================================');

  console.log('🔍 Scanning for open ports...');
  const bridgePort = await findOpenPort(3001);
  const vitePort = await findOpenPort(5173);

  console.log(`✅ Reserved API Bridge Port: ${bridgePort}`);
  console.log(`✅ Reserved Frontend Port: ${vitePort}`);

  console.log('📝 Updating local environment mapping...');
  updateEnv(bridgePort, vitePort);

  console.log('🌐 Booting autonomous sub-systems...');
  console.log('===================================================\n');

  // Launch Bridge
  const bridgeProc = spawn('node', ['promptbridge-server.js'], { stdio: 'inherit', cwd: rootDir, shell: true });
  
  // Wait a split second to let bridge initialize
  setTimeout(() => {
    const viteProc = spawn('npm', ['run', 'dev', '--', '--port', vitePort.toString()], { stdio: 'inherit', cwd: rootDir, shell: true });
    
    // Kill processes on exit
    const cleanup = () => {
      console.log('\n🛑 Shutting down Smart Launcher instances...');
      if (!bridgeProc.killed) bridgeProc.kill();
      if (!viteProc.killed) viteProc.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }, 1000);
}

startSmartLauncher().catch(err => {
  console.error('❌ Smart Launcher crashed:', err);
});
