import http from 'http';
import https from 'https';

export class EvoDeepLoadTester {
  /**
   * Run a deep load test against a target URL.
   * @param {string} url - Target endpoint
   * @param {number} concurrency - Number of concurrent connections
   * @param {number} durationMs - How long to hammer the server
   * @returns {Promise<Object>} Performance Report
   */
  static async stressTest(url, concurrency = 50, durationMs = 10000) {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);

    const stats = {
      totalRequests: 0,
      successful: 0,
      failed: 0,
      latencies: [],
      startMem: process.memoryUsage().heapUsed,
      endMem: 0,
      rps: 0,
      avgLatency: 0,
      p95Latency: 0
    };

    let isRunning = true;
    const startTime = Date.now();

    // Timer to stop the test
    setTimeout(() => {
      isRunning = false;
    }, durationMs);

    const makeRequest = () => {
      return new Promise((resolve) => {
        if (!isRunning) return resolve();

        const reqStart = performance.now();
        const req = client.get(urlObj, (res) => {
          // Consume response data to free up memory
          res.on('data', () => { return; });
          res.on('end', () => {
            const reqEnd = performance.now();
            stats.latencies.push(reqEnd - reqStart);
            stats.totalRequests++;

            if (res.statusCode >= 200 && res.statusCode < 400) {
              stats.successful++;
            } else {
              stats.failed++;
            }

            // Loop immediately
            if (isRunning) makeRequest().then(resolve);
            else resolve();
          });
        });

        req.on('error', () => {
          stats.totalRequests++;
          stats.failed++;
          if (isRunning) makeRequest().then(resolve);
          else resolve();
        });

        req.end();
      });
    };

    // Spin up concurrent workers
    const workers = Array(concurrency).fill(0).map(() => makeRequest());
    await Promise.all(workers);

    // Calculate Metrics
    const actualDurationMs = Date.now() - startTime;
    stats.endMem = process.memoryUsage().heapUsed;
    stats.rps = Math.round((stats.totalRequests / actualDurationMs) * 1000);
    
    if (stats.latencies.length > 0) {
      stats.latencies.sort((a, b) => a - b);
      const sum = stats.latencies.reduce((a, b) => a + b, 0);
      stats.avgLatency = Math.round(sum / stats.latencies.length);
      
      const p95Index = Math.floor(stats.latencies.length * 0.95);
      stats.p95Latency = Math.round(stats.latencies[p95Index]);
    }

    return stats;
  }
}
