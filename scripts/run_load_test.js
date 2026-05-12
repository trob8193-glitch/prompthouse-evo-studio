async function runLoadTest() {
  
  
  let successes = 0;
  let failures = 0;
  
  for (let i = 1; i <= 10; i++) {
    
    const startTime = Date.now();
    try {
      const res = await fetch('http://127.0.0.1:3001/api/test/run', {
        method: 'POST',
      });
      
      const data = await res.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        
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

  
  
  
  
}

runLoadTest().catch(console.error);
