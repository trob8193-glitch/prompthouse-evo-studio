async function test() {
  console.log('--- PH EVO LIVE API TRUTH TEST ---');
  try {
    const res = await fetch('http://127.0.0.1:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'TRUTH_TEST: Respond with your model name and version.' }]
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('FAILED:', e.message);
  }
}

test();
