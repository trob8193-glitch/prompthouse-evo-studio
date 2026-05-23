#!/usr/bin/env node

/**
 * Signal Extractor - Solves the 'Signal Noise' problem.
 * Wraps terminal commands, suppresses known benign warnings (e.g. deprecations),
 * and only outputs fatal errors or clean success messages.
 */

import { spawn } from 'child_process';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node signal-extractor.js <command>');
  process.exit(1);
}

const cmd = args[0];
const cmdArgs = args.slice(1);

const child = spawn(cmd, cmdArgs, { shell: true });

let output = '';
let errorOutput = '';

const noisePatterns = [
  /DeprecationWarning/i,
  /WARN/i,
  /notice/i,
  /experimental feature/i,
  /plugin vite:resolve/i,
  /Circular chunk/i,
  /plugin:vite:reporter/i,
  /has been externalized/i,
  /dynamic import will not move/i,
  /\[DEP0190\]/i // Suppress our own spawn shell warning
];

function isNoise(line) {
  return noisePatterns.some(pattern => pattern.test(line));
}

child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim() && !isNoise(line)) {
      process.stdout.write(`\x1b[36m[STUDIO]\x1b[0m ${line}\n`);
    }
  });
});

child.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim() && !isNoise(line)) {
      // If it's a real error, print it red
      if (/error|exception|fail/i.test(line)) {
        process.stderr.write(`\x1b[31m[FATAL]\x1b[0m ${line}\n`);
      } else {
        process.stdout.write(`\x1b[33m[SIGNAL]\x1b[0m ${line}\n`);
      }
    }
  });
});

child.on('close', (code) => {
  if (code !== 0) {
    console.log(`\x1b[31m[STUDIO] Process exited with error code ${code}\x1b[0m`);
    process.exit(code);
  } else {
    console.log(`\x1b[32m[STUDIO] Process exited cleanly.\x1b[0m`);
    process.exit(0);
  }
});
