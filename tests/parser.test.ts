import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/fenom-js/lexer/tokenize';
import { parse } from '../src/fenom-js/parser/parser';

describe('Parser', () => {
    describe('If statements', () => {
        it('should parse simple if', () => {
            const tokens = tokenize('{if $a}yes{/if}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('if');
            expect(ast[0].condition).toBe('$a');
            expect(ast[0].body).toHaveLength(1);
        });

        it('should parse if with elseif and else', () => {
            const tokens = tokenize('{if $a}A{elseif $b}B{else}C{/if}');
            const ast = parse(tokens);
            expect(ast[0].elseIfs).toHaveLength(1);
            expect(ast[0].elseBody).toHaveLength(1);
        });

        it('should parse nested if', () => {
            const tokens = tokenize('{if $a}{if $b}yes{/if}{/if}');
            const ast = parse(tokens);
            expect(ast[0].body[0].type).toBe('if');
        });
    });

    describe('For loops', () => {
        it('should parse foreach', () => {
            const tokens = tokenize('{foreach $arr as $item}{$item}{/foreach}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('for');
            expect(ast[0].collection).toBe('$arr');
            expect(ast[0].item).toBe('item');
        });

        it('should parse for range', () => {
            const tokens = tokenize('{for 1..5 as $i}{$i}{/for}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('for_range');
            expect(ast[0].start).toBe(1);
            expect(ast[0].end).toBe(5);
        });

        it('should parse foreach with key', () => {
            const tokens = tokenize('{foreach $arr as $k => $v}{/foreach}');
            const ast = parse(tokens);
            expect(ast[0].key).toBe('k');
            expect(ast[0].item).toBe('v');
        });

        it('should parse foreachelse', () => {
            const tokens = tokenize('{foreach $arr as $item}{$item}{foreachelse}empty{/foreach}');
            const ast = parse(tokens);
            expect(ast[0].elseBody).toBeDefined();
        });
    });

    describe('Switch statements', () => {
        it('should parse switch with cases', () => {
            const tokens = tokenize('{switch $a}{case 1}one{case 2}two{default}other{/switch}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('switch');
            expect(ast[0].cases).toHaveLength(2);
            expect(ast[0].defaultBody).toBeDefined();
        });
    });

    describe('Nested structures', () => {
        it('should parse foreach -> if -> foreach', () => {
            const template = '{foreach $items as $item}{if $item.active}{foreach $item.sub as $sub}{$sub}{/foreach}{/if}{/foreach}';
            const tokens = tokenize(template);
            const ast = parse(tokens);
            expect(ast[0].type).toBe('for');
            expect(ast[0].body[0].type).toBe('if');
            expect(ast[0].body[0].body[0].type).toBe('for');
        });

        it('should parse three-level nesting', () => {
            const template = '{foreach $a as $a1}{foreach $a1 as $a2}{foreach $a2 as $a3}{$a3}{/foreach}{/foreach}{/foreach}';
            const tokens = tokenize(template);
            const ast = parse(tokens);
            expect(ast[0].body[0].body[0].type).toBe('for');
        });
    });

    describe('Blocks', () => {
        it('should parse block', () => {
            const tokens = tokenize('{block "main"}content{/block}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('block');
            expect(ast[0].name).toBe('main');
        });

        it('should parse nested blocks', () => {
            const tokens = tokenize('{block "outer"}{block "inner"}content{/block}{/block}');
            const ast = parse(tokens);
            expect(ast[0].body[0].type).toBe('block');
        });
    });

    describe('Output and expressions', () => {
        it('should parse simple output', () => {
            const tokens = tokenize('{$var}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('output');
            expect(ast[0].name).toBe('$var');
        });

        it('should parse output with filters', () => {
            const tokens = tokenize('{$var|upper|trim}');
            const ast = parse(tokens);
            expect(ast[0].filters).toContain('upper');
            expect(ast[0].filters).toContain('trim');
        });

        it('should parse expression output', () => {
            const tokens = tokenize('{$a + $b}');
            const ast = parse(tokens);
            expect(ast[0].name).toBe('$a + $b');
        });
    });

    describe('Set and var', () => {
        it('should parse set', () => {
            const tokens = tokenize('{set $x = 100}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('set');
            expect(ast[0].variable).toBe('x');
        });

        it('should parse var', () => {
            const tokens = tokenize('{var $x = "test"}');
            const ast = parse(tokens);
            expect(ast[0].type).toBe('var');
        });
    });
});
