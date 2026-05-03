const vscode = require('vscode');
function activate(context) {
  const cmd = vscode.commands.registerCommand('prompthouse.runExtension', async () => {
    vscode.window.showInformationMessage('PromptHouse extension scaffold running. Proof required before install claim.');
  });
  context.subscriptions.push(cmd);
}
function deactivate() {}
module.exports = { activate, deactivate };
