import fs from 'fs';
import path from 'path';
import { listCostSavingsReceipts } from './costSavingsLedger.js';

const rulesFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'cost-firewall', 'budget_rules.json');

const DEFAULT_BUDGET_RULES = Object.freeze({
  dailyMaxEstimatedDollars: 5,
  monthlyMaxEstimatedDollars: 100,
  maxCloudCallsPerDay: 100,
  maxCloudCallsPerMonth: 2000,
  requireApprovalOverEstimatedCost: 1,
  blockIfMarginBelowPercent: 60,
  freePlanCloudCallsPerDay: 0,
});

export function loadBudgetRules({ rootDir = process.cwd(), orgId = 'default' } = {}) {
  const file = rulesFile(rootDir);
  if (!fs.existsSync(file)) return { ...DEFAULT_BUDGET_RULES };
  try {
    const all = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { ...DEFAULT_BUDGET_RULES, ...(all[orgId] || {}) };
  } catch {
    return { ...DEFAULT_BUDGET_RULES };
  }
}

export function saveBudgetRules({ rootDir = process.cwd(), orgId = 'default', rules = {} } = {}) {
  const file = rulesFile(rootDir);
  let all = {};
  if (fs.existsSync(file)) {
    try { all = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { all = {}; }
  }
  all[orgId] = { ...DEFAULT_BUDGET_RULES, ...rules };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');
  return all[orgId];
}

function isSameDay(iso) {
  return String(iso || '').slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function isSameMonth(iso) {
  return String(iso || '').slice(0, 7) === new Date().toISOString().slice(0, 7);
}

export function evaluateBudgetRules({ rootDir = process.cwd(), orgId = 'default', orgPlan = 'free', estimatedCost = 0, provider = 'local' } = {}) {
  const rules = loadBudgetRules({ rootDir, orgId });
  const receipts = listCostSavingsReceipts({ rootDir, limit: 5000 }).filter(item => !orgId || item.orgId === orgId);
  const today = receipts.filter(item => isSameDay(item.createdAt));
  const month = receipts.filter(item => isSameMonth(item.createdAt));
  const dailySpend = today.reduce((sum, item) => sum + Number(item.actualCostAfterFirewall || 0), 0);
  const monthlySpend = month.reduce((sum, item) => sum + Number(item.actualCostAfterFirewall || 0), 0);
  const dailyCloudCalls = today.filter(item => item.selectedProvider !== 'local').length;
  const monthlyCloudCalls = month.filter(item => item.selectedProvider !== 'local').length;
  const blockedReasons = [];
  const approvalReasons = [];

  if (orgPlan === 'free' && provider !== 'local' && dailyCloudCalls >= rules.freePlanCloudCallsPerDay) {
    blockedReasons.push('Free plan cloud calls are not allowed by budget rules.');
  }
  if (dailySpend + estimatedCost > rules.dailyMaxEstimatedDollars) blockedReasons.push('Daily estimated API budget would be exceeded.');
  if (monthlySpend + estimatedCost > rules.monthlyMaxEstimatedDollars) blockedReasons.push('Monthly estimated API budget would be exceeded.');
  if (provider !== 'local' && dailyCloudCalls >= rules.maxCloudCallsPerDay) blockedReasons.push('Daily cloud call limit reached.');
  if (provider !== 'local' && monthlyCloudCalls >= rules.maxCloudCallsPerMonth) blockedReasons.push('Monthly cloud call limit reached.');
  if (estimatedCost >= rules.requireApprovalOverEstimatedCost) approvalReasons.push('Estimated request cost exceeds approval threshold.');

  return {
    allowed: blockedReasons.length === 0,
    requiresApproval: approvalReasons.length > 0,
    blockedReasons,
    approvalReasons,
    rules,
    usage: { dailySpend, monthlySpend, dailyCloudCalls, monthlyCloudCalls }
  };
}

export { DEFAULT_BUDGET_RULES };
