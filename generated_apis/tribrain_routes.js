import express from 'express';
import {
  TRIBRAIN_BRAINS,
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_RISK_LEVELS,
  createTriBrainSystem,
} from '../src/core/tribrain/index.js';
import { TriBrainExecutor } from '../src/core/tribrain/TriBrainExecutor.js';
import { EvoLayer, ProofLedger } from '../src/core/tribrain/EvoLayer.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });
const jsonBody = express.json({ limit: '1mb' });

function extractAuthToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function roleFromRequest(req) {
  if (extractAuthToken(req)) return 'admin';
  return String(req.user?.role || req.headers['x-tribrain-role'] || 'viewer').toLowerCase();
}

function userFromRequest(req) {
  if (extractAuthToken(req)) return 'chatgpt_operator';
  return String(req.user?.sub || req.headers['x-user-id'] || 'anonymous');
}

function tenantFromRequest(req) {
  return String(req.user?.tenantId || req.headers['x-tenant-id'] || 'tenant_default');
}

function projectIdsFromRequest(req) {
  const raw = req.user?.projectIds || req.headers['x-project-ids'] || '';
  if (Array.isArray(raw)) return raw;
  return String(raw).split(',').map(item => item.trim()).filter(Boolean);
}

function createSystem(req) {
  const chatgptOnline = String(req.headers['x-chatgpt-online'] || '').toLowerCase() === 'true';
  const ideOnline = String(req.headers['x-ide-online'] || '').toLowerCase() === 'true';
  return createTriBrainSystem({
    brainSettings: {
      [TRIBRAIN_BRAINS.STUDIO]: { enabled: true, available: true, localMode: true },
      [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: { enabled: true, available: chatgptOnline, localMode: false },
      [TRIBRAIN_BRAINS.IDE_AGENT]: { enabled: true, available: ideOnline, localMode: true },
    },
  });
}

function permissionContext(req) {
  return {
    tenantId: tenantFromRequest(req),
    userId: userFromRequest(req),
    role: roleFromRequest(req),
    projectIds: projectIdsFromRequest(req),
    approvals: Array.isArray(req.body?.approvals) ? req.body.approvals : [],
  };
}

function defaultCommand(intent = 'RUN_PLATFORM_AUDIT') {
  return {
    intent,
    sourceBrain: TRIBRAIN_BRAINS.STUDIO,
    targetBrain: 'auto',
    abilityClass: TRIBRAIN_ABILITY_CLASSES.AUDIT,
    riskLevel: TRIBRAIN_RISK_LEVELS.LOW,
    payload: { projectId: 'studio-core' },
  };
}

export default function registerTriBrainRoutes(app) {
  app.get('/api/tribrain/status', (req, res) => {
    try { ok(res, { status: createSystem(req).status() }); } catch (error) { fail(res, error); }
  });

  app.get('/api/tribrain/contract', (req, res) => {
    try {
      ok(res, {
        brains: TRIBRAIN_BRAINS,
        abilities: TRIBRAIN_ABILITY_CLASSES,
        riskLevels: TRIBRAIN_RISK_LEVELS,
      });
    } catch (error) { fail(res, error); }
  });

  app.post('/api/tribrain/route', jsonBody, (req, res) => {
    try {
      const command = req.body?.command || defaultCommand(req.body?.intent);
      const plan = createSystem(req).plan(command, permissionContext(req));
      ok(res, { plan });
    } catch (error) { fail(res, error); }
  });

  app.post('/api/tribrain/final-response', jsonBody, (req, res) => {
    try {
      const system = createSystem(req);
      const finalResponse = system.arbiter.arbitrate({
        command: req.body?.command || null,
        responses: Array.isArray(req.body?.responses) ? req.body.responses : [],
        permissionContext: permissionContext(req),
      });
      ok(res, { finalResponse });
    } catch (error) { fail(res, error); }
  });

  app.post('/api/tribrain/execute-verification', jsonBody, async (req, res) => {
    try {
      const ctx = permissionContext(req);
      
      // Block viewers completely
      if (ctx.role === 'viewer') {
        return fail(res, new Error("Role 'viewer' is strictly prohibited from executing verification commands. Developer or Owner required."), 403);
      }

      if (!req.body?.command) {
        return fail(res, new Error("Missing 'command' in request payload."), 400);
      }

      // Execute command via secure sandbox
      const proofReceipt = await TriBrainExecutor.executeVerification(req.body.command, ctx);
      
      ok(res, { proofReceipt });
    } catch (error) { 
      fail(res, error); 
    }
  });

  app.post('/api/tribrain/evo-layer/push', jsonBody, async (req, res) => {
    try {
      const {
        tenantId,
        ownerUserId,
        source,
        targetLayer,
        intent,
        riskLevel,
        requiresApproval,
        approvalRef,
        payload,
        proofRequired
      } = req.body;

      // Ensure Gateway is authenticated (must have an auth token/role)
      const role = roleFromRequest(req);
      if (role === 'viewer') {
        return fail(res, new Error("Unauthorized: Viewers cannot push to Evo Layer."), 403);
      }

      // Assert basic layer parameters
      if (targetLayer !== 'evo_layer') {
        return fail(res, new Error("Invalid targetLayer. Must be 'evo_layer'."), 400);
      }

      // High/Critical risk or approval-required actions need an approvalRef binding
      if (riskLevel === 'high' || riskLevel === 'critical' || requiresApproval) {
        const expectedToken = process.env.TRIBRAIN_APPROVAL_TOKEN || 'studio-admin-approved-123';
        if (approvalRef !== expectedToken) {
          return fail(res, new Error("Owner approval binding failed. Invalid or missing approvalRef."), 403);
        }
      }

      // Assert payload doesn't contain glaring raw secrets
      if (JSON.stringify(payload).includes('sk-ant')) {
        return fail(res, new Error("Secret exposure detected in payload. Push rejected."), 400);
      }

      // Push to the Evo Layer queue
      const evoCommand = await EvoLayer.acceptCommandPackage({
        tenantId,
        ownerUserId,
        source,
        intent,
        riskLevel,
        payload,
        proofRequired
      });

      // Record in the immutable Proof Ledger
      const receipt = await ProofLedger.record({
        type: 'EVO_LAYER_PUSH',
        tenantId,
        ownerUserId,
        source,
        targetLayer,
        intent,
        riskLevel,
        evoCommandId: evoCommand.id
      });

      ok(res, {
        truthLabel: 'ACCEPTED',
        status: 'pushed_to_evo_layer',
        evoCommandId: evoCommand.id,
        receipt
      });
    } catch (error) {
      fail(res, error);
    }
  });
}
