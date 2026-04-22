import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/fenom-js/lexer/tokenize';
import { parse } from '../src/fenom-js/parser/parser';
import { compile } from '../src/fenom-js/compiler/compiler';
import { filters } from '../src/fenom-js/filters/filters';

describe('Node Compiler (compile + render)', () => {
    async function render(template: string, context: any = {}) {
        const tokens = tokenize(template);
        const ast = parse(tokens);
        const compiled = compile(ast);
        return await compiled(context, filters);
    }

    describe('Basic rendering', () => {
        it('should render text', async () => {
            const result = await render('Hello World');
            expect(result).toBe('Hello World');
        });

        it('should render variable', async () => {
            const result = await render('{$name}', { name: 'John' });
            expect(result).toBe('John');
        });

        it('should render expression', async () => {
            const result = await render('{$a + $b}', { a: 1, b: 2 });
            expect(result).toBe('3');
        });
    });

    describe('Filters', () => {
        it('should apply upper filter', async () => {
            const result = await render('{$name|upper}', { name: 'john' });
            expect(result).toBe('JOHN');
        });

        it('should apply lower filter', async () => {
            const result = await render('{$name|lower}', { name: 'JOHN' });
            expect(result).toBe('john');
        });

        it('should apply date filter', async () => {
            const result = await render('{$ts|date:"Y-m-d"}', { ts: 946684800 });
            expect(result).toBe('2000-01-01');
        });

        it('should apply length filter', async () => {
            const result = await render('{$arr|length}', { arr: [1, 2, 3] });
            expect(result).toBe('3');
        });

        it('should chain filters', async () => {
            const result = await render('{$name|lower|upper}', { name: 'John' });
            expect(result).toBe('JOHN');
        });
    });

    describe('If statements', () => {
        it('should render if true', async () => {
            const result = await render('{if $a}yes{/if}', { a: true });
            expect(result).toBe('yes');
        });

        it('should not render if false', async () => {
            const result = await render('{if $a}yes{/if}', { a: false });
            expect(result).toBe('');
        });

        it('should render elseif', async () => {
            const result = await render('{if $a}A{elseif $b}B{else}C{/if}', {
                a: false, b: true
            });
            expect(result).toBe('B');
        });

        it('should render else', async () => {
            const result = await render('{if $a}A{else}B{/if}', {
                a: false
            });
            expect(result).toBe('B');
        });

        it('should handle comparisons', async () => {
            const result = await render('{if $a > 5}yes{/if}', { a: 10 });
            expect(result).toBe('yes');
        });
    });

    describe('Loops', () => {
        it('should render foreach', async () => {
            const result = await render('{foreach $items as $item}{$item}{/foreach}', {
                items: ['a', 'b']
            });
            expect(result).toContain('a');
            expect(result).toContain('b');
        });

        it('should render for range', async () => {
            const result = await render('{for 1..3 as $i}{$i}{/for}');
            expect(result).toContain('1');
            expect(result).toContain('2');
            expect(result).toContain('3');
        });

        it('should render foreachelse', async () => {
            const result = await render('{foreach $items as $item}{$item}{foreachelse}empty{/foreach}', {
                items: []
            });
            expect(result).toBe('empty');
        });

        it('should render with key', async () => {
            const result = await render('{foreach $items as $k => $v}{$k}:{$v}{/foreach}', {
                items: ['a', 'b']
            });
            expect(result).toContain('0:a');
        });
    });

    describe('Set and operators', () => {
        it('should set variable', async () => {
            const result = await render('{set $x = 100}{$x}');
            expect(result).toBe('100');
        });

        it('should use var', async () => {
            const result = await render('{var $x = "test"}{$x}');
            expect(result).toBe('test');
        });

        it('should increment', async () => {
            const result = await render('{set $x = 1}{$x++}{$x}');
            expect(result).toContain('2');
        });

        it('should use += operator', async () => {
            const result = await render('{set $x = 1}{$x += 4}{$x}');
            expect(result).toContain('5');
        });
    });

    describe('Switch', () => {
        it('should render switch with case', async () => {
            const result = await render('{switch $type}{case "a"}A{case "b"}B{default}Other{/switch}', {
                type: 'b'
            });
            expect(result).toBe('B');
        });

        it('should render default', async () => {
            const result = await render('{switch $type}{case "a"}A{default}Other{/switch}', {
                type: 'x'
            });
            expect(result).toBe('Other');
        });
    });

    describe('Nested structures', () => {
        it('should handle foreach -> if -> foreach', async () => {
            const template = '{foreach $items as $item}{if $item.active}{foreach $item.sub as $sub}{$sub}{/foreach}{/if}{/foreach}';
            const data = {
                items: [
                    { active: true, sub: ['a', 'b'] },
                    { active: false, sub: ['c'] }
                ]
            };
            const result = await render(template, data);
            expect(result).toContain('a');
            expect(result).toContain('b');
            expect(result).not.toContain('c');
        });

        it('should handle three-level nesting', async () => {
            const template = '{foreach $a as $a1}{foreach $a1 as $a2}{foreach $a2 as $a3}{$a3}{/foreach}{/foreach}{/foreach}';
            const data = {
                a: [
                    [['x', 'y'], ['z']]
                ]
            };
            const result = await render(template, data);
            expect(result).toContain('x');
            expect(result).toContain('y');
            expect(result).toContain('z');
        });
    });

    describe('Comments and ignore', () => {
        it('should ignore comments', async () => {
            const result = await render('{* comment *}text');
            expect(result).toBe('text');
        });

        it('should ignore block', async () => {
            const result = await render('{ignore}{if $a}yes{/ignore}');
            expect(result).toBe('{if $a}yes');
        });
    });

    describe('Expression evaluation', () => {
        it('should handle arithmetic', async () => {
            const result = await render('{$a + $b * $c}', { a: 1, b: 2, c: 3 });
            expect(result).toBe('7');
        });

        it('should handle string concatenation', async () => {
            const result = await render('{$a ~ $b}', { a: 'Hello ', b: 'World' });
            expect(result).toBe('Hello World');
        });

        it('should handle ternary', async () => {
            const result = await render('{$a ? "yes" : "no"}', { a: true });
            expect(result).toBe('yes');
        });

        it('should handle logical operators', async () => {
            const result = await render('{if $a && $b}yes{/if}', { a: true, b: true });
            expect(result).toBe('yes');
        });
    });

    describe('Loop variables', () => {
        it('should provide loop.index', async () => {
            const result = await render('{foreach $items as $item}{$loop.index}{/foreach}', {
                items: ['a', 'b']
            });
            expect(result).toContain('1');
            expect(result).toContain('2');
        });

        it('should provide loop.first', async () => {
            const result = await render('{foreach $items as $item}{if $loop.first}first{/if}{/foreach}', {
                items: ['a', 'b']
            });
            expect(result).toContain('first');
        });

        it('should provide loop.last', async () => {
            const result = await render('{foreach $items as $item}{if $loop.last}last{/if}{/foreach}', {
                items: ['a', 'b']
            });
            expect(result).toContain('last');
        });
    });
});
