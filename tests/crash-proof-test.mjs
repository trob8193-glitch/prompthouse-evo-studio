import { CrashProofEngine } from '../src/core/autonomy/CrashProofEngine.js';

CrashProofEngine.initialize('TestCrashDaemon');

console.log("About to throw an unhandled exception to test the engine...");

setTimeout(() => {
  throw new Error("Simulated FATAL ERROR: Variable 'x' is undefined.");
}, 500);
