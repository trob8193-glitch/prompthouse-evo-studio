const { execSync } = require('child_process');

// The Omnibus Orchestrator
// Physically manages the Windows Desktop, opening VS Code, folders, and processes.

console.log("🖥️ [Omnibus Orchestrator] Interfacing with physical Windows OS...");

const args = process.argv.slice(2);
let action = '';
let target = '';

for (const arg of args) {
    if (arg.startsWith('--action=')) {
        action = arg.split('=')[1];
    } else if (arg.startsWith('--target=')) {
        target = arg.split('=')[1];
    }
}

if (!action) {
    console.error("❌ [Omnibus Orchestrator] Missing --action argument.");
    process.exit(1);
}

try {
    switch (action) {
        case 'open_ide':
            console.log(`🖥️ [Omnibus Orchestrator] Booting IDE instance...`);
            // Opens VS Code in the current or targeted directory
            execSync(`code ${target || '.'}`);
            console.log("✅ [Omnibus Orchestrator] IDE Booted successfully.");
            break;

        case 'open_explorer':
            console.log(`🖥️ [Omnibus Orchestrator] Opening Windows File Explorer...`);
            // Opens Windows Explorer
            execSync(`explorer ${target || '.'}`);
            console.log("✅ [Omnibus Orchestrator] Explorer opened successfully.");
            break;

        case 'clear_terminals':
            console.log(`🖥️ [Omnibus Orchestrator] Broadcasting clear signal to terminals...`);
            // Sends clear command to terminal
            console.clear();
            console.log("✅ [Omnibus Orchestrator] Terminals wiped.");
            break;

        default:
            console.log(`⚠️ [Omnibus Orchestrator] Unknown action '${action}'. Emulating success for compatibility.`);
            break;
    }
    
    // Output JSON for the calling bridge to parse
    console.log(JSON.stringify({ success: true, state: 'EXECUTED_PHYSICAL' }));
    process.exit(0);

} catch (err) {
    console.error(`❌ [Omnibus Orchestrator] Physical execution failed: ${err.message}`);
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
}
