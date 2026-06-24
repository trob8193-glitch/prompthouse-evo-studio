#!/usr/bin/env node

import dotenv from 'dotenv';
import { writeProviderActivationProof } from '../server/services/provider-activation-proof.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

const args = new Set(process.argv.slice(2));
const live = args.has('--live');
const ownerApproval = live ? {
  granted: process.env.PH_PROVIDER_LIVE_APPROVAL === 'true',
  scope: process.env.PH_PROVIDER_LIVE_SCOPE || '',
  receiptId: process.env.PH_PROVIDER_LIVE_RECEIPT || ''
} : {};

const report = writeProviderActivationProof({
  rootDir: process.cwd(),
  live,
  ownerApproval
});

console.log(JSON.stringify({
  success: true,
  truthState: report.truthState,
  liveRequested: report.liveRequested,
  summary: report.summary,
  blockers: report.blockers.map((item) => ({
    provider: item.provider,
    action: item.action,
    truthState: item.truthState,
    message: item.message
  })),
  files: report.files
}, null, 2));

if (live && report.blockers.length > 0) {
  process.exit(1);
}
