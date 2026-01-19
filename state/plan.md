# Plan: Terminal Rename Listener

## Summary

Implement a feature that listens for OSC 0/2 escape sequences in terminal output and automatically renames the terminal tab in VS Code. This uses the proposed `terminalDataWriteEvent` API.

## Scope

This is a personal extension not intended for VS Code Marketplace distribution. It will be:
- Distributed as a VSIX file
- Used with VS Code (stable or Insiders) with the `--enable-proposed-api` flag or `argv.json` configuration

## Task

**Description:**
- Configure the extension to use the proposed `terminalDataWriteEvent` API by updating `package.json` and downloading the type definitions.
- Add code to `src/extension.ts` that listens for `onDidWriteTerminalData` events, parses OSC 0/2 escape sequences, and renames the terminal using `workbench.action.terminal.renameWithArg`. 
- Bump the extension version to reflect the new feature.

**Acceptance Criteria:**
- `package.json` includes `"enabledApiProposals": ["terminalDataWriteEvent"]`
- Type definitions downloaded using `npx @vscode/dts dev` (reads `enabledApiProposals` from `package.json`)
- TypeScript compiles without errors
- Extension registers a `window.onDidWriteTerminalData` listener on activation
- Listener correctly parses OSC 0 and OSC 2 sequences with both terminators:
  - BEL terminator: `\x1b]0;Title\x07` or `\x1b]2;Title\x07`
  - ST terminator: `\x1b]0;Title\x1b\\` or `\x1b]2;Title\x1b\\`
- When a matching sequence is detected, the terminal is renamed via `workbench.action.terminal.renameWithArg`
- Maintains per-terminal buffers (keyed by terminal) to handle fragmented sequences across events
- Subscribes to `window.onDidCloseTerminal` and removes corresponding buffer entries
- Errors from `executeCommand` are caught and logged (not thrown)
- All listeners are disposed on deactivation
- OSC 1 (icon name only) is ignored since VS Code terminals don't have icons
- Version in `package.json` is incremented from `0.0.1` to `0.1.0`

**Manual Testing:**
- Launch VS Code with `--enable-proposed-api rk-vscode`
- Open a terminal and run: `printf '\033]0;Test Name\007'`
- Verify the terminal tab is renamed to "Test Name"
- Test ST terminator: `printf '\033]0;Test ST\033\\'`
- Test with multiple terminals to verify correct terminal is renamed
