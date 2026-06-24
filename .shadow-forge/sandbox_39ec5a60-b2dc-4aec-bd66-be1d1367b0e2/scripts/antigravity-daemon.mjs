import { checkLocalToolAdapters, checkApiAdapters, summarizeToolReadiness, writeDaemonReceipt } from '../src/core/egit/index.js';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('antigravity-daemon');

console.log('Antigravity adapter daemon starting with receipts.');

function runCheck() {
  const local = checkLocalToolAdapters();
  const api = checkApiAdapters();
  const readiness = summarizeToolReadiness();
  const receipt = writeDaemonReceipt({
    daemonId: 'antigravity-adapter',
    action: 'adapter_readiness_check',
    truthState: 'CHECK_RECORDED',
    details: {
      localReceipts: local.map(item => item.id),
      apiReceipts: api.map(item => item.id),
      readiness
    },
    claims: ['adapter_readiness_checked', 'external_tools_truth_labeled']
  });
  console.log(`Receipt written: ${receipt.id}`);
  return receipt;
}

runCheck();

setInterval(() => {
  try {
    runCheck();
  } catch (error) {
    const receipt = writeDaemonReceipt({
      daemonId: 'antigravity-adapter',
      action: 'adapter_readiness_error',
      truthState: 'ERROR_RECORDED',
      details: { error: error.message },
      claims: ['error_recorded']
    });
    console.error('Error receipt:', receipt.id, error.message);
  }
}, 30000);

console.log('Antigravity adapter loop active.');
