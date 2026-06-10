#!/usr/bin/env node

import fs from 'fs';
import net from 'net';
import path from 'path';
import { execFileSync, spawn } from 'child_process';

const rootDir = process.cwd();
const outDir = path.join(rootDir, '.ai', 'outbox');
fs.mkdirSync(outDir, { recursive: true });

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.setTimeout(750, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + 60; port += 1) {
    if (!(await isPortOpen(port))) return port;
  }
  throw new Error(`No free port found near ${start}`);
}

async function waitForHttp(url, timeoutMs = 30000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;
    }
    await sleep(500);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

function startProcess(command, args) {
  return spawn(command, args, {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    shell: process.platform === 'win32' && command.endsWith('.cmd'),
    env: { ...process.env, BROWSER: 'none' }
  });
}

function stopProcess(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      child.kill('SIGTERM');
    }
  } else {
    child.kill('SIGTERM');
  }
  child.stdout?.destroy();
  child.stderr?.destroy();
}

function ensureBuild() {
  const indexPath = path.join(rootDir, 'dist', 'index.html');
  if (!fs.existsSync(indexPath) || process.argv.includes('--build')) {
    execFileSync(npmCmd, ['run', 'build'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
  }
}

async function clickButtonByText(page, label) {
  const button = page.locator('button').filter({ hasText: label });
  const count = await button.count();
  if (count < 1) {
    const sample = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    throw new Error(`Button not found: ${label}. Visible text sample: ${sample.slice(0, 600)}`);
  }
  await button.first().click({ timeout: 10000 });
}

async function runBrowserProof() {
  ensureBuild();

  const startedProcesses = [];
  let browser = null;
  try {
    const bridgeAlreadyRunning = await isPortOpen(3001);
    if (!bridgeAlreadyRunning) {
      const bridge = startProcess(nodeCmd, ['promptbridge-server.js']);
      startedProcesses.push(bridge);
    }

    await waitForHttp((globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '/status', 30000);

    const previewPort = await findFreePort(4173);
    const preview = startProcess(nodeCmd, [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort']);
    startedProcesses.push(preview);
    const previewUrl = `http://127.0.0.1:${previewPort}`;
    await waitForHttp(previewUrl, 30000);

    const apiChecks = {};
    for (const [name, url] of Object.entries({
      studio: (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '/api/studio/scan',
      security: (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '/api/security/audit',
      providers: (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '/api/provider-activation/status'
    })) {
      const response = await waitForHttp(url, 15000);
      apiChecks[name] = await response.json();
    }

    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto(previewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await clickButtonByText(page, 'ENTER DEMO MODE');
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    const clickedPages = [];
    for (const label of ['Settings & API', 'Deployment Center', 'Cost Firewall', 'Theme Evolution', 'Launch Proof']) {
      await clickButtonByText(page, label);
      await page.waitForTimeout(300);
      clickedPages.push(label);
    }

    const screenshotPath = path.join(outDir, 'studio-browser-proof.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const domSummary = await page.evaluate(() => ({
      title: document.title,
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      rootTextLength: document.body?.innerText?.length || 0,
      visibleTextSample: (document.body?.innerText || '').slice(0, 500)
    }));

    const failures = [];
    if (consoleErrors.length > 0) failures.push(`${consoleErrors.length} console errors`);
    if (pageErrors.length > 0) failures.push(`${pageErrors.length} page errors`);
    if (apiChecks.studio?.truthState !== 'STUDIO_SCAN_CLEAR') failures.push('studio scan not clear');
    if (apiChecks.security?.truthState !== 'SECURITY_AUDIT_CLEAR') failures.push('security audit not clear');
    if (domSummary.buttons < 10) failures.push('button surface count too low');
    if (domSummary.rootTextLength < 500) failures.push('rendered text too small');

    const report = {
      success: failures.length === 0,
      truthState: failures.length === 0 ? 'BROWSER_E2E_PROOF_CLEAR' : 'BROWSER_E2E_PROOF_FAILED',
      checkedAt: new Date().toISOString(),
      previewUrl,
      bridgeUrl: (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))),
      clickedPages,
      apiTruthStates: {
        studio: apiChecks.studio?.truthState,
        security: apiChecks.security?.truthState,
        providers: apiChecks.providers?.truthState
      },
      domSummary,
      consoleErrors,
      pageErrors,
      failures,
      screenshot: screenshotPath
    };

    const jsonPath = path.join(outDir, 'studio-browser-proof.json');
    const mdPath = path.join(outDir, 'studio-browser-proof.md');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    fs.writeFileSync(mdPath, [
      '# Studio Browser Proof',
      '',
      `- Truth State: ${report.truthState}`,
      `- Preview URL: ${report.previewUrl}`,
      `- Bridge URL: ${report.bridgeUrl}`,
      `- Clicked Pages: ${clickedPages.join(', ')}`,
      `- Buttons: ${domSummary.buttons}`,
      `- Console Errors: ${consoleErrors.length}`,
      `- Page Errors: ${pageErrors.length}`,
      `- Screenshot: ${screenshotPath}`,
      '',
      '## API Truth States',
      `- Studio: ${report.apiTruthStates.studio}`,
      `- Security: ${report.apiTruthStates.security}`,
      `- Providers: ${report.apiTruthStates.providers}`
    ].join('\n'), 'utf8');

    return report;
  } finally {
    if (browser) await browser.close().catch(() => {});
    for (const child of startedProcesses.reverse()) stopProcess(child);
  }
}

runBrowserProof()
  .then((report) => {
    console.log(JSON.stringify({
      success: report.success,
      truthState: report.truthState,
      clickedPages: report.clickedPages,
      failures: report.failures,
      screenshot: report.screenshot
    }, null, 2));
    if (!report.success) process.exit(1);
  })
  .catch((err) => {
    const failure = {
      success: false,
      truthState: 'BROWSER_E2E_PROOF_BLOCKED',
      checkedAt: new Date().toISOString(),
      error: err.message
    };
    fs.writeFileSync(path.join(outDir, 'studio-browser-proof.json'), JSON.stringify(failure, null, 2), 'utf8');
    console.error(JSON.stringify(failure, null, 2));
    process.exit(1);
  });
