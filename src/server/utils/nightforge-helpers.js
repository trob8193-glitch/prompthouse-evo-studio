import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Log } from '../../core/autonomy/SovereignLogger.js';
import { dispatchEvolutionSignal } from './evolution-helpers.js';
import { ai, truthGate, userConfig, globalFirewallSavings, DATA_DIR } from '../core-deps.js';
import { CostFirewall } from '../../core/gateway/costFirewall.js';
import { ModelRouter } from '../../core/gateway/modelRouter.js';
import { toSafeJson } from './common-helpers.js';
import { buildStudioDiagnostics } from './diagnostic-helpers.js';
import { runEvoLmTeamChat, appendTrainingExamples } from './ai-helpers.js';
import { broadcastEvent } from './ws-helpers.js';

const NIGHTFORGE_STATE_FILE = join(DATA_DIR, 'nightforge_state.json');
const NIGHTFORGE_RECEIPTS_FILE = join(DATA_DIR, 'nightforge_receipts.jsonl');

let nightforgeState = null;
let nightforgeDaemonTimer = null;

function defaultNightforgeState() {
  return {
    active: false,
    running: false,
    intervalMinutes: 360,
    orgId: 'org_test',
    includeProviders: ['evo_lm', 'openai', 'gemini'],
    forceThreeProviderTeam: false,
    train: true,
    useLiveStudio: true,
    mode: 'cost_guarded',
    totalCycles: 0,
    successfulCycles: 0,
    failedCycles: 0,
    lastCycleAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastError: null,
    nextCycleAt: null,
    lastResult: null
  };
}

function loadNightforgeState() {
  const base = defaultNightforgeState();
  if (!existsSync(NIGHTFORGE_STATE_FILE)) return base;
  try {
    const raw = JSON.parse(readFileSync(NIGHTFORGE_STATE_FILE, 'utf8'));
    return { ...base, ...raw, running: false };
  } catch {
    return base;
  }
}

function saveNightforgeState(state) {
  writeFileSync(NIGHTFORGE_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function updateNightforgeState(patch) {
  if (!nightforgeState) nightforgeState = loadNightforgeState();
  nightforgeState = { ...nightforgeState, ...patch };
  saveNightforgeState(nightforgeState);
  return nightforgeState;
}

function clearNightforgeDaemon() {
  if (nightforgeDaemonTimer) {
    clearInterval(nightforgeDaemonTimer);
    nightforgeDaemonTimer = null;
  }
}

function readNightforgeReceipts() {
  if (!existsSync(NIGHTFORGE_RECEIPTS_FILE)) return [];
  try {
    const lines = readFileSync(NIGHTFORGE_RECEIPTS_FILE, 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
    return lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function buildNightforgeMetrics() {
  const receipts = readNightforgeReceipts();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayReceipts = receipts.filter((entry) => String(entry.timestamp || '').slice(0, 10) === todayIso);

  const providerMix = { evo_lm: 0, openai: 0, gemini: 0, other: 0 };
  for (const entry of todayReceipts) {
    for (const providerEntry of entry.providers || []) {
      const key = providerEntry.provider;
      if (key === 'evo_lm' || key === 'openai' || key === 'gemini') {
        providerMix[key] += 1;
      } else {
        providerMix.other += 1;
      }
    }
  }

  const cyclesToday = todayReceipts.length;
  const creditsToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.creditsUsed || 0), 0);
  const externalCallsToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.externalCalls || 0), 0);
  const cacheHitsToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.cacheHits || 0), 0);
  const savedTokensToday = todayReceipts.reduce((sum, entry) => sum + Number(entry.cost?.estimatedSavedTokens || 0), 0);

  const trend = receipts.slice(-10).map((entry) => ({
    id: entry.id,
    timestamp: entry.timestamp,
    creditsUsed: Number(entry.cost?.creditsUsed || 0),
    externalCalls: Number(entry.cost?.externalCalls || 0),
    cacheHits: Number(entry.cost?.cacheHits || 0),
    savedTokens: Number(entry.cost?.estimatedSavedTokens || 0)
  }));

  return {
    date: todayIso,
    cyclesToday,
    creditsToday,
    externalCallsToday,
    cacheHitsToday,
    savedTokensToday,
    providerMix,
    trend
  };
}

