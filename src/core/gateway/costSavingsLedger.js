import fs from 'fs';
import path from 'path';

const ledgerFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'cost-firewall', 'savings_ledger.jsonl');

export function appendCostSavingsReceipt(receipt = {}, rootDir = process.cwd()) {
  const file = ledgerFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const entry = {
    id: receipt.id || `cost_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...receipt,
  };
  fs.writeFileSync(file, `${JSON.stringify(entry)}\n`, { flag: 'a', encoding: 'utf8' });
  return entry;
}

export function listCostSavingsReceipts({ rootDir = process.cwd(), limit = 250 } = {}) {
  const file = ledgerFile(rootDir);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
  return lines.slice(-limit).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean).reverse();
}

export function summarizeCostSavings({ rootDir = process.cwd(), limit = 1000 } = {}) {
  const receipts = listCostSavingsReceipts({ rootDir, limit });
  const totals = receipts.reduce((acc, item) => {
    acc.requests += 1;
    acc.estimatedCostWithoutFirewall += Number(item.estimatedCostWithoutFirewall || 0);
    acc.actualCostAfterFirewall += Number(item.actualCostAfterFirewall || 0);
    acc.estimatedSavingsDollars += Number(item.estimatedSavingsDollars || 0);
    acc.cloudCallsAvoided += item.cloudProviderAvoided ? 1 : 0;
    acc.cacheHits += item.cacheHit ? 1 : 0;
    acc.tokensSaved += Number(item.tokensSaved || 0);
    return acc;
  }, { requests: 0, estimatedCostWithoutFirewall: 0, actualCostAfterFirewall: 0, estimatedSavingsDollars: 0, cloudCallsAvoided: 0, cacheHits: 0, tokensSaved: 0 });

  totals.averageSavingsPercent = totals.estimatedCostWithoutFirewall > 0
    ? Number(((totals.estimatedSavingsDollars / totals.estimatedCostWithoutFirewall) * 100).toFixed(2))
    : 0;
  return totals;
}
