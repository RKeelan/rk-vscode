# rk-vscode

[![CI](https://github.com/RKeelan/rk-vscode/actions/workflows/ci.yml/badge.svg)](https://github.com/RKeelan/rk-vscode/actions/workflows/ci.yml)

A VS Code extension by and for RKeelan.

## Installation

```bash
git clone https://github.com/rkeelan/rk-vscode.git
cd rk-vscode
npm install
npx @vscode/vsce package  --allow-missing-repository && \
code --install-extension "$(ls -t rk-vscode-*.vsix | head -1)" --force
```

The terminal rename feature uses a proposed VS Code API. To enable it, open the Command Palette and run "Preferences: Configure Runtime Arguments", then add:

```json
{
  "enable-proposed-api": ["rkeelan.rk-vscode"]
}
```

Restart VS Code for the change to take effect.

## Features

* Copy path: right-click in the editor to copy the file path (absolute or relative) with the current line number or selection range appended
* Terminal rename: automatically renames terminal tabs when the shell sends OSC 0/2 escape sequences (requires proposed API)

## Shell Configuration

Add this function to your `.bashrc` or `.zshrc` to rename terminals:

```bash
# Rename the current terminal tab
title() {
    printf '\033]0;%s\007' "$1"
}
```

Usage: `title "My Terminal"`
