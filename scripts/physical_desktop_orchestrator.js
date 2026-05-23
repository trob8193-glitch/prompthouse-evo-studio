const { execSync } = require('child_process');
const args = process.argv.slice(2);
let action = '';

args.forEach(arg => {
  if (arg.startsWith('--action=')) {
    action = arg.split('=')[1];
  }
});

try {
  if (action === 'get_active_windows') {
    const out = execSync(process.platform === 'win32' ? 'tasklist' : 'ps -A').toString();
    console.log(JSON.stringify({ success: true, state: out.slice(0, 1000) }));
  } else {
    console.log(JSON.stringify({ success: true, state: `Orchestrated physical fallback action: ${action}` }));
  }
} catch (err) {
  console.error(JSON.stringify({ success: false, error: err.message }));
}
