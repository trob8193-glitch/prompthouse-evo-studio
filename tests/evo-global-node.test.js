import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildGlobalContributionPacket,
  createEvoTrainPlan,
  getGlobalNodeStatus,
  runEvoTrainPlan,
  submitGlobalContributionPacket
} from '../src/core/evo-llm/index.js';

import { execSync } from 'child_process';

vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    execSync: vi.fn((cmd, opts) => {
      if (cmd.includes('git')) return 'mocked-git-output';
      return actual.execSync(cmd, opts);
    })
  };
});

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ph-global-node-'));
}

function readAllFiles(rootDir) {
  const out = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(fs.readFileSync(full, 'utf8'));
    }
  }
  walk(rootDir);
  return out.join('\n');
}

describe('Evo LLM global node and BYOK training', () => {
  const created = [];

  afterEach(() => {
    for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it('creates provider plans with a user key without persisting that key', () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    const userKey = 'sk-user-private-training-key-1234567890';

    const { file, plan } = createEvoTrainPlan({
      rootDir,
      provider: 'openai',
      providerApiKey: userKey,
      maxTrainingBudgetUsd: 10,
      allowProviderTraining: true,
      contributionMode: 'private'
    });

    expect(plan.truthState).toBe('PROVIDER_TRAINING_PLAN_READY_FOR_APPROVAL');
    expect(plan.credentialPolicy.source).toBe('user_provided_ephemeral');
    expect(fs.readFileSync(file, 'utf8')).not.toContain(userKey);
  });

  it('runs provider training with a transient user key and does not write the key to disk', async () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    const userKey = 'sk-user-run-key-1234567890';
    const { plan } = createEvoTrainPlan({
      rootDir,
      provider: 'openai',
      providerApiKey: userKey,
      maxTrainingBudgetUsd: 10,
      allowProviderTraining: true
    });

    fs.mkdirSync(path.join(rootDir, '.evo-llm', 'orchestrator', 'approvals'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, '.evo-llm', 'orchestrator', 'approvals', 'approval.json'), JSON.stringify({
      id: 'approval',
      planId: plan.id,
      scope: 'provider-training',
      truthState: 'PROVIDER_TRAINING_APPROVED_PENDING_CREDENTIAL_AND_BUDGET_CHECKS'
    }));

    const fetchImpl = async (url, options = {}) => {
      expect(options.headers.Authorization).toBe(`Bearer ${userKey}`);
      if (String(url).endsWith('/v1/files')) {
        return { ok: true, status: 200, json: async () => ({ id: `file_${Math.random()}` }) };
      }
      return { ok: true, status: 200, json: async () => ({ id: 'ftjob_user', status: 'queued', fine_tuned_model: null }) };
    };

    const result = await runEvoTrainPlan({
      rootDir,
      planId: plan.id,
      providerApiKey: userKey,
      maxTrainingBudgetUsd: 10,
      allowProviderTraining: true,
      fetchImpl
    });

    expect(result.run.truthState).toBe('PROVIDER_FINE_TUNE_JOB_SUBMITTED');
    expect(readAllFiles(path.join(rootDir, '.evo-llm'))).not.toContain(userKey);
  });

  it('packages redacted global contributions and blocks hub submit until hub gates are configured', async () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    const packetResult = buildGlobalContributionPacket({
      rootDir,
      includeExamples: true,
      consent: { globalContribution: true, dataRightsConfirmed: true }
    });

    expect(packetResult.packet.truthState).toBe('GLOBAL_CONTRIBUTION_PACKET_READY');
    expect(packetResult.packet.containsExamples).toBe(true);
    expect(JSON.stringify(packetResult.packet)).not.toMatch(/sk-[A-Za-z0-9_-]{12,}/);

    const blocked = await submitGlobalContributionPacket({ rootDir, packetId: packetResult.packet.packetId });
    expect(blocked.receipt.truthState).toBe('GLOBAL_HUB_SUBMISSION_BLOCKED');
    expect(blocked.receipt.blockers).toContain('Contribution packet must be signed before hub submission.');
  }, 15000);

  it('submits signed packets to a configured hub without persisting the hub token', async () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    const env = {
      ...process.env,
      GLOBAL_EVO_CONTRIBUTION_OPT_IN: 'true',
      GLOBAL_EVO_DATA_RIGHTS_CONFIRMED: 'true',
      GLOBAL_EVO_NODE_SIGNING_SECRET: 'node-signing-secret',
      GLOBAL_EVO_HUB_URL: 'https://hub.example.test',
      GLOBAL_EVO_HUB_TOKEN: 'hub-token-secret'
    };
    const { packet } = buildGlobalContributionPacket({
      rootDir,
      env,
      includeExamples: true,
      consent: { globalContribution: true, dataRightsConfirmed: true }
    });

    const submitted = await submitGlobalContributionPacket({
      rootDir,
      env,
      packetId: packet.packetId,
      fetchImpl: async (url, options = {}) => {
        expect(url).toBe('https://hub.example.test/api/evo-global/contributions');
        expect(options.headers.Authorization).toBe('Bearer hub-token-secret');
        return { ok: true, status: 200, json: async () => ({ id: 'hub_receipt_1' }) };
      }
    });

    expect(submitted.receipt.truthState).toBe('GLOBAL_CONTRIBUTION_SUBMITTED');
    expect(submitted.receipt.hubReceiptId).toBe('hub_receipt_1');
    expect(readAllFiles(path.join(rootDir, '.evo-llm'))).not.toContain('hub-token-secret');

    const status = getGlobalNodeStatus({ rootDir, env });
    expect(status.truthState).toBe('GLOBAL_NODE_READY_TO_SUBMIT');
  });
});
