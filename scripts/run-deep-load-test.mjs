import { EvoDeepLoadTester } from '../src/core/audit/EvoDeepLoadTester.js';

async function run() {
  const targetUrl = process.argv[2] || 'http://localhost:5173/';
  const concurrency = parseInt(process.argv[3]) || 50;
  const durationMs = parseInt(process.argv[4]) || 5000;

  console.log(`[EvoDeepLoad] 🚀 Initiating Deep Stress Test`);
  console.log(`Target: ${targetUrl}`);
  console.log(`Concurrency: ${concurrency} virtual users`);
  console.log(`Duration: ${durationMs}ms`);
  console.log(`Hammering server... Please wait.\n`);

  try {
    const report = await EvoDeepLoadTester.stressTest(targetUrl, concurrency, durationMs);
    
    console.log(`=== EVO DEEP LOAD REPORT ===`);
    console.log(`Status: ${report.failed === 0 ? '✅ STABLE' : '❌ UNSTABLE'}`);
    console.log(`Total Requests: ${report.totalRequests}`);
    console.log(`Successful: ${report.successful}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Throughput: ${report.rps} Req/Sec`);
    console.log(`Avg Latency: ${report.avgLatency}ms`);
    console.log(`p95 Latency: ${report.p95Latency}ms`);
    
    const memDiffMB = ((report.endMem - report.startMem) / 1024 / 1024).toFixed(2);
    console.log(`Memory Delta: ${memDiffMB} MB (Heap)`);
    console.log(`============================\n`);

  } catch (e) {
    console.error(`[EvoDeepLoad] 💥 Test execution failed:`, e);
  }
}

run();
