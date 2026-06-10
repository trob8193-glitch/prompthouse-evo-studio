import express from 'express';
import crypto from 'crypto';
import { DataSanitizer } from '../../src/core/security/DataSanitizer.js';
import { PrivacyFilter } from '../../src/core/security/PrivacyFilter.js';
import { EthicalGuardrail } from '../../src/core/security/EthicalGuardrail.js';
import { OnlineLearningManager } from '../../src/core/evolution/OnlineLearningManager.js';
import { AutonomousDecisionTree } from '../../src/core/evolution/AutonomousDecisionTree.js';
import { CostFirewall } from '../../src/core/gateway/costFirewall.js';
import { EventEmitter } from 'events';

const learningManager = new OnlineLearningManager();
const PAYLOAD_CACHE = new Map();
const ingestQueue = new EventEmitter();

export function registerRealTimeIngestRoutes(app, { ai }) {
  let pendingTasks = 0;

  // Background Async Worker
  ingestQueue.on('process', async ({ rawPayload, ingestId, req }) => {
    try {
      pendingTasks++;
      const sanitized = DataSanitizer.clean(rawPayload);
      const payloadHash = crypto.createHash('sha256').update(JSON.stringify(sanitized)).digest('hex');
      
      if (PAYLOAD_CACHE.has(payloadHash)) {
        pendingTasks--;
        return;
      }

      const orgId = req.user_id ? 'org_' + req.user_id : 'org_anonymous';
      const clientIp = req.ip || 'unknown';

      const safePayload = await PrivacyFilter.scrub(sanitized, ai);
      
      const ethicalReport = await EthicalGuardrail.evaluate(safePayload, ai);
      if (!ethicalReport.compliant) {
        CostFirewall.recordViolation(clientIp);
        pendingTasks--;
        return;
      }

      PAYLOAD_CACHE.set(payloadHash, true);
      if (PAYLOAD_CACHE.size > 1000) PAYLOAD_CACHE.clear();

      const learningResult = await learningManager.ingestKnowledgeChunk(safePayload);
      const decision = AutonomousDecisionTree.evaluateUpdate(learningResult.stabilityScore, ethicalReport, 'LOW');
      console.log(`[AsyncQueue] Processed ${ingestId} | Cluster Stability: ${learningResult.stabilityScore}`);
    } catch (e) {
      console.error(`[AsyncQueue] Processing error for ${ingestId}:`, e.message);
    } finally {
      pendingTasks--;
    }
  });

  app.get('/api/stream-queue-status', (req, res) => {
    res.json({ pendingTasks });
  });

  app.post('/api/stream-ingest', async (req, res) => {
    try {
      const rawPayload = req.body;
      const ingestId = crypto.randomUUID();
      const clientIp = req.ip || 'unknown';
      const orgId = req.user_id ? 'org_' + req.user_id : 'org_anonymous';

      // 1. Proactive Edge Threat Matrix Check (Zero Latency)
      await CostFirewall.authorize(orgId, 'realtime-ingest', clientIp);

      // 2. Add to background async queue
      ingestQueue.emit('process', { rawPayload, ingestId, req });
      
      // 3. Return Zero-Latency 202 Accepted
      res.status(202).json({
        success: true,
        ingestId,
        message: 'Payload accepted and queued for master asynchronous clustering.'
      });
    } catch (error) {
      res.status(error.message.includes('THREAT_MATRIX') ? 403 : 500).json({ success: false, error: error.message });
    }
  });


  app.post('/api/feedback-adaptation', async (req, res) => {
    try {
      const { filePath, originalCode, proposedCode, action } = req.body;
      const feedbackId = crypto.randomUUID();
      
      console.log(`[FeedbackAdaptation] Received ${action} for ${filePath} (${feedbackId})`);
      
      // Phase 6: Weight user corrections
      const weight = action === 'merge' ? 1.5 : -1.0;
      await learningManager.ingestKnowledgeChunk({
        id: feedbackId,
        source: 'user_feedback',
        signal_strength: weight,
        context_summary: `User ${action}d proposal for ${filePath}`
      });
      
      res.json({
        success: true,
        feedbackId,
        action,
        message: 'Feedback successfully integrated into online learning memory.'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
