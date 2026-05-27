import { evaluateCostedRequest, summarizeCostSavings, listCostSavingsReceipts, listCertifiedSavingsClaims, getSemanticCacheStats } from '../src/core/gateway/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const args = process.argv.slice(2);
const summary = args.includes('--summary');
const claims = args.includes('--claims');
const cache = args.includes('--cache');

if (summary) {
  Log.info(JSON.stringify(summarizeCostSavings(), null, 2));
  process.exit(0);
}

if (claims) {
  Log.info(JSON.stringify(listCertifiedSavingsClaims(), null, 2));
  process.exit(0);
}

if (cache) {
  Log.info(JSON.stringify(getSemanticCacheStats(), null, 2));
  process.exit(0);
}

const result = evaluateCostedRequest({
  orgId: 'org_test',
  orgPlan: args.includes('--paid') ? 'paid' : 'free',
  endpoint: '/api/nightforge/cycle',
  taskType: 'diagnostic_review',
  taskComplexity: args.includes('--advanced') ? 'advanced' : 'standard',
  providerAllowed: 'any',
  messages: [
    { role: 'user', content: 'Audit PromptHouse Evo Studio and recommend safe proof-gated repairs.' }
  ],
  expectedOutputTokens: 1200
});

Log.info(JSON.stringify(result, null, 2));
process.exit(result.allowed ? 0 : 1);
