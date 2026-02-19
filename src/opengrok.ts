const OPENGROK_BASE = 'https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/';

export function buildOpenGrokUrl(filePath: string, lineNumber?: number): string | undefined {
    if (!filePath.startsWith('/src/')) {
        return undefined;
    }

    // Strip leading '/' to avoid double slash in the URL
    const relativePath = filePath.slice(1);
    let url = OPENGROK_BASE + relativePath;

    if (lineNumber !== undefined && lineNumber >= 1) {
        url += '#' + lineNumber;
    }

    return url;
}
