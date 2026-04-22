import { describe, it, expect } from 'vitest';
import { FenomJs } from '../build/fenom-js/fenom-js.mjs';

describe('Filters', () => {
    describe('String filters', () => {
        it('should apply upper', async () => {
            const result = await FenomJs('{$val|upper}', { context: { val: 'test' } });
            expect(result).toBe('TEST');
        });

        it('should apply lower', async () => {
            const result = await FenomJs('{$val|lower}', { context: { val: 'TEST' } });
            expect(result).toBe('test');
        });

        it('should apply capitalize', async () => {
            const result = await FenomJs('{$val|capitalize}', { context: { val: 'test' } });
            expect(result).toBe('Test');
        });

        it('should apply ucwords', async () => {
            const result = await FenomJs('{$val|ucwords}', { context: { val: 'hello world' } });
            expect(result).toBe('Hello World');
        });

        it('should apply trim', async () => {
            const result = await FenomJs('{$val|trim}', { context: { val: '  test  ' } });
            expect(result).toBe('test');
        });

        it('should apply escape', async () => {
            const result = await FenomJs('{$val|escape}', { context: { val: '<div>' } });
            expect(result).toContain('&lt;');
        });

        it('should apply nl2br', async () => {
            const result = await FenomJs('{$val|nl2br}', { context: { val: 'line1\nline2' } });
            expect(result).toContain('<br>');
        });
    });

    describe('Array filters', () => {
        it('should apply first', async () => {
            const result = await FenomJs('{$arr|first}', { context: { arr: ['a', 'b'] } });
            expect(result).toBe('a');
        });

        it('should apply last', async () => {
            const result = await FenomJs('{$arr|last}', { context: { arr: ['a', 'b'] } });
            expect(result).toBe('b');
        });

        it('should apply join', async () => {
            const result = await FenomJs('{$arr|join:", "}', { context: { arr: ['a', 'b'] } });
            expect(result).toBe('a, b');
        });

        it('should apply length', async () => {
            const result = await FenomJs('{$arr|length}', { context: { arr: ['a', 'b', 'c'] } });
            expect(result).toBe('3');
        });

        it('should apply reverse array', async () => {
            const result = await FenomJs('{$arr|reverse}', { context: { arr: ['a', 'b', 'c'] } });
            expect(result).toBe('c,b,a');
        });
    });

    describe('Number filters', () => {
        it('should apply abs', async () => {
            const result = await FenomJs('{$val|abs}', { context: { val: -5 } });
            expect(result).toBe('5');
        });

        it('should apply round', async () => {
            const result = await FenomJs('{$val|round}', { context: { val: 3.7 } });
            expect(result).toBe('4');
        });

        it('should apply number_format', async () => {
            const result = await FenomJs('{$val|number_format}', { context: { val: 1234.56 } });
            expect(result).toBeDefined();
        });
    });

    describe('JSON filters', () => {
        it('should apply json_encode', async () => {
            const obj = { a: 1 };
            const result = await FenomJs('{$val|json_encode}', { context: { val: obj } });
            expect(result).toContain('"a"');
        });
    });

    describe('Other filters', () => {
        it('should apply default', async () => {
            const result = await FenomJs('{$val|default:"none"}', { context: {} });
            expect(result).toBe('none');
        });

        it('should apply raw', async () => {
            const result = await FenomJs('{$val|raw}', { context: { val: '<div>' } });
            expect(result).toBe('<div>');
        });
    });

    describe('Filter chaining', () => {
        it('should chain multiple filters', async () => {
            const result = await FenomJs('{$val|lower|upper}', { context: { val: 'TeSt' } });
            expect(result).toBe('TEST');
        });
    });
});
