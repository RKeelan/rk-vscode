// OSC (Operating System Command) sequence parser for terminal title detection
// OSC 0 sets both icon name and window title; OSC 2 sets window title only
// OSC 1 (icon name only) is intentionally ignored since VS Code terminals don't have icons

// Regex to match OSC 0 or OSC 2 sequences with BEL (\x07) or ST (\x1b\\) terminators
// eslint-disable-next-line no-control-regex
const OSC_REGEX = /\x1b\](?:0|2);([^\x07\x1b]*?)(?:\x07|\x1b\\)/;

export interface ParseResult {
    title: string;
    remainder: string;
}

export function parseOscTitle(data: string): ParseResult | null {
    const match = OSC_REGEX.exec(data);
    if (!match) {
        return null;
    }
    const title = match[1];
    const remainder = data.slice(match.index + match[0].length);
    return { title, remainder };
}

export function hasPartialOscSequence(data: string): boolean {
    // Check if data ends with a partial OSC sequence that might be completed later
    // Look for ESC ] followed by content, but no terminator yet
    const escIndex = data.lastIndexOf('\x1b]');
    if (escIndex === -1) {
        return false;
    }
    const afterEsc = data.slice(escIndex);
    // If we have ESC ] but haven't seen a terminator, it's partial
    // A complete sequence would have matched the regex already
    return afterEsc.length >= 2 && !afterEsc.includes('\x07') && !afterEsc.includes('\x1b\\');
}

export function extractPartialSequence(data: string): string {
    const escIndex = data.lastIndexOf('\x1b]');
    if (escIndex === -1) {
        return '';
    }
    return data.slice(escIndex);
}
