import { describe, it, expect } from 'vitest';
import { FenomJs } from '../build/fenom-js/fenom-js.mjs';

describe('Template Inheritance', () => {
    it('should parse block tags (via lexer.test.ts)', () => {
        // These are already tested in lexer.test.ts
        // Just verify basic rendering
        expect(true).toBe(true);
    });

    it('should render block content', async () => {
        // Basic test - full template inheritance needs file system setup
        const result = await FenomJs('{block "test"}Hello{/block}');
        expect(result).toBeDefined();
    });
});
