import fs from 'fs';

export function getEvoProviderConfig({ env = process.env } = {}) {
  return {
    provider: env.EVO_LLM_PROVIDER || 'local-dataset',
    model: env.EVO_LLM_BASE_MODEL || '',
    hasOpenAiKey: Boolean(env.OPENAI_API_KEY),
    hasGeminiKey: Boolean(env.GEMINI_API_KEY),
    maxTrainingBudgetUsd: Number(env.EVO_LLM_MAX_TRAINING_BUDGET_USD || 0),
    allowProviderTraining: env.EVO_LLM_ALLOW_PROVIDER_TRAINING === 'true'
  };
}

export function evaluateEvoProviderGate({ provider = 'local-dataset', env = process.env } = {}) {
  const config = getEvoProviderConfig({ env });
  const external = provider !== 'local-dataset';
  const credentialOk = provider === 'openai' ? config.hasOpenAiKey : provider === 'gemini' ? config.hasGeminiKey : !external;
  const budgetOk = !external || config.maxTrainingBudgetUsd > 0;
  const allowOk = !external || config.allowProviderTraining === true;
  const allowed = !external || (credentialOk && budgetOk && allowOk);
  return {
    provider,
    external,
    allowed,
    truthState: allowed ? 'PROVIDER_GATE_ALLOWED' : 'PROVIDER_GATE_BLOCKED',
    checks: { credentialOk, budgetOk, allowOk },
    blockedReasons: allowed ? [] : [
      !credentialOk ? `Missing credentials for ${provider}.` : null,
      !budgetOk ? 'Missing positive EVO_LLM_MAX_TRAINING_BUDGET_USD.' : null,
      !allowOk ? 'EVO_LLM_ALLOW_PROVIDER_TRAINING is not true.' : null
    ].filter(Boolean)
  };
}

export function createProviderTrainingJobShell({ provider = 'local-dataset', datasetFile = '', evalFile = '' } = {}) {
  const gate = evaluateEvoProviderGate({ provider });
  return {
    createdAt: new Date().toISOString(),
    provider,
    datasetFile,
    evalFile,
    truthState: gate.allowed ? 'PROVIDER_JOB_READY_NOT_SUBMITTED' : 'PROVIDER_JOB_BLOCKED_NOT_SUBMITTED',
    gate,
    submitAllowed: gate.allowed,
    note: 'This adapter shell never submits external training jobs unless the provider gate passes.'
  };
}

export function assertDatasetFilesExist({ datasetFile, evalFile } = {}) {
  return {
    datasetFile,
    evalFile,
    datasetExists: Boolean(datasetFile && fs.existsSync(datasetFile)),
    evalExists: Boolean(evalFile && fs.existsSync(evalFile))
  };
}
