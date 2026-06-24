const vscode = require('vscode');
const https = require('http'); // PromptHouse runs on localhost:5174

function activate(context) {
    console.log('PromptHouse Evo Studio VS Code extension is now active!');

    let disposable = vscode.commands.registerCommand('prompthouse.dispatch', async function () {
        const instruction = await vscode.window.showInputBox({
            prompt: "What should the Omni-Sovereign Studio build?",
            placeHolder: "e.g., Audit my frontend architecture..."
        });

        if (!instruction) return;

        // Get active file
        const activeEditor = vscode.window.activeTextEditor;
        const file = activeEditor ? activeEditor.document.fileName : null;
        const files = file ? [file] : [];

        const payload = JSON.stringify({ instruction, files });

        const options = {
            hostname: 'localhost',
            port: 5174,
            path: '/api/v1/copilot/dispatch',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        vscode.window.showInformationMessage('Dispatching to PromptHouse Evo Studio...');

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'success') {
                        vscode.window.showInformationMessage('✨ PromptHouse Studio successfully processed your dispatch.');
                    } else {
                        vscode.window.showErrorMessage(`💥 PromptHouse Error: ${response.message}`);
                    }
                } catch (e) {
                    vscode.window.showErrorMessage('Failed to parse response from PromptHouse Studio.');
                }
            });
        });

        req.on('error', (e) => {
            vscode.window.showErrorMessage(`Failed to connect to PromptHouse Studio (Port 5174). Is the API Pipeline running? Error: ${e.message}`);
        });

        req.write(payload);
        req.end();
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
