import { estimateRequestTokens } from './tokenMeter.js';
import { estimateProviderCost } from './providerPriceRegistry.js';
import { evaluateBudgetRules } from './budgetRulesEngine.js';
import { evaluateProfitGuard, planRevenueFromPlan } from './profitGuardian.js';
import { appendCostSavingsReceipt } from './costSavingsLedger.js';
import { enqueueCostReview } from './costApprovalQueue.js';
import { routeModelV2 } from './modelRouterV2.js';

export function evaluateCostedRequest({
  rootDir = process.cwd(),
  orgId = 'default',
  orgPlan = 'free',
  endpoint = '',
  taskType = 'general',
  messages = [],
  expectedOutputTokens = 800,
  providerAllowed = 'any',
  taskComplexity = 'standard',
  compressedMessages = null,
  currentMonthCost = 0
} = {}) {
  const originalTokens = estimateRequestTokens({ messages, expectedOutputTokens });
  const effectiveMessages = compressedMessages || messages;
  const effectiveTokens = estimateRequestTokens({ messages: effectiveMessages, expectedOutputTokens });
  const route = routeModelV2({
    orgPlan,
    endpoint,
    taskComplexity,
    providerAllowed,
    inputTokens: effectiveTokens.inputTokens,
    outputTokens: effectiveTokens.outputTokens
  });

  const selectedCost = estimateProviderCost({
    provider: route.selectedProvider,
    model: route.selectedModel,
    inputTokens: effectiveTokens.inputTokens,
    outputTokens: effectiveTokens.outputTokens
  });

  const baseline = estimateProviderCost({
    provider: 'openai',
    model: 'gpt-4o-mini',
    inputTokens: originalTokens.inputTokens,
    outputTokens: originalTokens.outputTokens
  });

  const budget = evaluateBudgetRules({
    rootDir,
    orgId,
    orgPlan,
    estimatedCost: selectedCost.estimatedCost || 0,
    provider: route.selectedProvider
  });

  const profit = evaluateProfitGuard({
    planRevenueMonthly: planRevenueFromPlan(orgPlan),
    currentMonthCost,
    estimatedRequestCost: selectedCost.estimatedCost || 0,
    provider: route.selectedProvider,
    minimumMarginPercent: budget.rules.blockIfMarginBelowPercent
  });

  const blockedReasons = [];
  if (!selectedCost.known) blockedReasons.push(selectedCost.reason);
  blockedReasons.push(...budget.blockedReasons);
  if (!profit.allowed) blockedReasons.push(profit.reason);

  const requiresReview = Boolean(budget.requiresApproval || profit.requiresApproval || selectedCost.requiresOwnerApproval);
  let review = null;
  if (requiresReview || blockedReasons.length > 0) {
    review = enqueueCostReview({
      rootDir,
      orgId,
      endpoint,
      estimatedCost: selectedCost.estimatedCost || 0,
      reason: [...budget.approvalReasons, ...blockedReasons].join(' ') || 'Cost review required.'
    });
  }

  const estimatedWithout = baseline.estimatedCost || 0;
  const actual = selectedCost.estimatedCost || 0;
  const saved = Math.max(0, estimatedWithout - actual);
  const receipt = appendCostSavingsReceipt({
    orgId,
    endpoint,
    taskType,
    selectedProvider: route.selectedProvider,
    selectedModel: route.selectedModel,
    cloudProviderAvoided: route.selectedProvider === 'local' ? 'openai:gpt-4o-mini' : null,
    inputTokensBeforeCompression: originalTokens.inputTokens,
    inputTokensAfterCompression: effectiveTokens.inputTokens,
    tokensSaved: Math.max(0, originalTokens.inputTokens - effectiveTokens.inputTokens),
    estimatedCostWithoutFirewall: estimatedWithout,
    actualCostAfterFirewall: actual,
    estimatedSavingsDollars: saved,
    estimatedSavingsPercent: estimatedWithout > 0 ? Number(((saved / estimatedWithout) * 100).toFixed(2)) : 0,
    decisionReason: route.decisionReason,
    blocked: blockedReasons.length > 0,
    requiresReview
  }, rootDir);

  return {
    allowed: blockedReasons.length === 0 && !requiresReview,
    requiresReview,
    blockedReasons,
    review,
    route,
    selectedCost,
    budget,
    profit,
    receipt
  };
}

export default { evaluateCostedRequest };
