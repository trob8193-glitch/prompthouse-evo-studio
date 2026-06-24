#!/usr/bin/env node
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('nuclear_audit');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const bridgeBase = process.env.PH_BRIDGE_AUDIT_URL || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))))));

async function fetchJson(pathname, label) {
  const url = `${bridgeBase}${pathname}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(`${label} returned ${response.status} ${contentType || 'unknown content type'} instead of JSON.`);
  }

  const data = JSON.parse(text);
  if (!response.ok) {
    throw new Error(`${label} returned ${response.status}: ${data.error || data.truthState || 'request failed'}`);
  }
  return data;
}

function runGate(label, command, required = true) {
  process.stdout.write(`   - ${label}... `);
  try {
    const output = execSync(command, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    console.log('PASS');
    return { label, command, required, status: 'PASSED', output: output.slice(-4000) };
  } catch (error) {
    console.log(required ? 'FAIL' : 'WARN');
    return {
      label,
      command,
      required,
      status: required ? 'FAILED' : 'WARNING',
      error: error.message,
      output: `${error.stdout || ''}${error.stderr || ''}`.slice(-4000)
    };
  }
}

function writeReports(results) {
  const outbox = path.join(root, '.ai', 'outbox');
  fs.mkdirSync(outbox, { recursive: true });
  const jsonPath = path.join(outbox, 'nuclear-audit-report.json');
  const mdPath = path.join(outbox, 'nuclear-audit-report.md');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');

  const failed = results.gates.filter(gate => gate.required && gate.status !== 'PASSED');
  const md = `# Singularity Edge Enterprise Audit
Generated: ${results.generatedAt}

## Truth Probe
- State: ${results.truthProbe?.truthState || 'UNAVAILABLE'}
- Modules: ${results.truthProbe?.results?.moduleCount ?? 'unknown'}
- Average Score: ${results.truthProbe?.results?.averageScore ?? 'unknown'}

## Studio Scan
- State: ${results.studioScan?.truthState || 'UNAVAILABLE'}
- Total Modules: ${results.studioScan?.total_modules ?? 'unknown'}
- Unresolved Routes: ${results.studioScan?.routes?.unresolved?.length ?? 'unknown'}

## Local Gates
${results.gates.map(gate => `- ${gate.status}: ${gate.label}`).join('\n')}

## Provider Evolution
- Status: ${results.providerEvolution.status}
- Detail: ${results.providerEvolution.detail}

## Final
- Status: ${failed.length === 0 ? 'LOCAL_SINGULARITY_EDGE_CLEAR' : 'LOCAL_SINGULARITY_EDGE_BLOCKED'}
`;
  fs.writeFileSync(mdPath, md, 'utf8');
  return { jsonPath, mdPath };
}

async function runProviderEvolutionIfAllowed() {
  if (process.env.PH_ALLOW_NUCLEAR_EVOLUTION !== 'true') {
    return {
      status: 'SKIPPED',
      detail: 'Provider-backed evolution missions require PH_ALLOW_NUCLEAR_EVOLUTION=true.'
    };
  }

  const count = Math.max(1, Math.min(Number(process.env.PH_NUCLEAR_EVOLUTION_COUNT || 1), 10));
  const missions = [];
  for (let index = 1; index <= count; index += 1) {
    missions.push(runGate(`Provider evolution mission ${index}`, 'npm run ai:loop', false));
  }
  return { status: 'ATTEMPTED', detail: `${count} provider-backed mission(s) attempted.`, missions };
}

async function runNuclearAudit() {
  console.log('\n[NUCLEAR_AUDIT] Starting singularity edge enterprise audit');
  console.log('============================================================');

  const results = {
    generatedAt: new Date().toISOString(),
    bridgeBase,
    truthProbe: null,
    studioScan: null,
    gates: [],
    providerEvolution: { status: 'PENDING', detail: '' },
    finalStatus: 'PENDING'
  };

  try {
    console.log('[1/4] Bridge truth probe');
    results.truthProbe = await fetchJson('/api/truth/probe', 'Truth probe');

    console.log('[2/4] Studio logic scan');
    results.studioScan = await fetchJson('/api/studio/scan', 'Studio scan');

    console.log('[3/4] Local enterprise gates');
    results.gates.push(runGate('route drift audit', 'node scripts/audit-route-drift.mjs'));
    results.gates.push(runGate('dead surface audit', 'node scripts/dead-surface-audit.mjs'));
    results.gates.push(runGate('enterprise static audit', 'node scripts/enterprise_audit.mjs'));
    results.gates.push(runGate('focused route/dead tests', 'npx vitest run tests/dead-surface-hunter.test.jsx tests/dead-surface-source-audit.test.js tests/navigation-contract.test.jsx tests/route-contract.test.js tests/route-registry.test.js tests/bridge-contract-ledger.test.js tests/studio_core_routes_contract.test.js'));

    console.log('[4/4] Provider-backed evolution gate');
    results.providerEvolution = await runProviderEvolutionIfAllowed();

    const failed = results.gates.filter(gate => gate.required && gate.status !== 'PASSED');
    results.finalStatus = failed.length === 0 ? 'LOCAL_SINGULARITY_EDGE_CLEAR' : 'LOCAL_SINGULARITY_EDGE_BLOCKED';
    const reports = writeReports(results);

    console.log('============================================================');
    console.log(`[NUCLEAR_AUDIT] ${results.finalStatus}`);
    console.log(`[NUCLEAR_AUDIT] Report: ${reports.mdPath}`);

    if (failed.length > 0) process.exit(1);
  } catch (err) {
    results.finalStatus = 'LOCAL_SINGULARITY_EDGE_FATAL';
    results.error = err.message;
    const reports = writeReports(results);
    console.error(`\n[NUCLEAR_AUDIT] Fatal: ${err.message}`);
    console.error(`[NUCLEAR_AUDIT] Report: ${reports.mdPath}`);
    process.exit(1);
  }
}

runNuclearAudit();
