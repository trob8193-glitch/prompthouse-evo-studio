import { OmniAuditDaemon } from '../src/core/daemons/OmniAuditDaemon.js';
import { AITruthDaemon } from '../src/core/daemons/AITruthDaemon.js';

async function testOmniAudit() {
  console.log('--- Testing OmniAuditDaemon ---');
  const omni = new OmniAuditDaemon();
  await omni.runCycle();
}

async function testAITruth() {
  console.log('--- Testing AITruthDaemon ---');
  const truth = new AITruthDaemon();
  await truth.runCycle();
}

async function run() {
  await testOmniAudit();
  await testAITruth();
}

run().catch(console.error);
