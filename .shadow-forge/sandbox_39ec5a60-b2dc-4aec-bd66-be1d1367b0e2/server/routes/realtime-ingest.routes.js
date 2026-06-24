import express from 'express';
import crypto from 'crypto';
import { DataSanitizer } from '../../src/core/security/DataSanitizer.js';
import { PrivacyFilter } from '../../src/core/security/PrivacyFilter.js';
import { EthicalGuardrail } from '../../src/core/security/EthicalGuardrail.js';
import { OnlineLearningManager } from '../../src/core/evolution/OnlineLearningManager.js';
import { AutonomousDecisionTree } from '../../src/core/evolution/AutonomousDecisionTree.js';
import { CostFirewall } from '../../src/core/gateway/costFirewall.js';
import { captureTrainingEvent, getTrainingStats } from '../services/evo-training-runtime.js';
import { EventEmitter } from 'events';

const learningManager = new OnlineLearningManager();
const PAYLOAD_CACHE = new Map();
const ingestQueue = new EventEmitter();
const RECENT_EVENTS = [];

function summarizePayload(payload = {}) {
  const candidate = payload.summary
    || payload.context_summary
    || payload.message
    || payload.prompt
    || payload.content
    || payload.title
    || JSON.stringify(payload).slice(0, 1200);
  return String(candidate || '').slice(0, 1200);
}

function rememberEvent(event) {
  RECENT_EVENTS.unshift(event);
  RECENT_EVENTS.splice(25);
}

