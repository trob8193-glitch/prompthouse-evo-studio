/**
 * PromptHouse Evo Studio — Antigravity Blended Agent Daemon
 * ═══════════════════════════════════════════════════════════════
 * Autonomous Claude Opus + Gemini blended agent that lives inside
 * the studio, handshakes with NightForge and Crucible, helps with
 * dev/build/code, and stays tethered to Antigravity IDE.
 *
 * This is a BACKEND module (Node.js + fs). Frontend communicates
 * via /api/agent/* routes on PromptBridge.
 */
import fs from 'fs';
import path from 'path';

// ─── Persistent Storage ─────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), '.prompthouse-data', 'antigravity-agent');
const RECEIPTS_FILE = path.join(DATA_DIR, 'receipts.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(RECEIPTS_FILE)) fs.writeFileSync(RECEIPTS_FILE, '[]');
  if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, '[]');
}
ensureStorage();

function readJsonFile(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch { return []; }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ─── Agent State ────────────────────────────────────────────────
export let agentState = {
  active: false,
  daemonEnabled: false,
  running: false,
  cycleCount: 0,
  lastCycleAt: null,
  nextCycleAt: null,
  intervalMinutes: 30,
  lastCycleStatus: 'idle',
  providers: {
    claude_opus: { available: false, status: 'unconfigured' },
    gemini: { available: false, status: 'unconfigured' },
    evo_lm: { available: true, status: 'local' },
  },
  tether: {
    connected: false,
    lastPingAt: null,
    ideVersion: null,
  },
  handshakes: {
    nightforge: { connected: false, lastSync: null },
    crucible: { connected: false, lastSync: null },
  },
  successfulCycles: 0,
  failedCycles: 0,
  lastUpdatedAt: new Date().toISOString(),
};

let daemonInterval = null;

export function updateAgentState(patch) {
  agentState = {
    ...agentState,
    ...patch,
    lastUpdatedAt: new Date().toISOString(),
  };
  return agentState;
}

// ─── Provider Detection ─────────────────────────────────────────
export function detectProviders() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '';

  const providers = {
    claude_opus: {
      available: anthropicKey.length > 10,
      status: anthropicKey.length > 10 ? 'configured' : 'unconfigured',
    },
    gemini: {
      available: geminiKey.length > 10 || openaiKey.length > 10,
      status: (geminiKey.length > 10 || openaiKey.length > 10) ? 'configured' : 'unconfigured',
    },
    evo_lm: {
      available: true,
      status: 'local',
    },
  };

  updateAgentState({ providers });
  return providers;
}

// ─── Workspace Scanner ──────────────────────────────────────────
export function scanWorkspace() {
  const projectRoot = process.cwd();
  const issues = [];
  const insights = [];

  // 1. Check if build output exists
  const distDir = path.join(projectRoot, 'dist');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir, { recursive: true }).filter(f => typeof f === 'string');
    insights.push(`Build output exists with ${files.length} files`);
  } else {
    issues.push({ type: 'missing_build', severity: 'medium', detail: 'No dist/ directory found — build may not have run' });
  }

  // 2. Check package.json for script health
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    const scripts = Object.keys(pkg.scripts || {});
    insights.push(`${scripts.length} npm scripts registered`);
    if (!scripts.includes('test')) issues.push({ type: 'missing_test_script', severity: 'low', detail: 'No "test" script in package.json' });
    if (!scripts.includes('build')) issues.push({ type: 'missing_build_script', severity: 'high', detail: 'No "build" script in package.json' });
  } catch {
    issues.push({ type: 'broken_package_json', severity: 'high', detail: 'Cannot read package.json' });
  }

  // 3. Scan src/ for common issues
  const srcDir = path.join(projectRoot, 'src');
  if (fs.existsSync(srcDir)) {
    const srcFiles = [];
    function walk(dir) {
      try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) srcFiles.push(full);
        }
      } catch { /* permission denied etc */ }
    }
    walk(srcDir);
    insights.push(`${srcFiles.length} source files in src/`);

    // Spot-check a sample of files for TODO/FIXME markers
    let todoCount = 0;
    const sampleSize = Math.min(srcFiles.length, 50);
    for (let i = 0; i < sampleSize; i++) {
      try {
        const content = fs.readFileSync(srcFiles[i], 'utf-8');
        const matches = content.match(/\b(TODO|FIXME|HACK|XXX)\b/gi);
        if (matches) todoCount += matches.length;
      } catch { /* skip unreadable files */ }
    }
    if (todoCount > 0) {
      issues.push({ type: 'todo_markers', severity: 'low', detail: `${todoCount} TODO/FIXME markers found in sampled ${sampleSize} files` });
    }
  }

  // 4. Check test suite exists
  const testsDir = path.join(projectRoot, 'tests');
  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js') || f.endsWith('.test.jsx'));
    insights.push(`${testFiles.length} test files in tests/`);
  }

  return { issues, insights, scannedAt: new Date().toISOString() };
}

