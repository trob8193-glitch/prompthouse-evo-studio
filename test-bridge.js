async function test() {
  const res = await fetch('http://localhost:3001/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appName: 'test_app',
      files: {
        'main.dart': 'void main() {}'
      }
    })
  });
  console.log(await res.json());
}

test();
