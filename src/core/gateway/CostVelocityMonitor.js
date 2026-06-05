import { listCostSavingsReceipts } from './costSavingsLedger.js';

export const DEFAULT_COST_VELOCITY_RULES = Object.freeze({
  windowMs: 60 * 1000,
  maxRequestsPerWindow: 30,
  maxDollarsPerWindow: 5,
  maxCloudCallsPerWindow: 10
});

export function evaluateCostVelocity({ rootDir = process.cwd(), orgId = 'default', rules = {} } = {}) {
  const finalRules = { ...DEFAULT_COST_VELOCITY_RULES, ...rules };
  const since = Date.now() - finalRules.windowMs;
  const receipts = listCostSavingsReceipts({ rootDir, limit: 5000 })
    .filter(item => !orgId || item.orgId === orgId)
    .filter(item => new Date(item.createdAt || 0).getTime() >= since);

  const dollars = receipts.reduce((sum, item) => sum + Number(item.actualCostAfterFirewall || 0), 0);
  const cloudCalls = receipts.filter(item => item.selectedProvider && item.selectedProvider !== 'local').length;
  const issues = [];

  if (receipts.length > finalRules.maxRequestsPerWindow) {
    issues.push(`Request velocity ${receipts.length} exceeds ${finalRules.maxRequestsPerWindow}.`);
  }
  if (dollars > finalRules.maxDollarsPerWindow) {
    issues.push(`Cost velocity $${dollars.toFixed(4)} exceeds $${finalRules.maxDollarsPerWindow}.`);
  }
  if (cloudCalls > finalRules.maxCloudCallsPerWindow) {
    issues.push(`Cloud call velocity ${cloudCalls} exceeds ${finalRules.maxCloudCallsPerWindow}.`);
  }

  return {
    allowed: issues.length === 0,
    truthState: issues.length ? 'COST_VELOCITY_REVIEW_REQUIRED' : 'COST_VELOCITY_SAFE',
    windowMs: finalRules.windowMs,
    requests: receipts.length,
    dollars,
    cloudCalls,
    issues,
    rules: finalRules
  };
}

export default { evaluateCostVelocity, DEFAULT_COST_VELOCITY_RULES };
