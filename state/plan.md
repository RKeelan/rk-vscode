# Plan: Copy OpenGrok Path Context Menu Entry

## Summary

Add a context menu entry that copies the OpenGrok URL for the current file to the clipboard. The OpenGrok URL is constructed from the file's absolute path, following the pattern used by `arista-vscode`:

```
https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp#15
```

Only files under `/src/` produce valid OpenGrok links.

## Tasks

### Task 1: Add "Copy OpenGrok Path" command and context menu entry

**Requirements:**

- Create `src/opengrok.ts` with a pure function `buildOpenGrokUrl(filePath: string, lineNumber?: number): string | undefined` that:
  - Returns `undefined` if `filePath` does not start with `/src/`
  - Strips the leading `/` from `filePath` to avoid a double slash in the URL
  - Constructs and returns the full OpenGrok URL: `https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/{filePath}#{lineNumber}`
  - The `lineNumber` parameter is **1-based** (the caller converts from VS Code's 0-based indexing). If provided and >= 1, appends `#{lineNumber}`. If omitted or undefined, no anchor is appended
- In `src/extension.ts`:
  - Import `buildOpenGrokUrl` from `./opengrok`
  - Add a `copyOpenGrokPath()` function that:
    - Gets the active editor's file path and the **start** line of the selection (0-based), ignoring any range since OpenGrok anchors are single-line
    - Converts the line number to 1-based (add 1) before calling `buildOpenGrokUrl`
    - Copies the result to the clipboard
    - Warns if there is no active editor, the file is untitled, or `buildOpenGrokUrl` returns `undefined` (file not under `/src/`, which can happen if the command is invoked via the Command Palette rather than the context menu)
  - Register the command `rk-vscode.copyOpenGrokPath` in `activate()`
- In `package.json`:
  - Add the command `rk-vscode.copyOpenGrokPath` with title `"Copy OpenGrok Path"`
  - Add the context menu entry in `editor/context` group `9_cutcopypaste@102`, with a `when` clause of `resourcePath =~ /^\/src\/.*/` so it only appears for files under `/src/` (this matches the absolute filesystem path used in Arista dev containers)
  - Bump version to `0.2.0`
- Add `src/test/opengrok.test.ts` with unit tests for `buildOpenGrokUrl`

**Verification:**

- Unit tests for `buildOpenGrokUrl` covering:
  - Valid path `/src/Foo/bar.cpp` without line number produces `https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp`
  - Valid path `/src/Foo/bar.cpp` with line number 15 produces `https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp#15`
  - Valid path with line number 1 (first line) produces correct URL with `#1` anchor
  - Path not under `/src/` (e.g., `/home/user/file.ts`) returns `undefined`
  - Deeply nested path `/src/a/b/c/d.tac` produces correct URL

**Validation:**

- Open a file under `/src/` in VS Code, right-click, and verify "Copy OpenGrok Path" appears in the context menu
- Click it and verify the clipboard contains the correct OpenGrok URL with line number
- Open a file not under `/src/` and verify the menu entry does not appear
