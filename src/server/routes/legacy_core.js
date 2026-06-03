import express from 'express';
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
import { appendTrainingExamples, runEvoLmTeamChat } from '../utils/ai-helpers.js';
import attachRagRoutes from '../api/rag_routes.js';

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

// ─── Commerce (Real Stripe Integration) ─────────────────────────────────────────────
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_not_configured');

app.post('/api/commerce/checkout', async (req, res) => {
  const { productName, priceCents, currency } = req.body;
  if (!productName || !priceCents) return res.status(400).json({ error: 'Missing product details' });
  
  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: { name: productName },
          unit_amount: priceCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });
    
    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Commerce] Stripe Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Proof Intercept ─────────────────────────────────────────────────────────────
app.post('/api/studio-os/proof/intercept', (req, res) => {
  res.json({ success: true });
});

app.get('/api/training/export', (req, res) => {
  if (!existsSync(TRAINING_FILE)) return res.status(404).json({ error: 'No training data yet' });
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Content-Disposition', `attachment; filename="evo_training_${Date.now()}.jsonl"`);
  res.sendFile(TRAINING_FILE);
});

// ─── PAGE CAPTURE (from browser extension) ────────────────────────────────────
const CAPTURES_FILE = join(DATA_DIR, 'captures.jsonl');

app.post('/api/capture', (req, res) => {
  const { text, url, tabTitle, source = 'browser_extension' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const record = JSON.stringify({ text, url, tabTitle, source, capturedAt: new Date().toISOString() }) + '\n';
  try {
    writeFileSync(CAPTURES_FILE, record, { flag: 'a', encoding: 'utf8' });
    res.json({ captured: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PROMPTLINK SYNC ──────────────────────────────────────────────────────────
app.post('/api/promptlink/sync', (req, res) => {
  // Accept sync payloads from the studio — non-critical, always succeed
  res.json({ synced: true, timestamp: new Date().toISOString() });
});
  // ─── ATTACH RAG ROUTES ────────────────────────────────────────────────────────
  attachRagRoutes(app, deps);

}
