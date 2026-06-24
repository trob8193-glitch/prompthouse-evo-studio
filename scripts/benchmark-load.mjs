import fetch from 'node-fetch';

const TARGET_URL = process.argv[2] || 'http://localhost:3000/api/health';
const CONCURRENCY = parseInt(process.argv[3], 10) || 50;
const DURATION_MS = parseInt(process.argv[4], 10) || 5000;

console.log(`🚀 Benchmarking ${TARGET_URL} with concurrency ${CONCURRENCY} for ${DURATION_MS}ms...`);

let totalRequests = 0;
let successRequests = 0;
let failRequests = 0;
const startTime = Date.now();
let isRunning = true;

setTimeout(() => {
  isRunning = false;
}, DURATION_MS);

async function runWorker() {
  while (isRunning) {
    totalRequests++;
    try {
      const res = await fetch(TARGET_URL);
      if (res.ok) successRequests++;
      else failRequests++;
    } catch (err) {
      failRequests++;
    }
  }
}

async function start() {
  const workers = Array.from({ length: CONCURRENCY }).map(() => runWorker());
  await Promise.all(workers);
  
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const rps = (totalRequests / elapsedSeconds).toFixed(2);
  
  console.log(`\n📊 Benchmark Results:`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Success:        ${successRequests}`);
  console.log(`Failed:         ${failRequests}`);
  console.log(`Req/Sec (RPS):  ${rps}`);
}

start().catch(console.error);
