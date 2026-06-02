// ═══════════════════════════════════════════════════════════════
//  Sovereign Deploy Rail — Physical App Scaffold Engine
//  Takes a LiveForge draft (HTML/CSS/JS) and physically creates
//  a real Vite project, injects components, and launches a dev server.
// ═══════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEPLOY_DIR = path.resolve(__dirname, '..', '..', 'deployed_apps');

if (!fs.existsSync(DEPLOY_DIR)) fs.mkdirSync(DEPLOY_DIR, { recursive: true });

// Track running dev servers
const runningServers = new Map();

/**
 * Scaffold a physical Vite project from a LiveForge draft.
 * @param {object} draft - { id, name, html, css, js }
 * @param {number} port - Port to run on (auto-assigned if 0)
 * @returns {{ projectDir, port, status }}
 */
export function scaffoldApp(draft, port = 0) {
  const appSlug = (draft.name || draft.id || 'app').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  const projectDir = path.join(DEPLOY_DIR, `${appSlug}_${Date.now()}`);

  // 1. Create project structure
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'public'), { recursive: true });

  // 2. Write package.json
  const packageJson = {
    name: appSlug,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    devDependencies: {
      vite: '^5.1.0'
    }
  };
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // 3. Write vite.config.js
  const viteConfig = `
import { defineConfig } from 'vite';
export default defineConfig({
  server: { port: ${port || 'undefined'}, strictPort: false, open: false },
});
`;
  fs.writeFileSync(path.join(projectDir, 'vite.config.js'), viteConfig);

  // 4. Write index.html
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${draft.name || 'LiveForge App'}</title>
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
${draft.html || '<div id="app">LiveForge App</div>'}
<script type="module" src="/src/main.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(projectDir, 'index.html'), indexHtml);

  // 5. Write CSS
  fs.writeFileSync(path.join(projectDir, 'src', 'style.css'), draft.css || '');

  // 6. Write JS
  fs.writeFileSync(path.join(projectDir, 'src', 'main.js'), draft.js || '// LiveForge generated app\nconsole.log("App initialized");');

  return { projectDir, appSlug, status: 'scaffolded' };
}

/**
 * Install dependencies and start the dev server for a scaffolded app.
 * @param {string} projectDir
 * @returns {{ port, pid, status }}
 */
export function launchApp(projectDir) {
  // Install deps
  try {
    execSync('npm install', { cwd: projectDir, stdio: 'pipe', timeout: 60000 });
  } catch (e) {
    return { port: null, pid: null, status: 'install_failed', error: e.message };
  }

  // Find a free port
  const assignedPort = 5200 + Math.floor(Math.random() * 800);

  // Start dev server
  const child = spawn('npx', ['vite', '--port', String(assignedPort)], {
    cwd: projectDir,
    shell: true,
    stdio: 'pipe',
    detached: true,
  });

  child.unref();

  const serverInfo = { port: assignedPort, pid: child.pid, projectDir, startedAt: new Date().toISOString() };
  runningServers.set(projectDir, serverInfo);

  return { ...serverInfo, status: 'running', url: `http://localhost:${assignedPort}` };
}

/**
 * Stop a running deployed app server.
 */
export function stopApp(projectDir) {
  const info = runningServers.get(projectDir);
  if (!info) return { status: 'not_found' };

  try {
    process.kill(info.pid);
  } catch { /* already stopped */ }

  runningServers.delete(projectDir);
  return { status: 'stopped', projectDir };
}

/**
 * List all deployed app servers.
 */
export function listDeployedApps() {
  const apps = [];
  if (fs.existsSync(DEPLOY_DIR)) {
    for (const dir of fs.readdirSync(DEPLOY_DIR)) {
      const fullPath = path.join(DEPLOY_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const running = runningServers.get(fullPath);
        apps.push({
          name: dir,
          path: fullPath,
          running: !!running,
          port: running?.port || null,
          pid: running?.pid || null,
        });
      }
    }
  }
  return apps;
}

export default { scaffoldApp, launchApp, stopApp, listDeployedApps };
