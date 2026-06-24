#!/usr/bin/env node
import dotenv from 'dotenv';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  buildConnectorProbePlan,
  executeConnectorProbe,
} from '../lib/connectors/externalConnectorExecutor.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

const args = new Set(process.argv.slice(2));
const live = args.has('--live');
const connectors = [
  { id: 'conn_github', name: 'GitHub', connector_id: 'github-1', type: 'github', status: process.env.GITHUB_TOKEN ? 'configured' : 'connected' },
  { id: 'conn_openai', name: 'OpenAI', connector_id: 'openai-1', type: 'openai', status: process.env.OPENAI_API_KEY ? 'configured' : 'needs_credentials' },
  { id: 'conn_stripe', name: 'Stripe', connector_id: 'stripe-1', type: 'stripe', status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'needs_credentials' },
  { id: 'conn_vercel', name: 'Vercel', connector_id: 'vercel-1', type: 'vercel', status: process.env.VERCEL_TOKEN ? 'configured' : 'needs_credentials' },
];

function buildApprovals() {
  const scopes = new Set(
    String(process.env.PH_CONNECTOR_LIVE_SCOPES || process.env.PH_PROVIDER_LIVE_SCOPE || '')
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean)
  );
  if (process.env.PH_PROVIDER_LIVE_APPROVAL !== 'true') return {};

  const approvals = {};
  for (const scope of ['provider_probe', 'commerce', 'deploy']) {
    if (scopes.has(scope) || scopes.has('all')) {
      approvals[scope] = {
        granted: true,
        scope,
        receiptId: process.env.PH_PROVIDER_LIVE_RECEIPT || `env_${scope}`,
        grantedAt: new Date().toISOString(),
      };
    }
  }
  return approvals;
}

const ownerApprovals = buildApprovals();
const mode = live ? 'live' : 'local';
const probes = [];

for (const connector of connectors) {
  probes.push(await executeConnectorProbe(connector, {
    mode,
    ownerApprovals,
    timeoutMs: Number(process.env.PH_CONNECTOR_TIMEOUT_MS || 8000),
  }));
}

const providerGates = probes.filter((probe) => ['blocked'].includes(probe.status));
const localFailures = probes.filter((probe) => probe.status === 'error' || probe.truthState === 'BLOCKED');
const liveBlockers = probes.filter((probe) => ['blocked', 'error'].includes(probe.status));
const success = live ? liveBlockers.length === 0 : localFailures.length === 0;
const report = {
  success,
  truthState: live
    ? liveBlockers.length
      ? 'PROVIDER_GATED'
      : 'PROVEN'
    : localFailures.length
      ? 'LOCAL_CONTRACTS_HAVE_ERRORS'
      : providerGates.length
        ? 'LOCAL_CONTRACTS_READY_PROVIDER_GATED'
        : 'LOCAL_ONLY',
  liveRequested: live,
  checkedAt: new Date().toISOString(),
  plans: connectors.map((connector) => buildConnectorProbePlan(connector, { mode })),
  probes,
  providerGates,
  liveBlockers,
  localFailures,
};

const outDir = join(process.cwd(), '.ai', 'outbox');
mkdirSync(outDir, { recursive: true });
const reportPath = join(outDir, 'external-connector-proof.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify({
  success: report.success,
  truthState: report.truthState,
  liveRequested: report.liveRequested,
  connected: probes.filter((probe) => probe.status === 'connected').length,
  providerGates: providerGates.map((probe) => ({
    provider: probe.provider,
    connectorId: probe.connectorId,
    truthState: probe.truthState,
    reason: probe.reason,
  })),
  localFailures: localFailures.map((probe) => ({
    provider: probe.provider,
    connectorId: probe.connectorId,
    truthState: probe.truthState,
    reason: probe.reason,
  })),
  file: reportPath,
}, null, 2));

if ((live && liveBlockers.length > 0) || (!live && localFailures.length > 0)) {
  process.exitCode = 1;
}