function buildNightforgeActions(diagnostics) {
  const actions = [];
  const failingProbes = (diagnostics?.probes || []).filter(item => !item.ok);
  if (failingProbes.length > 0) {
    actions.push({
      action: 'repair_failing_runtime_probes',
      priority: 'HIGH',
      note: `Probe failures detected: ${failingProbes.map(item => item.id).join(', ')}`,
      targets: failingProbes.map(item => item.path)
    });
  }

  const errorModules = (diagnostics?.modules || []).filter(item => item.health === 'error').slice(0, 6);
  if (errorModules.length > 0) {
    actions.push({
      action: 'fix_module_errors',
      priority: 'HIGH',
      note: `Modules with hard errors: ${errorModules.length}`,
      targets: errorModules.map(item => item.path)
    });
  }

  const warningModules = (diagnostics?.modules || []).filter(item => item.health === 'warning').slice(0, 6);
  if (warningModules.length > 0) {
    actions.push({
      action: 'reduce_warning_surface',
      priority: 'MEDIUM',
      note: `Modules with warnings: ${warningModules.length}`,
      targets: warningModules.map(item => item.path)
    });
  }

  const unresolved = diagnostics?.unresolved_dependencies || [];
  if (unresolved.length > 0) {
    actions.push({
      action: 'resolve_dependency_breaks',
      priority: 'HIGH',
      note: `Unresolved imports detected: ${unresolved.length}`,
      targets: unresolved.slice(0, 8).map(item => item.module)
    });
  }

  const avgLatency = diagnostics?.summary?.avg_probe_latency_ms || 0;
  if (avgLatency > 350) {
    actions.push({
      action: 'optimize_bridge_latency',
      priority: 'MEDIUM',
      note: `Probe latency is elevated (${avgLatency}ms).`,
      targets: ['promptbridge-server.js', '/api/metrics', '/api/evo-lm/chat']
    });
  }

  if (actions.length === 0) {
    actions.push({
      action: 'maintain_stability_window',
      priority: 'LOW',
      note: 'No urgent runtime faults detected.',
      targets: ['continuous_monitoring']
    });
  }

  return actions;
}

