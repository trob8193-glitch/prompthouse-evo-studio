import { SelfBudgetingEngine } from '../src/core/autonomy/SelfBudgetingEngine.js';
import { SelfMarketingEngine } from '../src/core/autonomy/SelfMarketingEngine.js';

async function testSelfBudgeting() {
  console.log('Testing SelfBudgetingEngine...');
  // Force a call to refill credits for a dummy org
  const success = await SelfBudgetingEngine.attemptAutoRefill('org_test_123', 50);
  console.log(`SelfBudgeting success: ${success}`);
}

async function testSelfMarketing() {
  console.log('Testing SelfMarketingEngine...');
  // Broadcast a dummy message
  const success = await SelfMarketingEngine.broadcastProductRelease(null, 'test_run_001', 'Migrated the entire database from Postgres to SQLite instantaneously without downtime.');
  console.log(`SelfMarketing success: ${success}`);
}

async function run() {
  await testSelfBudgeting();
  await testSelfMarketing();
}

run().catch(console.error);
