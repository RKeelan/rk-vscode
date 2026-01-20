import * as assert from 'assert';
import { parseOscTitle, hasPartialOscSequence, extractPartialSequence } from '../oscParser';

describe('OSC Parser', () => {
    describe('parseOscTitle', () => {
        it('should parse OSC 0 with BEL terminator', () => {
            const result = parseOscTitle('\x1b]0;Test Title\x07');
            assert.deepStrictEqual(result, {
                title: 'Test Title',
                remainder: ''
            });
        });

        it('should parse OSC 2 with BEL terminator', () => {
            const result = parseOscTitle('\x1b]2;Window Title\x07');
            assert.deepStrictEqual(result, {
                title: 'Window Title',
                remainder: ''
            });
        });

        it('should parse OSC 0 with ST terminator', () => {
            const result = parseOscTitle('\x1b]0;Test ST\x1b\\');
            assert.deepStrictEqual(result, {
                title: 'Test ST',
                remainder: ''
            });
        });

        it('should parse OSC 2 with ST terminator', () => {
            const result = parseOscTitle('\x1b]2;Window ST\x1b\\');
            assert.deepStrictEqual(result, {
                title: 'Window ST',
                remainder: ''
            });
        });

        it('should return null for non-OSC data', () => {
            const result = parseOscTitle('Hello World');
            assert.strictEqual(result, null);
        });

        it('should return null for OSC 1 (icon name only)', () => {
            const result = parseOscTitle('\x1b]1;Icon Name\x07');
            assert.strictEqual(result, null);
        });

        it('should preserve remainder after the sequence', () => {
            const result = parseOscTitle('\x1b]0;Title\x07More output here');
            assert.deepStrictEqual(result, {
                title: 'Title',
                remainder: 'More output here'
            });
        });

        it('should extract first sequence when multiple are present', () => {
            const result = parseOscTitle('\x1b]0;First\x07\x1b]0;Second\x07');
            assert.deepStrictEqual(result, {
                title: 'First',
                remainder: '\x1b]0;Second\x07'
            });
        });

        it('should handle empty title', () => {
            const result = parseOscTitle('\x1b]0;\x07');
            assert.deepStrictEqual(result, {
                title: '',
                remainder: ''
            });
        });

        it('should handle data before the sequence', () => {
            const result = parseOscTitle('prefix\x1b]0;Title\x07suffix');
            assert.deepStrictEqual(result, {
                title: 'Title',
                remainder: 'suffix'
            });
        });

        it('should handle special characters in title', () => {
            const result = parseOscTitle('\x1b]0;user@host:~/path\x07');
            assert.deepStrictEqual(result, {
                title: 'user@host:~/path',
                remainder: ''
            });
        });
    });

    describe('hasPartialOscSequence', () => {
        it('should detect partial OSC 0 sequence', () => {
            const result = hasPartialOscSequence('output\x1b]0;Part');
            assert.strictEqual(result, true);
        });

        it('should detect partial OSC 2 sequence', () => {
            const result = hasPartialOscSequence('output\x1b]2;Part');
            assert.strictEqual(result, true);
        });

        it('should detect partial sequence with just ESC ]', () => {
            const result = hasPartialOscSequence('output\x1b]');
            assert.strictEqual(result, true);
        });

        it('should return false for complete sequence', () => {
            const result = hasPartialOscSequence('\x1b]0;Complete\x07');
            assert.strictEqual(result, false);
        });

        it('should return false for complete sequence with ST', () => {
            const result = hasPartialOscSequence('\x1b]0;Complete\x1b\\');
            assert.strictEqual(result, false);
        });

        it('should return false when no ESC present', () => {
            const result = hasPartialOscSequence('normal output');
            assert.strictEqual(result, false);
        });
    });

    describe('extractPartialSequence', () => {
        it('should extract partial sequence from end of data', () => {
            const result = extractPartialSequence('output\x1b]0;Part');
            assert.strictEqual(result, '\x1b]0;Part');
        });

        it('should return empty string when no ESC present', () => {
            const result = extractPartialSequence('normal output');
            assert.strictEqual(result, '');
        });

        it('should extract from last ESC ] when multiple present', () => {
            const result = extractPartialSequence('\x1b]0;First\x07output\x1b]0;Part');
            assert.strictEqual(result, '\x1b]0;Part');
        });
    });
});
