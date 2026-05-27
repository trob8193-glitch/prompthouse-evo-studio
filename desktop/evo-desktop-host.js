import { app, BrowserWindow, shell, session } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const STUDIO_URL = process.env.EVO_STUDIO_URL || 'http://127.0.0.1:5173';
const BRIDGE_PORT = process.env.BRIDGE_PORT || '3001';
let bridgeProcess = null;

function launchBridge() {
  if (process.env.EVO_DESKTOP_SKIP_BRIDGE === 'true') return null;
  bridgeProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'bridge'], {
    cwd: ROOT_DIR,
    env: { ...process.env, BRIDGE_PORT },
    stdio: 'inherit',
    shell: false,
  });
  return bridgeProcess;
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    title: 'PH Evo Studio Desktop Host',
    backgroundColor: '#0a0e1a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadURL(STUDIO_URL);
  return win;
}

app.whenReady().then(() => {
  // Inject strict Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* wss://localhost:* https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.stripe.com;"
        ]
      }
    });
  });

  launchBridge();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('before-quit', () => {
  if (bridgeProcess && !bridgeProcess.killed) bridgeProcess.kill('SIGTERM');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
