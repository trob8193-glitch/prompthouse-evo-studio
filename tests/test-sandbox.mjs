import { createEphemeralSandbox, destroySandbox } from '../src/core/evolution/EphemeralSandbox.js';
import { runProofCommands } from '../src/core/evolution/ProofRunner.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function run() {
  const runId = crypto.randomUUID();
  console.log(`Creating sandbox ${runId}...`);
  const sandboxDir = createEphemeralSandbox(process.cwd(), runId);
  console.log(`Sandbox created at ${sandboxDir}`);

  // verify node_modules exists
  const nm = path.join(sandboxDir, 'node_modules');
  if (fs.existsSync(nm)) {
    console.log(`node_modules exists: true`);
  } else {
    console.log(`node_modules exists: false (FAILED)`);
  }

  // running proof
  console.log(`Running build in sandbox...`);
  const proof = await runProofCommands({
    workspaceDir: sandboxDir,
    commands: ['npm run build'],
    receiptDir: path.join(sandboxDir, 'receipts')
  });

  console.log(`Proof passed: ${proof.passed}`);

  console.log(`Destroying sandbox...`);
  destroySandbox(sandboxDir);
  console.log(`Destroyed: ${!fs.existsSync(sandboxDir)}`);
}

run().catch(console.error);
