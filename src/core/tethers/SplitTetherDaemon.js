import { getMegaTether } from './MegaTetherCore.js';
import { Log } from '../autonomy/SovereignLogger.js';
import { GlobalMessageQueue } from '../queue/MessageQueue.js';

export class SplitTetherDaemon {
  constructor() {
    this.status = 'ACTIVE';
    this.registeredEndpoints = new Map();
  }

  registerApi(apiName, handlerFn) {
    this.registeredEndpoints.set(apiName, handlerFn);
    Log.info(`[SplitTether] API Registered: ${apiName}`);
  }

  async splitAndRoute(sourceName, payload) {
    Log.info(`[SplitTether] Incoming tether from ${sourceName}. Analyzing routing paths...`);
    const routes = [];

    // Autonomously determine where to split the data
    if (payload.type === 'ui_map' || payload.nodes || payload.type === 'BOTS_INTEL') {
      routes.push('VisionApi');
      routes.push('AnalyticsApi');
      routes.push('EvoCopilot');
      routes.push('GhostEditor');
    }
    if (payload.concept || payload.type === 'MARKETING_CAMPAIGN') {
      routes.push('MarketApi');
      routes.push('SelfBudgetingEngine');
    }
    if (payload.action && payload.action.includes('SWARM')) {
      routes.push('SwarmApi');
    }
    if (payload.type === 'EVOLUTION_PATCH') {
      routes.push('QualityAuditEngine');
      routes.push('SelfMaintenanceDaemon');
    }
    if (payload.type === 'OMNI_PULSE') {
      routes.push('EvoTree');
      routes.push('MegaTetherCore');
    }
    if (payload.type === 'TRIDALL_EXTRACT') {
      routes.push('SelfMarketingEngine');
      routes.push('SelfBudgetingEngine');
      routes.push('EvoCopilot');
    }
    if (payload.type === 'OMNIBOT_MOBILE') {
      routes.push('SovereignIntelligence');
      routes.push('EvoCopilot');
      routes.push('FlutterBridge');
    }
    if (payload.type === 'MOBILE_APP_MAKER') {
      routes.push('SelfMarketingEngine');
      routes.push('EvoCopilot');
      routes.push('MegaTetherCore');
    }
    if (payload.type === 'LIVE_EDITOR_STATE') {
      routes.push('PatchProposalEngine');
      routes.push('AnalyticsApi');
    }
    if (payload.type === 'DNA_MUTATION') {
      routes.push('MegaTetherCore');
      routes.push('EvoTree');
      routes.push('QualityAuditEngine');
    }
    if (payload.type === 'REM_PATTERN_DISCOVERED') {
      routes.push('EvoTree');
      routes.push('PatchProposalEngine');
      routes.push('SovereignIntelligence');
    }
    if (payload.type === 'COGNITIVE_STATE_CHANGE') {
      routes.push('EvoMobileController');
      routes.push('GhostEditor');
      routes.push('EvoCopilot');
    }
    if (payload.type === 'BROWSER_TELEMETRY') {
      routes.push('EvoCopilot');
      routes.push('TridallPatternEngine');
    }
    if (payload.type === 'BROWSER_ACTUATION') {
      routes.push('OmnibotMobileCore');
      routes.push('AutoUser');
    }
    if (payload.type === 'ANTIGRAVITY_PULSE') {
      routes.push('TridallPatternEngine');
      routes.push('GenesisMutationEngine');
      routes.push('ParadigmBranchingEngine');
      routes.push('SwarmApi');
    }
    if (payload.type === 'PARADIGM_BRANCH_RESULT') {
      routes.push('GhostEditor');
      routes.push('EvoCopilot');
      routes.push('QualityAuditEngine');
    }
    if (payload.type === 'BIOMETRIC_TELEMETRY') {
      routes.push('EvoCopilot');
      routes.push('GhostEditor');
      routes.push('AntigravityDaemon');
    }
    if (payload.type === 'EVOMAN_GESTURE') {
      routes.push('AntigravityDaemon');
      routes.push('EvoCopilot');
    }
    
    // ── NEW CORE ENGINE TELEMETRY ROUTING ──────────────────────────────
    if (payload.type === 'HARDWARE_TELEMETRY') {
      routes.push('EvoCopilot');
      routes.push('AntigravityDaemon');
      routes.push('SovereignIntelligence');
    }
    if (payload.type === 'MEMORY_GRAPH_UPDATED') {
      routes.push('EvoCopilot');
      routes.push('PatchProposalEngine');
    }
    if (payload.type === 'LLM_INFERENCE_START' || payload.type === 'LLM_INFERENCE_COMPLETE') {
      routes.push('QualityAuditEngine');
      routes.push('SelfBudgetingEngine');
    }
    if (payload.type === 'AUTONOMOUS_EXECUTION_INTENT') {
      routes.push('SovereignIntelligence');
      routes.push('QualityAuditEngine');
    }
    if (payload.type === 'COGNITIVE_RESONANCE_SHIFT') {
      routes.push('ParadigmBranchingEngine');
      routes.push('GenesisMutationEngine');
    }
    if (payload.type === 'EVOLUTION_TOURNAMENT_COMPLETE') {
      routes.push('PatchProposalEngine');
      routes.push('EvoTree');
    }
    if (payload.type === 'AST_RAG_INDEXED') {
      routes.push('EvoCopilot');
      routes.push('GhostEditor');
    }

    // ── ANTIGRAVITY META-TETHER ──────────────────────────────
    // Route ALL signals through the Antigravity consciousness layer
    // so it maintains total awareness of the studio's state.
    if (!routes.includes('AntigravityDaemon')) {
      routes.push('AntigravityDaemon');
    }

    // Default fallback
    if (routes.length === 0) {
      routes.push('GeneralApi');
    }

    Log.info(`[SplitTether] Splitting tether into ${routes.length} parallel paths: ${routes.join(', ')}`);

    const promises = routes.map(async (route) => {
      const handler = this.registeredEndpoints.get(route);
      if (handler) {
        return handler(payload);
      } else {
        // Fallback physical API handler
        Log.info(`[SplitTether] -> Routing payload to default external interface: ${route}`);
        return { routed: true, target: route, payloadId: payload.id || Date.now() };
      }
    });

    const results = await Promise.all(promises);

    // Broadcast the split event across the mega tether
    let tether = null;
    try { tether = getMegaTether(); } catch (e) {}
    if (tether) {
      await tether.broadcast('split_tether_daemon', 'TETHER_SPLIT_EXECUTED', { source: sourceName, routes });
    }

    // Publish to local message queue
    GlobalMessageQueue.publish('tether_split_events', { source: sourceName, routes, payload });

    return results;
  }
}

export const GlobalSplitTether = new SplitTetherDaemon();
