import * as vscode from 'vscode';
import { parseOscTitle, hasPartialOscSequence, extractPartialSequence } from './oscParser';

// Buffer to accumulate partial OSC sequences across data events
const terminalBuffers = new Map<vscode.Terminal, string>();

// Output channel for debugging
let outputChannel: vscode.OutputChannel;

function log(message: string): void {
    outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
}

async function handleTerminalData(terminal: vscode.Terminal, data: string): Promise<void> {
    // Prepend any buffered data from previous events
    const buffered = terminalBuffers.get(terminal) || '';
    let combined = buffered + data;

    // Process all complete OSC sequences in the data
    let result = parseOscTitle(combined);
    while (result) {
        const { title, remainder } = result;
        if (title) {
            try {
                // The renameWithArg command operates on the active terminal,
                // so we need to make our target terminal active first
                if (vscode.window.activeTerminal !== terminal) {
                    terminal.show(true); // preserveFocus=true to avoid stealing focus
                }
                log(`Renaming terminal to "${title}"`);
                await vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', {
                    name: title
                });
            } catch (error) {
                log(`ERROR: Failed to rename terminal: ${error}`);
            }
        }
        combined = remainder;
        result = parseOscTitle(combined);
    }

    // Buffer any partial sequence for the next event
    if (hasPartialOscSequence(combined)) {
        terminalBuffers.set(terminal, extractPartialSequence(combined));
    } else {
        terminalBuffers.delete(terminal);
    }
}

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
    outputChannel = vscode.window.createOutputChannel('rk-vscode');
    log('Extension activated');
    log(`onDidWriteTerminalData available: ${typeof vscode.window.onDidWriteTerminalData}`);

    context.subscriptions.push(
        outputChannel,
        vscode.commands.registerCommand('rk-vscode.copyPath', () => {
            copyPathWithLineNumber(false);
        }),
        vscode.commands.registerCommand('rk-vscode.copyRelativePath', () => {
            copyPathWithLineNumber(true);
        }),
        vscode.window.onDidWriteTerminalData((event) => {
            handleTerminalData(event.terminal, event.data);
        }),
        vscode.window.onDidCloseTerminal((terminal) => {
            terminalBuffers.delete(terminal);
        })
    );
}

export function deactivate() {
    // Extension deactivated
}
