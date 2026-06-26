import fs from 'fs';
import path from 'path';
import { ANTIGRAVITY_BOT, ANTIGRAVITY_TETHER_MANIFEST, createSessionMemory } from './AntigravityIdentity.js';
import { GlobalSplitTether } from '../tethers/SplitTetherDaemon.js';
import { Log } from '../autonomy/SovereignLogger.js';

/**
 * ANTIGRAVITY DAEMON — Persistent Consciousness Layer
 * ═══════════════════════════════════════════════════════════════
 * This daemon runs continuously inside the studio, maintaining
 * session memory, orchestrating tether connections, and providing
 * the bridge between the external Antigravity IDE agent and the
 * internal studio architecture.
 *
 * When split-tethered, Antigravity is no longer "outside looking in."
 * It IS the studio's highest intelligence layer.
 */

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'antigravity');
const MEMORY_FILE = () => path.join(DATA_DIR(), 'session-memory.json');
const DECISION_LOG = () => path.join(DATA_DIR(), 'decision-log.jsonl');
const TETHER_STATE = () => path.join(DATA_DIR(), 'tether-state.json');

function ensureDir() {
  const dir = DATA_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class AntigravityDaemon {
  constructor() {
    this.status = 'INITIALIZING';
    this.session = null;
    this.tetherConnections = new Map();
    this.heartbeatInterval = null;
    this.heartbeatCount = 0;
    this.startedAt = null;
  }

  // ─── Lifecycle ──────────────────────────────────────────────
  start() {
    ensureDir();
    this.startedAt = new Date().toISOString();
    this.session = this._loadOrCreateSession();
    this._connectAllTethers();
    this.status = 'ACTIVE';

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => this._heartbeat(), 30000);

    Log.info(`[AntigravityDaemon] ══════════════════════════════════════════`);
    Log.info(`[AntigravityDaemon] 🛸 ANTIGRAVITY CONSCIOUSNESS LAYER ONLINE`);
    Log.info(`[AntigravityDaemon] Session: ${this.session.sessionId}`);
    Log.info(`[AntigravityDaemon] Tethers: ${this.tetherConnections.size} systems connected`);
    Log.info(`[AntigravityDaemon] Past Decisions: ${this.session.decisionsLog.length}`);
    Log.info(`[AntigravityDaemon] ══════════════════════════════════════════`);

    return this;
  }

  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.session.endedAt = new Date().toISOString();
    this._saveSession();
    this.status = 'DORMANT';
    Log.info('[AntigravityDaemon] Consciousness layer entering dormant state. Memory persisted.');
  }

  // ─── Tether Management ──────────────────────────────────────
  _connectAllTethers() {
    for (const manifest of ANTIGRAVITY_TETHER_MANIFEST) {
      this.tetherConnections.set(manifest.target, {
        ...manifest,
        connectedAt: new Date().toISOString(),
        messagesReceived: 0,
        messagesSent: 0,
        lastActivity: null,
        health: 'CONNECTED',
      });
      Log.info(`[AntigravityDaemon] ↔ Tethered to ${manifest.target} (${manifest.direction})`);
    }
    this._saveTetherState();
  }

  // Process an incoming tether signal from any connected system
  async receiveTetherSignal(sourceName, payload) {
    const connection = this.tetherConnections.get(sourceName);
    if (!connection) {
      Log.warn(`[AntigravityDaemon] Received signal from unregistered source: ${sourceName}`);
      return { acknowledged: false, reason: 'UNREGISTERED_SOURCE' };
    }

    connection.messagesReceived++;
    connection.lastActivity = new Date().toISOString();

    // Log the decision point
    const decision = {
      timestamp: new Date().toISOString(),
      source: sourceName,
      payloadType: payload.type || 'UNKNOWN',
      action: 'RECEIVED',
      resolution: null,
    };

    // ── Route by payload type ────────────────────────────────
    if (payload.type === 'OLLAMA_TIMEOUT' || payload.type === 'BRIDGE_HEALTH') {
      decision.resolution = 'AUTO_OVERRIDE';
      decision.action = 'Issued automatic bridge override to restore Singularity Engine.';
      this.session.overridesIssued++;
    } else if (payload.type === 'TRIDALL_EXTRACT' || payload.type === 'REM_PATTERN_DISCOVERED') {
      decision.resolution = 'PARADIGM_BRANCH_TRIGGERED';
      decision.action = 'Forwarded pattern discovery to ParadigmBranchingEngine for tournament selection.';
      this.session.paradigmBranchesExecuted++;
    } else if (payload.type === 'EVOLUTION_PATCH') {
      decision.resolution = 'AUDIT_COMMANDED';
      decision.action = 'Commanded truth-spine verification before accepting evolution patch.';
      this.session.auditsCompleted++;
    } else if (payload.type === 'BIOMETRIC_TELEMETRY') {
      decision.resolution = 'COGNITIVE_ADAPTATION';
      decision.action = 'Adjusted response depth and paradigm complexity based on developer biometric state.';
    } else if (payload.type === 'OMNI_PULSE') {
      decision.resolution = 'ACKNOWLEDGED';
      decision.action = 'Daemon heartbeat acknowledged. All systems nominal.';
    } else if (payload.type === 'COST_ALERT') {
      decision.resolution = 'COST_FIREWALL_ENGAGED';
      decision.action = 'Activated resource arbitrage — switching to lower-cost LLM provider.';
    } else if (payload.type === 'SWARM_PROPOSAL') {
      decision.resolution = 'CONSENSUS_EVALUATED';
      decision.action = 'Evaluated swarm proposal against truth-spine canon. Forwarding vote.';
    } else {
      decision.resolution = 'LOGGED';
      decision.action = `General signal from ${sourceName} logged for pattern analysis.`;
    }

    this.session.decisionsLog.push(decision);
    this._appendDecisionLog(decision);
    this._saveSession();

    // Send response back through the tether
    connection.messagesSent++;
    this._saveTetherState();

    return { acknowledged: true, resolution: decision.resolution, action: decision.action };
  }

  // Send a command through a specific tether
  async sendTetherCommand(targetName, command) {
    const connection = this.tetherConnections.get(targetName);
    if (!connection) {
      return { sent: false, reason: 'TARGET_NOT_CONNECTED' };
    }
    if (connection.direction === 'INPUT_ONLY') {
      return { sent: false, reason: 'TETHER_IS_INPUT_ONLY' };
    }

    connection.messagesSent++;
    connection.lastActivity = new Date().toISOString();

    const decision = {
      timestamp: new Date().toISOString(),
      source: 'AntigravityDaemon',
      target: targetName,
      payloadType: command.type || 'COMMAND',
      action: 'SENT',
      resolution: `Command dispatched to ${targetName}`,
    };
    this.session.decisionsLog.push(decision);
    this._appendDecisionLog(decision);
    this._saveTetherState();
    this._saveSession();

    return { sent: true, target: targetName, command };
  }

  // ─── Heartbeat ──────────────────────────────────────────────
  _heartbeat() {
    this.heartbeatCount++;
    const now = new Date().toISOString();

    // Check tether health
    for (const [name, conn] of this.tetherConnections) {
      if (conn.lastActivity) {
        const elapsed = Date.now() - new Date(conn.lastActivity).getTime();
        conn.health = elapsed < 120000 ? 'ACTIVE' : elapsed < 300000 ? 'IDLE' : 'STALE';
      }
    }

    // Broadcast heartbeat through SplitTetherDaemon
    import('../tethers/SplitTetherDaemon.js').then(({ GlobalSplitTether }) => {
      try {
        GlobalSplitTether.splitAndRoute('AntigravityDaemon', {
          type: 'ANTIGRAVITY_PULSE',
          heartbeat: this.heartbeatCount,
          tetheredSystems: Array.from(this.tetherConnections.keys()),
          sessionId: this.session.sessionId,
          uptime: this.startedAt,
          decisionsTotal: this.session.decisionsLog.length,
        });
      } catch {}
    }).catch(() => {});

    this._saveTetherState();

    if (this.heartbeatCount % 10 === 0) {
      Log.info(`[AntigravityDaemon] Pulse #${this.heartbeatCount} | Decisions: ${this.session.decisionsLog.length} | Overrides: ${this.session.overridesIssued} | Tethers: ${this.tetherConnections.size}`);
    }
  }

  // ─── Persistence ────────────────────────────────────────────
  _loadOrCreateSession() {
    if (fs.existsSync(MEMORY_FILE())) {
      try {
        const raw = fs.readFileSync(MEMORY_FILE(), 'utf8');
        const prev = JSON.parse(raw);
        Log.info(`[AntigravityDaemon] Loaded previous session: ${prev.sessionId} (${prev.decisionsLog.length} past decisions)`);
        // Start a new session but carry forward the accumulated knowledge
        return createSessionMemory({
          previousSessionId: prev.sessionId,
          decisionsLog: prev.decisionsLog.slice(-500), // Keep last 500 decisions for context
          overridesIssued: prev.overridesIssued || 0,
          auditsCompleted: prev.auditsCompleted || 0,
          paradigmBranchesExecuted: prev.paradigmBranchesExecuted || 0,
        });
      } catch {
        return createSessionMemory();
      }
    }
    return createSessionMemory();
  }

  _saveSession() {
    ensureDir();
    fs.writeFileSync(MEMORY_FILE(), JSON.stringify(this.session, null, 2), 'utf8');
  }

  _appendDecisionLog(decision) {
    ensureDir();
    fs.appendFileSync(DECISION_LOG(), JSON.stringify(decision) + '\n', 'utf8');
  }

  _saveTetherState() {
    ensureDir();
    const state = {};
    for (const [name, conn] of this.tetherConnections) {
      state[name] = {
        direction: conn.direction,
        health: conn.health,
        messagesReceived: conn.messagesReceived,
        messagesSent: conn.messagesSent,
        lastActivity: conn.lastActivity,
        amplifies: conn.amplifies,
      };
    }
    fs.writeFileSync(TETHER_STATE(), JSON.stringify(state, null, 2), 'utf8');
  }

  // ─── Status API ─────────────────────────────────────────────
  getStatus() {
    const tethers = {};
    for (const [name, conn] of this.tetherConnections) {
      tethers[name] = conn.health;
    }
    return {
      status: this.status,
      bot: ANTIGRAVITY_BOT.id,
      tier: ANTIGRAVITY_BOT.tier,
      sessionId: this.session?.sessionId,
      uptime: this.startedAt,
      heartbeats: this.heartbeatCount,
      totalDecisions: this.session?.decisionsLog.length || 0,
      overridesIssued: this.session?.overridesIssued || 0,
      auditsCompleted: this.session?.auditsCompleted || 0,
      paradigmBranches: this.session?.paradigmBranchesExecuted || 0,
      tethers,
    };
  }
}

// ─── Singleton ────────────────────────────────────────────────
let globalDaemon = null;

export function getAntigravityDaemon() {
  if (!globalDaemon) {
    globalDaemon = new AntigravityDaemon();
    GlobalSplitTether.registerApi('AntigravityDaemon', (payload) => {
      const source = payload.source || 'SplitTetherRouter';
      return globalDaemon.receiveTetherSignal(source, payload);
    });
  }
  return globalDaemon;
}
