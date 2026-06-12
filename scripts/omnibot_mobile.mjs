#!/usr/bin/env node
import fs from 'fs';
import {
  getOmnibotMobileContract,
  getOmnibotMobileStatus,
  registerOmnibotMobileSession,
  writeOmnibotMobileReceipt
} from '../src/core/omnibot/OmnibotMobileCore.js';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));

function readJsonArg(flag) {
  const found = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (!found) return null;
  const raw = found.slice(flag.length + 1);
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, 'utf8'));
  return JSON.parse(raw);
}

try {
  if (args.has('--contract')) {
    console.log(JSON.stringify(getOmnibotMobileContract(), null, 2));
    process.exit(0);
  }
  if (args.has('--status')) {
    console.log(JSON.stringify(getOmnibotMobileStatus({ rootDir }), null, 2));
    process.exit(0);
  }
  const session = readJsonArg('--session') || {
    device: 'mobile-operator',
    channel: 'mobile-browser',
    mode: 'status-control',
    allowedIntents: ['status', 'proof', 'safe-plan', 'receipt']
  };
  const result = registerOmnibotMobileSession({ rootDir, session });
  writeOmnibotMobileReceipt({ rootDir, type: 'omnibot_mobile_cli_receipt', payload: result });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ success: false, truthState: 'OMNIBOT_MOBILE_CLI_FAILED', error: error.message }, null, 2));
  process.exit(1);
}
