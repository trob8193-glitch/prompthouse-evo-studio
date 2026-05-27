async function run() {
  console.log('🚀 Starting NightForge Daemon on port 3001...');
  try {
    const res = await fetch('http://127.0.0.1:3001/api/nightforge/daemon/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intervalMinutes: 60,
        runNow: true
      })
    });
    const result = await res.json();
    console.log('✅ Daemon response:', result);
  } catch (e) {
    console.error('❌ Failed to start daemon:', e.message);
  }
}

run();
