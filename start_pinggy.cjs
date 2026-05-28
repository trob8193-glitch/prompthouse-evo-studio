const { spawn } = require('child_process');
const fs = require('fs');

console.log("Starting Pinggy tunnel...");
const p = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-p', '443', '-R0:localhost:3001', 'a.pinggy.io']);

let urlFound = false;

p.stdout.on('data', (data) => {
    const text = data.toString();
    console.log("[Pinggy Out]", text);
    extractUrl(text);
});

p.stderr.on('data', (data) => {
    const text = data.toString();
    console.log("[Pinggy Err]", text);
    extractUrl(text);
});

function extractUrl(text) {
    if (urlFound) return;
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.a\.pinggy\.link/);
    if (match) {
        urlFound = true;
        const url = match[0];
        console.log("\n\n>>> PINGGY URL FOUND:", url, "\n\n");
        fs.writeFileSync('pinggy_url.txt', url, 'utf8');
    }
}
