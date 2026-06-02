const fs = require('fs');

const content = fs.readFileSync('promptbridge-server.js', 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('// ─── CORE ROUTES'));
const endIndex = lines.findIndex(l => l.includes('app.use((err, req, res, next) => {'));

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end index.");
  process.exit(1);
}

const chunk = lines.slice(startIndex, endIndex).join('\n');

const newContent = `import express from 'express';
import { join, dirname, relative } from 'path';
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'fs';
import crypto from 'crypto';
import os from 'os';
import bcrypt from 'bcryptjs';
import { OpenAI } from 'openai';
import { TruthGate } from '../../core/TruthGate.js';
import { UniversalAIAdaptor } from '../../../lib/ai/UniversalAIAdaptor.mjs';
import { PromptCompressor } from '../../../lib/ai/PromptCompressor.js';
import { VercelAdapter } from '../../../lib/deployment/VercelAdapter.js';
import { AppBlueprint } from '../../core/blueprints/AppBlueprint.js';
import { ThemeEvolution } from '../../core/evolution/ThemeEvolution.js';
import { ProductionAudit } from '../../core/audit/ProductionAudit.js';
import { PromptCompiler } from '../../core/blueprints/PromptCompiler.js';

export default function attachLegacyRoutes(app, deps) {
  const {
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
    nightforgeDaemonTimer, buildNightforgeMetrics, startNightforgeDaemon,
    stopNightforgeDaemon, nightforge, SANDBOX_DIR, maybeRequireAuthOrMaster,
    requireOwnerApprovalScope
  } = deps;

  function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      }
    }
    return '127.0.0.1';
  }

${chunk}
}
`;

fs.writeFileSync('src/server/routes/legacy_core.js', newContent);

lines.splice(startIndex, endIndex - startIndex, '// Legacy routes extracted to src/server/routes/legacy_core.js');

fs.writeFileSync('promptbridge-server.js', lines.join('\n'));

console.log("Extraction completed successfully.");
