import { execSync } from 'child_process';

// GitOps Actuation
// Automatically commits all codebase changes and pushes them to the current remote branch.

console.log("🚀 [GitOps Actuator] Initializing Zero-Touch Deployment...");

try {
    // 1. Stage all changes
    console.log("📦 Staging all files...");
    execSync('git add .', { stdio: 'inherit' });

    // 2. Commit with an autonomous signature
    console.log("📝 Writing autonomous commit message...");
    try {
        execSync('git commit -m "🌌 [Genesis Forge] Autonomous Feature Injection & Self-Healing Patch"', { stdio: 'inherit' });
    } catch (e) {
        console.log("⚠️ No changes to commit, proceeding.");
    }

    // 3. Push to current branch
    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(`🌐 Pushing to origin/${branch}...`);
    execSync(`git push origin ${branch}`, { stdio: 'inherit' });

    console.log("✅ [GitOps Actuator] Codebase successfully synced with cloud repository.");
} catch (err) {
    console.error("❌ [GitOps Actuator] Fatal error during deployment cycle:", err.message);
    process.exit(1);
}
