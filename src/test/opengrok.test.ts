import * as assert from 'assert';
import { buildOpenGrokUrl } from '../opengrok';

describe('buildOpenGrokUrl', () => {
    it('should produce correct URL for valid path without line number', () => {
        const result = buildOpenGrokUrl('/src/Foo/bar.cpp');
        assert.strictEqual(result, 'https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp');
    });

    it('should produce correct URL for valid path with line number', () => {
        const result = buildOpenGrokUrl('/src/Foo/bar.cpp', 15);
        assert.strictEqual(result, 'https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp#15');
    });

    it('should produce correct URL with line number 1', () => {
        const result = buildOpenGrokUrl('/src/Foo/bar.cpp', 1);
        assert.strictEqual(result, 'https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp#1');
    });

    it('should not append anchor when line number is 0', () => {
        const result = buildOpenGrokUrl('/src/Foo/bar.cpp', 0);
        assert.strictEqual(result, 'https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/Foo/bar.cpp');
    });

    it('should return undefined for path not under /src/', () => {
        const result = buildOpenGrokUrl('/home/user/file.ts');
        assert.strictEqual(result, undefined);
    });

    it('should produce correct URL for deeply nested path', () => {
        const result = buildOpenGrokUrl('/src/a/b/c/d.tac');
        assert.strictEqual(result, 'https://opengrok.infra.corp.arista.io/source/xref/eos-trunk/src/a/b/c/d.tac');
    });
});
