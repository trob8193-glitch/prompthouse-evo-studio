import express from 'express';
import { creativeOrchestrator } from '../src/core/creative/CreativeOrchestrator.js';

const jsonBody = express.json({ limit: '2mb' });
const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

function filterFromQuery(req) {
  return {
    projectId: req.query.projectId || undefined,
    tenantId: req.query.tenantId || undefined,
    requestId: req.query.requestId || undefined,
    assetId: req.query.assetId || undefined,
    status: req.query.status || undefined,
    limit: req.query.limit ? Number(req.query.limit) : 50,
  };
}

export default function registerQuadBrainCreativeRoutes(app) {
  app.get('/api/quadbrain/creative/status', (_req, res) => {
    try { ok(res, { status: creativeOrchestrator.status() }); } catch (error) { fail(res, error); }
  });

  app.get('/api/quadbrain/creative/requests', (req, res) => {
    try { ok(res, creativeOrchestrator.listRequests(filterFromQuery(req))); } catch (error) { fail(res, error); }
  });

  app.post('/api/quadbrain/creative/requests', jsonBody, (req, res) => {
    try {
      const result = creativeOrchestrator.createRequest(req.body || {});
      if (!result.success) return res.status(400).json(result);
      ok(res, result);
    } catch (error) { fail(res, error); }
  });

  app.post('/api/quadbrain/creative/generate', jsonBody, async (req, res) => {
    try {
      const result = await creativeOrchestrator.generateAsset({ requestId: req.body?.requestId });
      if (!result.success) return res.status(400).json(result);
      ok(res, result);
    } catch (error) { fail(res, error); }
  });

  app.get('/api/quadbrain/creative/assets', (req, res) => {
    try { ok(res, creativeOrchestrator.listAssets(filterFromQuery(req))); } catch (error) { fail(res, error); }
  });

  app.get('/api/quadbrain/creative/receipts', (req, res) => {
    try { ok(res, creativeOrchestrator.listReceipts(filterFromQuery(req))); } catch (error) { fail(res, error); }
  });

  app.post('/api/quadbrain/creative/assets/approve', jsonBody, (req, res) => {
    try { ok(res, creativeOrchestrator.approveAsset(req.body || {})); } catch (error) { fail(res, error, 400); }
  });

  app.post('/api/quadbrain/creative/assets/reject', jsonBody, (req, res) => {
    try { ok(res, creativeOrchestrator.rejectAsset(req.body || {})); } catch (error) { fail(res, error, 400); }
  });
}
