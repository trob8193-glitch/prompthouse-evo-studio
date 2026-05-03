// stress-backend.js - Simulates 50 concurrent agents hitting the CLI bridge.

async function runStressTest() {
  console.log('🚀 Starting Backend Stress Test: Firing 50 Concurrent Build Requests...');
  const start = Date.now();
  
  const promises = [];
  for (let i = 0; i < 50; i++) {
    const mockApp = {
      appName: `stress_test_app_${i}`,
      type: 'Load Test App',
      features: ['auth', 'dashboard'],
      files: {
        'index.js': `console.log("App ${i} running");`,
        'package.json': `{"name": "app_${i}"}`
      }
    };

    const p = fetch('http://localhost:3001/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockApp)
    }).then(res => res.json()).catch(err => ({ error: err.message }));
    
    promises.push(p);
  }

  const results = await Promise.all(promises);
  const end = Date.now();
  
  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;

  console.log(`\n📊 STRESS TEST RESULTS [${end - start}ms]`);
  console.log(`✅ Successes: ${successes}/50`);
  console.log(`❌ Failures: ${failures}/50`);
  
  if (failures > 0) {
    console.log('Errors encountered:', results.filter(r => !r.success));
  } else {
    console.log('🏆 BACKEND IS BULLETPROOF. 0% DROP RATE UNDER MAX CONCURRENCY.');
  }
}

runStressTest();
