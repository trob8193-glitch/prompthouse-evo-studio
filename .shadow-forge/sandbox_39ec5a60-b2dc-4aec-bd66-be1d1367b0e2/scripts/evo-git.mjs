import { createEvoGitSnapshot, checkLocalToolAdapters, checkApiAdapters, summarizeToolReadiness, listToolChecks, listDaemonReceipts } from '../src/core/egit/index.js';

const args = process.argv.slice(2);
const mode = args[0] || 'status';

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

try {
  if (mode === 'snapshot') {
    print(createEvoGitSnapshot({ label: args[1] || 'manual_snapshot' }));
  } else if (mode === 'adapters') {
    const local = checkLocalToolAdapters();
    const api = checkApiAdapters();
    print({ success: true, local, api, readiness: summarizeToolReadiness() });
  } else if (mode === 'checks') {
    print({ success: true, checks: listToolChecks() });
  } else if (mode === 'daemons') {
    print({ success: true, receipts: listDaemonReceipts() });
  } else {
    print({ success: true, mode: 'status', readiness: summarizeToolReadiness(), daemonReceipts: listDaemonReceipts({ limit: 25 }) });
  }
} catch (error) {
  print({ success: false, error: error.message, code: 'EVO_GIT_CLI_ERROR' });
  process.exit(1);
}
