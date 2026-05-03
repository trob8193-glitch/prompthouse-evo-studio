const vscode = require('vscode');

function activate(context) {
  const fireOrder = vscode.commands.registerCommand('prompthouse.fireOrder', async () => {
    const intent = await vscode.window.showInputBox({ prompt: 'Mission intent' });
    if (!intent) return;
    const doc = await vscode.workspace.openTextDocument({
      content: `# PromptHouse Fire Order\n\nMISSION: ${intent}\nOWNER: Prompt Architect\nAUTH CHECK: local prompt action only\nEXPECTED ARTIFACT: blueprint + build tasks\nRISK: medium\nPROOF REQUIRED: tests/screenshots/receipts before ship claim`,
      language: 'markdown'
    });
    await vscode.window.showTextDocument(doc);
  });
  context.subscriptions.push(fireOrder);
}
function deactivate() {}
module.exports = { activate, deactivate };
