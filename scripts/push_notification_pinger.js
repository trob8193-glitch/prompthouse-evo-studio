import http from 'http';

function pushNotification() {
  const data = JSON.stringify({ message: "Hello! This is a direct Sovereign Uplink push notification from the Studio Brain on your PC! I have successfully completed the Nuclear Audit and I am fully connected to your device." });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/push-notification',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        if (result.success && result.pushedTo > 0) {
          console.log(`Success! Notification pushed to ${result.pushedTo} connected phones.`);
          process.exit(0); // Exit once successful
        } else {
          console.log('Server is running but no phones are connected yet. Waiting...');
          setTimeout(pushNotification, 3000);
        }
      } catch(e) {
        setTimeout(pushNotification, 3000);
      }
    });
  });

  req.on('error', () => {
    console.log('Waiting for bridge server to restart...');
    setTimeout(pushNotification, 3000);
  });

  req.write(data);
  req.end();
}

console.log('Studio Notification Pinger started. Waiting to catch your phone...');
pushNotification();
