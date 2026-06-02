const fs = require('fs');

function replaceExact(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

const serverFile = 'promptbridge-server.js';
replaceExact(serverFile, "import { runNuclearTruthAudit } from './src/core/audit/NuclearTruthAudit.js';", 
`import { runNuclearTruthAudit } from './src/core/audit/NuclearTruthAudit.js';

import attachLegacyRoutes from './src/server/routes/legacy_core.js';

import { 
  ensureJsonWebTokenSecret, loadRevokedTokens, saveRevokedTokens, 
  createAuthToken, verifyAuthToken, requireAuth, requireMasterKey, 
  requireAuthOrMaster, maybeRequireAuthOrMaster, attachOptionalAuthUser, 
  requireOwnerApprovalScope, enforceJsonObjectBody 
} from './src/server/utils/auth-helpers.js';

import { sanitizeEmail, sanitizeDisplayName, toSafeJson, stableHash, clamp } from './src/server/utils/common-helpers.js';

import { 
  resolveEvolutionSubject, defaultEvolutionProfile, inflateEvolutionProfile, 
  persistEvolutionProfile, loadOrCreateEvolutionProfile, recordEvolutionEvent, 
  applyEvolutionSignal, mutateEvolutionProfile, evolutionCssVariables 
} from './src/server/utils/evolution-helpers.js';

import { 
  toPosixPath, collectStudioSourceFiles, extractImportSpecifiers, 
  isLocalImportSpecifier, resolveDependencyPath, classifyModuleHealth, 
  scanStudioModules, buildStudioDiagnostics 
} from './src/server/utils/diagnostic-helpers.js';

import { runEvoLmTeamChat, appendTrainingExamples } from './src/server/utils/ai-helpers.js';

import { 
  defaultNightforgeState, loadNightforgeState, saveNightforgeState, 
  updateNightforgeState, clearNightforgeDaemon, readNightforgeReceipts, 
  buildNightforgeMetrics, buildNightforgeActions, runNightforgeCycle, 
  scheduleNightforgeDaemon 
} from './src/server/utils/nightforge-helpers.js';

import { attachWebSocketServer } from './src/server/utils/ws-helpers.js';`);

replaceExact(serverFile, "app.use((err, req, res, next) => {", 
`const legacyCoreDeps = {
  maintenance, buildGeneratedArtifactRegistry, readGitStatusLines,
  buildBridgeContractLedger, resolveSelfImplementationCapabilities,
  readAvailableFiles, discoverAvailableEndpoints, createSelfImplementationState,
  summarizeSelfImplementationCapabilities, runNuclearTruthAudit,
  DEFAULT_PROMPT_PACKET_PATH, buildPromptPacketPreview, db, bondedNodes,
  intelligenceCore, authRateLimit, enforceJsonObjectBody, sanitizeEmail,
  sanitizeDisplayName, createAuthToken, requireAuth, loadRevokedTokens,
  saveRevokedTokens, resolveWorkspacePath, promptCompressor, ai, terminalSandbox,
  userConfig, stripe, CostFirewall, ModelRouter, OLLAMA_BASE, DATA_DIR,
  globalFirewallSavings, buildStudioDiagnostics, nightforgeState,
  nightforgeDaemonTimer, buildNightforgeMetrics, 
  nightforge: null, SANDBOX_DIR, maybeRequireAuthOrMaster,
  requireOwnerApprovalScope
};
attachLegacyRoutes(app, legacyCoreDeps);

app.use((err, req, res, next) => {`);

replaceExact(serverFile, `app.listen(port, '0.0.0.0', () => {
  console.log(\`\\n╔════════════════════════════════════════╗\`);
  console.log(\`║  PromptHouse Evo Studio — PromptBridge  ║\`);
  console.log(\`║  Version 2.1.0 — SMFF PRODUCTION       ║\`);
  console.log(\`╚════════════════════════════════════════╝\`);
  console.log(\`[BRIDGE ACTIVE] http://127.0.0.1:\${port}\`);
});`,
`const server = app.listen(port, '0.0.0.0', () => {
  console.log(\`\\n╔════════════════════════════════════════╗\`);
  console.log(\`║  PromptHouse Evo Studio — PromptBridge  ║\`);
  console.log(\`║  Version 2.1.0 — SMFF PRODUCTION       ║\`);
  console.log(\`╚════════════════════════════════════════╝\`);
  console.log(\`[BRIDGE ACTIVE] http://127.0.0.1:\${port}\`);
});

attachWebSocketServer(server);`);

console.log("Injection completed with WS.");