async function runNightforgeCycle({
  objective,
  orgId = 'org_test',
  includeProviders = ['evo_lm', 'openai', 'gemini'],
  forceThreeProviderTeam = (nightforgeState || loadNightforgeState()).forceThreeProviderTeam ?? false,
  train = true,
  useLiveStudio = true,
  mode = 'cost_guarded',
  scanLimit = 60,
  trigger = 'manual'
} = {}) {
  if (nightforgeState.running) {
    throw new Error('NightForge cycle already running.');
  }

  updateNightforgeState({ running: true, lastError: null });

  try {
    const diagnostics = await buildStudioDiagnostics(scanLimit);
    const proposedActions = buildNightforgeActions(diagnostics);
    const failingProbes = (diagnostics.probes || []).filter(item => !item.ok);
    const topRiskModules = (diagnostics.modules || [])
      .filter(item => item.health !== 'healthy')
      .slice(0, 8)
      .map(item => ({
        path: item.path,
        health: item.health,
        issues: (item.issues || []).slice(0, 2).map(issue => issue.code)
      }));

    const computedObjective = objective || [
      'NightForge daemon cycle.',
      `Modules scanned: ${diagnostics.summary.modules_scanned}.`,
      `Errors: ${diagnostics.summary.modules_error}, warnings: ${diagnostics.summary.modules_warning}.`,
      `Failing probes: ${failingProbes.length}.`,
      `Use cost-aware provider routing and produce implementation-ready repairs only.`
    ].join(' ');

    await CostFirewall.authorize(orgId, '/api/nightforge/cycle');
    const routedProvider = await ModelRouter.route(orgId, '/api/nightforge/cycle');
    const requiredTeam = ['evo_lm', 'openai', 'gemini'];
    const requested = new Set(forceThreeProviderTeam
      ? requiredTeam
      : (Array.isArray(includeProviders) && includeProviders.length > 0 ? includeProviders : ['evo_lm']));
    const canUseCloud = routedProvider === 'any' || routedProvider === 'cloud' || routedProvider === 'openai' || routedProvider === 'gemini';
    if (forceThreeProviderTeam) {
      if (!userConfig.keys.openai) {
        throw new Error('NightForge strict 3-provider mode requires a configured OpenAI API key.');
      }
      if (!userConfig.keys.gemini) {
        throw new Error('NightForge strict 3-provider mode requires a configured Gemini API key.');
      }
      if (!canUseCloud) {
        throw new Error('NightForge strict 3-provider mode requires cloud routing permission for this org/plan.');
      }
    }

    const providerOutputs = [];
    const digest = {
      summary: diagnostics.summary,
      failingProbes: failingProbes.map(item => ({ id: item.id, path: item.path, status: item.status, latency_ms: item.latency_ms })),
      topRiskModules,
      proposedActions: proposedActions.slice(0, 8)
    };

    const baseMessages = [
      { role: 'user', content: `${computedObjective}\n\nDiagnostics digest:\n${JSON.stringify(digest, null, 2)}` }
    ];
    const coordinationPrompt = [
      'You are NightForge, a cost-aware studio reliability daemon.',
      'Return concrete fixes only. No hype.',
      `Mode: ${mode}.`,
      `LiveStudio: ${useLiveStudio ? 'enabled' : 'disabled'}.`,
      `ProviderRoute: ${routedProvider}.`
    ].join(' ');

    if (requested.has('evo_lm')) {
      try {
        const evoLm = await runEvoLmTeamChat(baseMessages, coordinationPrompt);
        providerOutputs.push({
          provider: 'evo_lm',
          success: evoLm.success,
          from_cache: Boolean(evoLm.from_cache),
          content: evoLm.message,
          model: evoLm.model,
          transport: evoLm.transport
        });
      } catch (e) {
        providerOutputs.push({
          provider: 'evo_lm',
          success: false,
          from_cache: false,
          content: String(e.message || e),
          model: 'unavailable',
          transport: 'failed'
        });
      }
    }

    if (requested.has('openai') && userConfig.keys.openai && canUseCloud) {
      try {
        const openaiResult = await ai.chat(
          coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
          { provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' }
        );
        if (openaiResult.success && openaiResult.content) truthGate.enforce(openaiResult.content, 'NightForge:openai');
        providerOutputs.push({
          provider: 'openai',
          success: Boolean(openaiResult.success),
          from_cache: Boolean(openaiResult.from_cache),
          content: openaiResult.content || openaiResult.error || '',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          transport: 'universal_ai_adaptor'
        });
      } catch (e) {
        providerOutputs.push({
          provider: 'openai',
          success: false,
          from_cache: false,
          content: String(e.message || e),
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          transport: 'failed'
        });
      }
    }

    if (requested.has('gemini') && userConfig.keys.gemini && canUseCloud) {
      try {
        const geminiResult = await ai.chat(
          coordinationPrompt ? [{ role: 'system', content: coordinationPrompt }, ...baseMessages] : baseMessages,
          { provider: 'gemini', model: 'gemini-1.5-pro' }
        );
        if (geminiResult.success && geminiResult.content) truthGate.enforce(geminiResult.content, 'NightForge:gemini');
        providerOutputs.push({
          provider: 'gemini',
          success: Boolean(geminiResult.success),
          from_cache: Boolean(geminiResult.from_cache),
          content: geminiResult.content || geminiResult.error || '',
          model: 'gemini-1.5-pro',
          transport: 'universal_ai_adaptor'
        });
      } catch (e) {
        providerOutputs.push({
          provider: 'gemini',
          success: false,
          from_cache: false,
          content: String(e.message || e),
          model: 'gemini-1.5-pro',
          transport: 'failed'
        });
      }
    }

    if (providerOutputs.length === 0 || providerOutputs.every(item => !item.success)) {
      throw new Error('No providers available for NightForge cycle. Configure keys or include evo_lm.');
    }

    const synthesisInput = providerOutputs
      .map(item => `${item.provider.toUpperCase()}(${item.success ? 'ok' : 'error'}): ${item.content}`)
      .join('\n\n');
    const synthesis = await runEvoLmTeamChat(
      [{ role: 'user', content: `Objective:\n${computedObjective}\n\nProvider outputs:\n${synthesisInput}` }],
      'Synthesize a strict repair plan for NightForge with numbered actions and safety guards.'
    );
    const finalPlan = synthesis.message || providerOutputs.find(item => item.success)?.content || providerOutputs[0].content;

    const externalCalls = providerOutputs.filter(item => (item.provider === 'openai' || item.provider === 'gemini') && !item.from_cache).length;
    const cacheHits = providerOutputs.filter(item => item.from_cache).length;
    const localCalls = providerOutputs.filter(item => item.provider === 'evo_lm').length;
    const creditsUsed = Math.max(1, externalCalls === 0 ? 1 : externalCalls);
    await CostFirewall.deduct(orgId, '/api/nightforge/cycle', creditsUsed);

    const estimatedSavedTokens = externalCalls === 0 ? 2500 : cacheHits * 1200;
    if (estimatedSavedTokens > 0) {
      globalFirewallSavings.tokens += estimatedSavedTokens;
      globalFirewallSavings.dollars += estimatedSavedTokens * 0.000002;
    }

    let trainingFile = null;
    if (train) {
      trainingFile = appendTrainingExamples([
        {
          systemPrompt: 'You are PromptHouse Evo Studio NightForge trainer. Preserve runtime diagnostics, cost-aware routing, and concrete repair actions.',
          input: `Objective: ${computedObjective}\nMode: ${mode}\nRoute: ${routedProvider}\nDiagnostics: ${JSON.stringify(digest)}`,
          output: finalPlan,
          transport: 'nightforge_cycle',
          timestamp: new Date().toISOString()
        }
      ], 'nightforge_cycle');
    }

    const cycleId = `nightforge_${Date.now()}`;
    const receipt = {
      id: cycleId,
      trigger,
      orgId,
      mode,
      forceThreeProviderTeam: Boolean(forceThreeProviderTeam),
      routedProvider,
      objective: computedObjective,
      diagnostics: diagnostics.summary,
      providers: providerOutputs.map(item => ({ provider: item.provider, success: item.success, from_cache: item.from_cache })),
      cost: { externalCalls, cacheHits, localCalls, creditsUsed, estimatedSavedTokens },
      timestamp: new Date().toISOString()
    };
    writeFileSync(NIGHTFORGE_RECEIPTS_FILE, `${toSafeJson(receipt)}\n`, { flag: 'a', encoding: 'utf8' });

    const result = {
      id: cycleId,
      status: 'recommended',
      description: 'NightForge produced a real diagnostics-backed repair cycle.',
      timestamp: receipt.timestamp,
      scannedItems: [
        `modules_scanned:${diagnostics.summary.modules_scanned}`,
        `module_errors:${diagnostics.summary.modules_error}`,
        `module_warnings:${diagnostics.summary.modules_warning}`,
        `failing_probes:${failingProbes.length}`,
        `dependency_edges:${diagnostics.summary.dependency_edges}`
      ],
      proposedActions,
      cannot: ['silent_production_deploy', 'delete_data', 'live_commerce_without_approval'],
      diagnostics: {
        summary: diagnostics.summary,
        failingProbes,
        topRiskModules,
        graph: diagnostics.graph
      },
      team: {
        objective: computedObjective,
        routedProvider,
        providerOutputs,
        synthesis: {
          provider: synthesis.provider || 'evo_lm',
          transport: synthesis.transport,
          output: finalPlan
        }
      },
      costSummary: {
        externalCalls,
        cacheHits,
        localCalls,
        creditsUsed,
        estimatedSavedTokens,
        estimatedSavedDollars: Number((estimatedSavedTokens * 0.000002).toFixed(6))
      },
      training: {
        enabled: Boolean(train),
        file: trainingFile
      }
    };
  if (!nightforgeState.active) return;

  const intervalMs = Math.max(1, Number(nightforgeState.intervalMinutes || 360)) * 60 * 1000;
  updateNightforgeState({ nextCycleAt: new Date(Date.now() + intervalMs).toISOString() });
  nightforgeDaemonTimer = setInterval(async () => {
    if (!nightforgeState.active || nightforgeState.running) return;
    try {
      await runNightforgeCycle({
        orgId: nightforgeState.orgId,
        includeProviders: nightforgeState.includeProviders,
        forceThreeProviderTeam: Boolean(nightforgeState.forceThreeProviderTeam),
        train: nightforgeState.train,
        useLiveStudio: nightforgeState.useLiveStudio,
        mode: nightforgeState.mode,
        trigger: 'daemon'
      });
    } catch (e) {
      console.error('[NightForge] daemon cycle failed:', e.message || e);
    }
  }, intervalMs);
}

export {
  defaultNightforgeState,
  loadNightforgeState,
  saveNightforgeState,
  updateNightforgeState,
  clearNightforgeDaemon,
  readNightforgeReceipts,
  buildNightforgeMetrics,
  buildNightforgeActions,
  runNightforgeCycle,
  scheduleNightforgeDaemon
};