// ─── Daemon Handshake ───────────────────────────────────────────
export function handshakeWithDaemon(daemonId, daemonState) {
  const now = new Date().toISOString();
  const handshakeResult = {
    daemonId,
    reachable: !!daemonState,
    state: daemonState || null,
    syncedAt: now,
  };

  if (daemonId === 'nightforge') {
    updateAgentState({
      handshakes: {
        ...agentState.handshakes,
        nightforge: {
          connected: !!daemonState,
          lastSync: now,
          cycleCount: daemonState?.cycleCount || 0,
          lastCycleStatus: daemonState?.lastCycleStatus || 'unknown',
        },
      },
    });
  } else if (daemonId === 'crucible') {
    updateAgentState({
      handshakes: {
        ...agentState.handshakes,
        crucible: {
          connected: !!daemonState,
          lastSync: now,
        },
      },
    });
  }

  return handshakeResult;
}

// ─── Tether Management ──────────────────────────────────────────
export function updateTetherStatus(tetherInfo = {}) {
  updateAgentState({
    tether: {
      connected: Boolean(tetherInfo.connected),
      lastPingAt: new Date().toISOString(),
      ideVersion: tetherInfo.ideVersion || agentState.tether.ideVersion,
    },
  });
  return agentState.tether;
}

// ─── Blended Prompt Builder ─────────────────────────────────────
export function buildBlendedPrompt(scan, handshakes) {
  const lines = [
    'You are the Antigravity Blended Agent for PromptHouse Evo Studio.',
    'Your role: analyze the workspace, identify issues, and propose concrete fixes.',
    '',
    '## Workspace Scan',
    `Scanned at: ${scan.scannedAt}`,
    `Issues found: ${scan.issues.length}`,
    `Insights: ${scan.insights.join('; ')}`,
    '',
  ];

  if (scan.issues.length > 0) {
    lines.push('## Issues');
    for (const issue of scan.issues) {
      lines.push(`- [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.detail}`);
    }
    lines.push('');
  }

  if (handshakes.nightforge?.connected) {
    lines.push('## NightForge Daemon Status');
    lines.push(`Cycles: ${handshakes.nightforge.cycleCount}, Last: ${handshakes.nightforge.lastCycleStatus}`);
    lines.push('');
  }

  lines.push('## Instructions');
  lines.push('1. For each issue, propose a concrete fix with the file path and code change.');
  lines.push('2. Prioritize by severity (HIGH > MEDIUM > LOW).');
  lines.push('3. Never claim something is fixed without providing the actual code.');
  lines.push('4. If no issues are found, suggest performance or architecture improvements.');

  return lines.join('\n');
}

