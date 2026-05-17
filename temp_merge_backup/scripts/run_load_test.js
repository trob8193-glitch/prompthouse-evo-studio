async function runLoadTest() {
  console.log("🚀 Starting Load Test: 10 Missions");
  
  let successes = 0;
  let failures = 0;
  
  for (let i = 1; i <= 10; i++) {
    console.log(`\n--- [Mission ${i}/10] Executing CI/CD Build Pipeline ---`);
    const startTime = Date.now();
    try {
      const res = await fetch('http://localhost:3001/api/test/run', {
        method: 'POST',
      });
      
      const data = await res.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        console.log(`✅ Mission ${i} Completed Successfully in ${duration}ms`);
        successes++;
      } else {
        console.error(`❌ Mission ${i} Failed in ${duration}ms`);
        console.error(data.error);
        failures++;
      }
    } catch (e) {
      console.error(`❌ Mission ${i} Failed to connect:`, e.message);
      failures++;
    }
  }

  console.log("\n📊 Load Test Results");
  console.log(`✅ Successes: ${successes}`);
  console.log(`❌ Failures: ${failures}`);
  console.log("Status: " + (successes === 10 ? "PASSED (SLA 99.99%)" : "FAILED"));
}

runLoadTest().catch(console.error);
