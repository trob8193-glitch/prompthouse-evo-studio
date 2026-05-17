import { summarizeCostSavings, listCostSavingsReceipts } from './costSavingsLedger.js';

export function certifySavingsClaim({ rootDir = process.cwd(), minimumSampleSize = 25, claimPercent = 80 } = {}) {
  const summary = summarizeCostSavings({ rootDir, limit: 5000 });
  const receipts = listCostSavingsReceipts({ rootDir, limit: 5000 });
  const peakSavingsPercent = receipts.reduce((max, item) => Math.max(max, Number(item.estimatedSavingsPercent || 0)), 0);
  const certified = summary.requests >= minimumSampleSize && summary.averageSavingsPercent >= claimPercent;
  return {
    claim: `Reduced API costs by ${claimPercent}%`,
    certified,
    sampleSize: summary.requests,
    averageSavingsPercent: summary.averageSavingsPercent,
    peakSavingsPercent,
    confidence: summary.requests >= 100 ? 'HIGH' : summary.requests >= minimumSampleSize ? 'MEDIUM' : 'LOW',
    reason: certified
      ? 'Savings claim is backed by sufficient ledger receipts.'
      : 'Savings claim is not yet backed by enough measured receipts or average savings.',
    summary
  };
}

export function listCertifiedSavingsClaims({ rootDir = process.cwd() } = {}) {
  return [50, 60, 70, 80].map(percent => certifySavingsClaim({ rootDir, claimPercent: percent }));
}
