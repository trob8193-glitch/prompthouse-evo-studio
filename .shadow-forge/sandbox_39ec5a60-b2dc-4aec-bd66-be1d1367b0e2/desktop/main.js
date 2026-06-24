const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startDaemonHost } = require('../src/runtime/DaemonHost');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL('http://localhost:5173').catch(() => {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  });

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  startDaemonHost({ rootDir: process.cwd() });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});