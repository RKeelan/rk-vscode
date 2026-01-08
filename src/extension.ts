import * as vscode from 'vscode';

function getLineNumberSuffix(editor: vscode.TextEditor): string {
    const selection = editor.selection;
    const startLine = selection.start.line + 1;
    const endLine = selection.end.line + 1;

    if (startLine === endLine) {
        return `:${startLine}`;
    }
    return `:${startLine}-${endLine}`;
}

async function copyPathWithLineNumber(relative: boolean): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }

    const document = editor.document;
    if (document.isUntitled) {
        vscode.window.showWarningMessage('File has not been saved');
        return;
    }

    let filePath: string;
    if (relative) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if (workspaceFolder) {
            filePath = vscode.workspace.asRelativePath(document.uri, false);
        } else {
            filePath = document.uri.fsPath;
        }
    } else {
        filePath = document.uri.fsPath;
    }

    const lineNumberSuffix = getLineNumberSuffix(editor);
    const result = filePath + lineNumberSuffix;

    await vscode.env.clipboard.writeText(result);
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('rk-vscode.copyPath', () => {
            copyPathWithLineNumber(false);
        }),
        vscode.commands.registerCommand('rk-vscode.copyRelativePath', () => {
            copyPathWithLineNumber(true);
        })
    );
}

export function deactivate() {
    // Extension deactivated
}
