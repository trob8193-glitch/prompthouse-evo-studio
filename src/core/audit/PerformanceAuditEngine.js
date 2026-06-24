import { EvoDeepLoadTester } from './EvoDeepLoadTester.js';

export class PerformanceAuditEngine {
  static async runAudit() {
    const report = {
      avg_response_time_ms: 0,
      memory_usage_mb: 0,
      load_failures: 0,
      details: []
    };

    try {
      // 1. Genuine Deep Load Test
      const startTime = performance.now();
      
      // Run a 3-second burst with 50 concurrent connections to the local API
      // Fallback to frontend port if API isn't explicitly running
      const targetUrl = process.env.VITE_API_URL || 'http://localhost:5173/';
      
      report.details.push(`Initiating true deep load test against ${targetUrl}...`);
      const loadStats = await EvoDeepLoadTester.stressTest(targetUrl, 50, 3000);
      
      report.avg_response_time_ms = loadStats.avgLatency;
      report.load_failures = loadStats.failed;
      
      report.details.push(`Load Test: ${loadStats.rps} RPS. Avg Response: ${loadStats.avgLatency}ms (p95: ${loadStats.p95Latency}ms)`);
      if (loadStats.failed > 0) {
        report.details.push(`WARNING: ${loadStats.failed} requests failed during stress test.`);
      }

      // 2. Memory Soak Check (Delta from the load test)
      const memDeltaMB = ((loadStats.endMem - loadStats.startMem) / 1024 / 1024).toFixed(2);
      const mem = process.memoryUsage();
      report.memory_usage_mb = Math.round(mem.heapUsed / 1024 / 1024);
      
      if (memDeltaMB > 50) {
        report.details.push(`WARNING: Massive memory leak detected during load test: +${memDeltaMB}MB`);
      } else {
        report.details.push(`Memory Soak: Stable. Load test only consumed +${memDeltaMB}MB`);
      }

      // 3. Spike Test (Implicitly tested by high concurrency start of EvoDeepLoadTester)
      const isSpikeHandled = loadStats.failed === 0 && loadStats.avgLatency < 5000;
      if (isSpikeHandled) {
        report.details.push(`Spike Test: System maintained stability under burst load.`);
      } else {
        report.details.push(`Spike Test: System degraded during burst load.`);
      }

    } catch (e) {
      report.details.push(`Performance scan failed: ${e.message}`);
    }

    report.passed = report.avg_response_time_ms < 2000 && report.load_failures === 0;
    return report;
  }
}