export function registerRealTimeIngestRoutes(app, { ai }) {
  let pendingTasks = 0;
  let processedTasks = 0;
  let rejectedTasks = 0;
  let duplicateTasks = 0;
  let lastTrainingCapture = null;

  // Background Async Worker
  ingestQueue.on('process', async ({ rawPayload, ingestId, req }) => {
    try {
      pendingTasks++;
      const sanitized = DataSanitizer.clean(rawPayload);
      const payloadHash = crypto.createHash('sha256').update(JSON.stringify(sanitized)).digest('hex');

      if (PAYLOAD_CACHE.has(payloadHash)) {
        duplicateTasks++;
        rememberEvent({ ingestId, truthState: 'REALTIME_INGEST_DUPLICATE_SKIPPED', processedAt: new Date().toISOString() });
        return;
      }

      const orgId = req.user_id ? 'org_' + req.user_id : 'org_anonymous';
      const clientIp = req.ip || 'unknown';
      const safePayload = await PrivacyFilter.scrub(sanitized, ai);
      const ethicalReport = await EthicalGuardrail.evaluate(safePayload, ai);

      if (!ethicalReport.compliant) {
        rejectedTasks++;
        CostFirewall.recordViolation(clientIp);
        rememberEvent({ ingestId, truthState: 'REALTIME_INGEST_ETHICS_REJECTED', processedAt: new Date().toISOString() });
        return;
      }

      PAYLOAD_CACHE.set(payloadHash, true);
      if (PAYLOAD_CACHE.size > 1000) PAYLOAD_CACHE.clear();

      const learningResult = await learningManager.ingestKnowledgeChunk(safePayload);
      const decision = AutonomousDecisionTree.evaluateUpdate(learningResult.stabilityScore, ethicalReport, 'LOW');
      const trainingCapture = captureTrainingEvent({
        rootDir: process.cwd(),
        capture: {
          id: `realtime_${ingestId}`,
          source: safePayload.source || 'realtime-stream-ingest',
          project: safePayload.project || safePayload.module || 'PromptHouse Evo Studio',
          summary: summarizePayload(safePayload),
          next_pass_excerpt: safePayload.next_pass_excerpt || safePayload.nextPass || safePayload.recommendation || 'Fold this real-time signal into proof-gated Evo improvement planning.',
          checklist: 'sanitize payload | privacy scrub payload | ethical guardrail approval | online learning ingest | training capture bridge',
          metadata: {
            payloadHash,
            orgId,
            stabilityScore: learningResult.stabilityScore,
            decision
          }
        }
      });

      processedTasks++;
      lastTrainingCapture = {
        ingestId,
        captureId: trainingCapture.capture?.id,
        truthState: trainingCapture.truthState,
        trainingTruthState: trainingCapture.ingest?.truthState,
        processedAt: new Date().toISOString()
      };
      rememberEvent(lastTrainingCapture);
      console.log(`[AsyncQueue] Processed ${ingestId} | Cluster Stability: ${learningResult.stabilityScore} | Training: ${trainingCapture.truthState}`);
    } catch (e) {
      rejectedTasks++;
      rememberEvent({ ingestId, truthState: 'REALTIME_INGEST_PROCESSING_ERROR', error: e.message, processedAt: new Date().toISOString() });
      console.error(`[AsyncQueue] Processing error for ${ingestId}:`, e.message);
    } finally {
      pendingTasks--;
    }
  });

  app.get('/api/stream-queue-status', (_req, res) => {
    res.json({
      success: true,
      truthState: pendingTasks > 0 ? 'REALTIME_TRAINING_QUEUE_ACTIVE' : 'REALTIME_TRAINING_QUEUE_IDLE',
      pendingTasks,
      processedTasks,
      rejectedTasks,
      duplicateTasks,
      lastTrainingCapture,
      recentEvents: RECENT_EVENTS,
      training: getTrainingStats({ rootDir: process.cwd(), limit: 10 })
    });
  });

  app.post('/api/stream-ingest', async (req, res) => {
    try {
      const rawPayload = req.body;
      const ingestId = crypto.randomUUID();
      const clientIp = req.ip || 'unknown';
      const orgId = req.user_id ? 'org_' + req.user_id : 'org_anonymous';

      // 1. Proactive Edge Threat Matrix Check (graceful for anonymous telemetry)
      try {
        await CostFirewall.authorize(orgId, 'realtime-ingest', clientIp);
      } catch (authErr) {
        // If it's an explicit threat block, reject hard
        if (authErr.message && authErr.message.includes('THREAT_MATRIX')) {
          return res.status(403).json({ success: false, truthState: 'REALTIME_TRAINING_REJECTED', error: authErr.message });
        }
        // For anonymous telemetry, log warning but allow through
        if (orgId === 'org_anonymous') {
          console.warn(`[StreamIngest] CostFirewall warning for anonymous pulse (allowing): ${authErr.message}`);
        } else {
          return res.status(403).json({ success: false, truthState: 'REALTIME_TRAINING_REJECTED', error: authErr.message });
        }
      }

      // 2. Add to background async queue
      ingestQueue.emit('process', { rawPayload, ingestId, req });

      // 3. Return Zero-Latency 202 Accepted
      res.status(202).json({
        success: true,
        truthState: 'REALTIME_TRAINING_QUEUED',
        ingestId,
        queue: { pendingTasks: pendingTasks + 1 },
        message: 'Payload accepted and queued for real-time Evo training capture.'
      });
    } catch (error) {
      console.error('[StreamIngest] Unexpected error:', error.message);
      res.status(error.message && error.message.includes('THREAT_MATRIX') ? 403 : 500).json({ success: false, truthState: 'REALTIME_TRAINING_REJECTED', error: error.message });
    }
  });

  app.post('/api/feedback-adaptation', async (req, res) => {
    try {
      const { filePath, action } = req.body;
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

      const trainingCapture = captureTrainingEvent({
        rootDir: process.cwd(),
        capture: {
          id: `feedback_${feedbackId}`,
          source: 'feedback-adaptation',
          project: 'PromptHouse Evo Studio',
          summary: `User ${action}d proposal for ${filePath}`,
          next_pass_excerpt: action === 'merge'
            ? 'Reinforce this accepted repair pattern in future Evo suggestions.'
            : 'Down-rank this rejected proposal pattern and require stronger proof next time.',
          checklist: 'capture feedback | weight signal | update online learning | update training corpus',
          metadata: { filePath, action, signalStrength: weight }
        }
      });

      res.json({
        success: true,
        truthState: 'FEEDBACK_ADAPTATION_RECORDED',
        feedbackId,
        action,
        trainingCapture,
        message: 'Feedback integrated into online learning memory and Evo training capture.'
      });
    } catch (error) {
      res.status(500).json({ success: false, truthState: 'FEEDBACK_ADAPTATION_FAILED', error: error.message });
    }
  });
}