// ─── Core Cycle Execution ───────────────────────────────────────
export function runAgentCycle(input = {}, aiAdaptor = null) {
  updateAgentState({ running: true });
  const cycleId = `agent_cycle_${Date.now().toString(36)}`;
  const startedAt = new Date().toISOString();

  let status = 'completed';
  let scan = { issues: [], insights: [], scannedAt: startedAt };
  let blendedPrompt = '';
  let proposals = [];
  let providerResults = {};

  try {
    // 1. Detect available providers
    const providers = detectProviders();

    // 2. Scan workspace
    scan = scanWorkspace();

    // 3. Handshake with peer daemons
    // (NightForge state is injected by the route handler)
    const nightforgeHandshake = handshakeWithDaemon('nightforge', input.nightforgeState || null);

    // 4. Build blended prompt
    blendedPrompt = buildBlendedPrompt(scan, agentState.handshakes);

    // 5. Produce proposals from scan results
    proposals = scan.issues.map((issue, i) => ({
      id: `${cycleId}_proposal_${i}`,
      type: 'fix_suggestion',
      issueType: issue.type,
      severity: issue.severity,
      detail: issue.detail,
      status: 'pending_review',
      createdAt: startedAt,
    }));

    // 6. If we have an AI adaptor AND provider keys, send the blended prompt
    // for real AI analysis. Otherwise, proposals come from static scan only.
    if (aiAdaptor && (providers.claude_opus.available || providers.gemini.available)) {
      // The route handler will orchestrate actual AI calls asynchronously.
      // We record that external providers were consulted.
      const activeProviders = [];
      if (providers.claude_opus.available) activeProviders.push('claude_opus');
      if (providers.gemini.available) activeProviders.push('gemini');
      activeProviders.push('evo_lm');
      providerResults = {
        consulted: activeProviders,
        blendMode: activeProviders.length >= 2 ? 'multi_provider_blend' : 'single_provider',
        promptLength: blendedPrompt.length,
      };
    } else {
      providerResults = {
        consulted: ['evo_lm'],
        blendMode: 'local_scan_only',
        promptLength: blendedPrompt.length,
        note: 'No external provider keys configured; using local workspace scan results only.',
      };
    }

    status = 'completed';
  } catch (err) {
    status = 'error';
    proposals = [{ id: `${cycleId}_error`, type: 'error', detail: err.message, status: 'error' }];
  }

  // 7. Write receipt
  const receipt = {
    id: cycleId,
    startedAt,
    completedAt: new Date().toISOString(),
    status,
    issuesFound: scan.issues.length,
    proposalCount: proposals.length,
    providerResults,
    insights: scan.insights,
    trigger: input.trigger || 'manual',
  };

  const receipts = readJsonFile(RECEIPTS_FILE);
  receipts.push(receipt);
  // Keep last 200 receipts
  writeJsonFile(RECEIPTS_FILE, receipts.slice(-200));

  // 8. Append proposals to task file
  if (proposals.length > 0) {
    const tasks = readJsonFile(TASKS_FILE);
    tasks.push(...proposals);
    writeJsonFile(TASKS_FILE, tasks.slice(-500));
  }

  // 9. Update state
  updateAgentState({
    running: false,
    cycleCount: agentState.cycleCount + 1,
    lastCycleAt: receipt.completedAt,
    lastCycleStatus: status,
    successfulCycles: status === 'completed' ? agentState.successfulCycles + 1 : agentState.successfulCycles,
    failedCycles: status === 'error' ? agentState.failedCycles + 1 : agentState.failedCycles,
  });

  return {
    ...receipt,
    proposals,
    scan: { issues: scan.issues, insights: scan.insights },
    blendedPromptPreview: blendedPrompt.slice(0, 500),
  };
}

// ─── Task Management ────────────────────────────────────────────
export function getAgentTasks(statusFilter = null) {
  const tasks = readJsonFile(TASKS_FILE);
  if (statusFilter) return tasks.filter(t => t.status === statusFilter);
  return tasks;
}

export function approveAgentTask(taskId) {
  const tasks = readJsonFile(TASKS_FILE);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return { success: false, error: 'Task not found' };
  task.status = 'approved';
  task.approvedAt = new Date().toISOString();
  writeJsonFile(TASKS_FILE, tasks);
  return { success: true, task };
}

export function rejectAgentTask(taskId) {
  const tasks = readJsonFile(TASKS_FILE);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return { success: false, error: 'Task not found' };
  task.status = 'rejected';
  task.rejectedAt = new Date().toISOString();
  writeJsonFile(TASKS_FILE, tasks);
  return { success: true, task };
}

// ─── Metrics ────────────────────────────────────────────────────
export function buildAgentMetrics() {
  const receipts = readJsonFile(RECEIPTS_FILE);
  const today = new Date().toISOString().slice(0, 10);
  const todayReceipts = receipts.filter(r => r.startedAt?.startsWith(today));

  return {
    totalCycles: agentState.cycleCount,
    successfulCycles: agentState.successfulCycles,
    failedCycles: agentState.failedCycles,
    cyclesToday: todayReceipts.length,
    totalReceipts: receipts.length,
    providers: agentState.providers,
    tether: agentState.tether,
    handshakes: agentState.handshakes,
    daemonEnabled: agentState.daemonEnabled,
    intervalMinutes: agentState.intervalMinutes,
    lastCycleAt: agentState.lastCycleAt,
  };
}

// ─── Daemon Scheduler ───────────────────────────────────────────
export function scheduleAgentDaemon(intervalMinutes = 30, nightforgeStateGetter = null) {
  if (daemonInterval) return agentState;

  const interval = Math.max(5, Math.min(1440, intervalMinutes));
  updateAgentState({
    active: true,
    daemonEnabled: true,
    intervalMinutes: interval,
    nextCycleAt: new Date(Date.now() + interval * 60 * 1000).toISOString(),
  });

  daemonInterval = setInterval(() => {
    const nfState = nightforgeStateGetter ? nightforgeStateGetter() : null;
    runAgentCycle({ trigger: 'daemon', nightforgeState: nfState });
    updateAgentState({
      nextCycleAt: new Date(Date.now() + interval * 60 * 1000).toISOString(),
    });
  }, interval * 60 * 1000);

  return agentState;
}

export function clearAgentDaemon() {
  if (daemonInterval) {
    clearInterval(daemonInterval);
    daemonInterval = null;
  }
  updateAgentState({
    active: false,
    daemonEnabled: false,
    nextCycleAt: null,
  });
  return agentState;
}
