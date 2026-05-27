import fetch from 'node-fetch';

async function testMcp() {
  const url = 'http://127.0.0.1:3001/mcp/messages';
  const body = {
    method: 'call_tool',
    params: {
      name: 'terminal_command',
      arguments: {
        command: 'dir'
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testMcp();
