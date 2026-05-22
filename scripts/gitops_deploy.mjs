import { execSync } from 'child_process';

// GitOps Actuation
// Automatically commits all codebase changes and pushes them to the current remote branch.

console.log("🚀 [GitOps Actuator] Initializing Zero-Touch Deployment...");

try {
    // 1. Sync remote before staging to avoid detached heads or divergence
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    console.log(`🌐 Syncing with origin/${branch}...`);
    try {
        execSync(`git pull origin ${branch} --rebase`, { stdio: 'inherit' });
    } catch (e) {
        console.warn("⚠️ [GitOps] Rebase encountered an issue or origin is unreachable. Proceeding with caution.");
    }

    // 2. Check for actual changes mathematically
    const status = execSync('git status --porcelain').toString().trim();
    if (!status) {
        console.log("✅ [GitOps Actuator] No changes detected. Aborting commit cycle safely.");
        process.exit(0);
    }

    // 3. Stage all changes
    console.log("📦 Staging all files...");
    execSync('git add .', { stdio: 'inherit' });

    // 4. Commit with an autonomous signature
    console.log("📝 Writing autonomous commit message...");
    execSync('git commit -m "🌌 [Genesis Forge] Autonomous Fortification Patch (Mastery)"', { stdio: 'inherit' });

    // 5. Push to current branch
    console.log(`🌐 Pushing to origin/${branch}...`);
    execSync(`git push origin ${branch}`, { stdio: 'inherit' });

    console.log("✅ [GitOps Actuator] Codebase successfully synced with cloud repository.");
} catch (err) {
    console.error("❌ [GitOps Actuator] Fatal error during deployment cycle:", err.message);
    process.exit(1);
}
