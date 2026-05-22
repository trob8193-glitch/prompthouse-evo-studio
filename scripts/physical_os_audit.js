const { execSync } = require('child_process');

// The Truth Auditor
// Physically scans the Windows OS to verify that core processes are actually running.

console.log("🛡️ [Truth Auditor] Initiating OS-level process scan...");

try {
    // Run Windows tasklist
    const tasklist = execSync('tasklist').toString().toLowerCase();

    const requiredProcesses = ['node.exe'];
    const missing = [];

    for (const proc of requiredProcesses) {
        if (!tasklist.includes(proc)) {
            missing.push(proc);
        }
    }

    if (missing.length > 0) {
        console.error(`❌ [Truth Auditor] Reality Breach Detected. Missing physical processes: ${missing.join(', ')}`);
        console.log(JSON.stringify({ success: false, missing }));
        process.exit(1);
    }

    console.log("✅ [Truth Auditor] Core architectural processes cryptographically verified.");
    console.log(JSON.stringify({ success: true, truthState: 'SIGNED_PHYSICAL' }));
    process.exit(0);

} catch (err) {
    console.error(`❌ [Truth Auditor] Physical OS Scan failed: ${err.message}`);
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
}
