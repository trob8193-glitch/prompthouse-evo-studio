import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("phEvo.captureSelection", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("PH Evo: No active editor.");
      return;
    }

    const selectedText = editor.document.getText(editor.selection);
    const payload = {
      eventId: `evt_${Date.now()}`,
      source: "vscode_promptbridge",
      eventType: "capture",
      payload: {
        fileName: editor.document.fileName,
        selectedText
      },
      training: {
        captureEnabled: false,
        allowedForMemory: true,
        allowedForFinetune: false,
        allowedForPreferenceTraining: false,
        requiresReview: true,
        sourceRights: "user_owned",
        dataClass: "code_diff"
      },
      createdAt: new Date().toISOString()
    };

    const response = await fetch("http://127.0.0.1:4317/v1/promptbridge/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      vscode.window.showErrorMessage(`PH Evo capture failed: ${response.status}`);
      return;
    }

    vscode.window.showInformationMessage("PH Evo: Selection captured to PromptBridge.");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
