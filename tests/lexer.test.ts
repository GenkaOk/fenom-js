import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/fenom-js/lexer/tokenize';

describe('Lexer - Tokenize', () => {
    describe('Set/Variable Assignment', () => {
        it('should tokenize {set $var = 100}', () => {
            const tokens = tokenize('{set $var = 100}');
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].variable).toBe('var');
            expect(tokens[0].value).toBe('100');
        });

        it('should tokenize {set $var = "string"}', () => {
            const tokens = tokenize('{set $var = "string"}');
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].value).toBe('string');
        });

        it('should tokenize {set $var = \'string\'}', () => {
            const tokens = tokenize("{set $var = 'string'}");
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].value).toBe('string');
        });

        it('should tokenize {set $var = $other}', () => {
            const tokens = tokenize('{set $var = $other}');
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].value).toBe('$other');
        });

        it('should tokenize {set $var = $a + 1}', () => {
            const tokens = tokenize('{set $var = $a + 1}');
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].value).toBe('$a + 1');
        });

        it('should tokenize {set $var = {a:1}}', () => {
            const tokens = tokenize('{set $var = {a:1}}');
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].value).toBe('{a:1}');
        });

        it('should tokenize {set $var = [1,2,3]}', () => {
            const tokens = tokenize('{set $var = [1,2,3]}');
            expect(tokens[0].type).toBe('set');
            expect(tokens[0].value).toBe('[1,2,3]');
        });

        it('should tokenize {add $var ++}', () => {
            const tokens = tokenize('{add $var ++}');
            expect(tokens[0].type).toBe('add');
            expect(tokens[0].variable).toBe('var');
        });

        it('should tokenize {var $var = "value"}', () => {
            const tokens = tokenize('{var $var = "value"}');
            expect(tokens[0].type).toBe('var');
            expect(tokens[0].variable).toBe('var');
            expect(tokens[0].value).toBe('value');
        });
    });

    describe('Conditionals', () => {
        it('should tokenize {if $cond}', () => {
            const tokens = tokenize('{if $cond}');
            expect(tokens[0].type).toBe('if');
            expect(tokens[0].condition).toBe('$cond');
        });

        it('should tokenize {if $a == $b}', () => {
            const tokens = tokenize('{if $a == $b}');
            expect(tokens[0].type).toBe('if');
            expect(tokens[0].condition).toBe('$a == $b');
        });

        it('should tokenize {elseif $cond}', () => {
            const tokens = tokenize('{elseif $cond}');
            expect(tokens[0].type).toBe('elseif');
            expect(tokens[0].condition).toBe('$cond');
        });

        it('should tokenize {else}', () => {
            const tokens = tokenize('{else}');
            expect(tokens[0].type).toBe('else');
        });

        it('should tokenize {/if}', () => {
            const tokens = tokenize('{/if}');
            expect(tokens[0].type).toBe('endif');
        });
    });

    describe('Loops', () => {
        it('should tokenize {for 1..10 as $i}', () => {
            const tokens = tokenize('{for 1..10 as $i}');
            expect(tokens[0].type).toBe('for_range');
            expect(tokens[0].start).toBe(1);
            expect(tokens[0].end).toBe(10);
            expect(tokens[0].item).toBe('i');
        });

        it('should tokenize {foreach $arr as $item}', () => {
            const tokens = tokenize('{foreach $arr as $item}');
            expect(tokens[0].type).toBe('for');
            expect(tokens[0].collection).toBe('$arr');
            expect(tokens[0].item).toBe('item');
        });

        it('should tokenize {foreach $arr as $key => $item}', () => {
            const tokens = tokenize('{foreach $arr as $key => $item}');
            expect(tokens[0].type).toBe('for');
            expect(tokens[0].collection).toBe('$arr');
            expect(tokens[0].key).toBe('key');
            expect(tokens[0].item).toBe('item');
        });

        it('should tokenize {foreach $arr as $item | reverse}', () => {
            const tokens = tokenize('{foreach $arr as $item | reverse}');
            expect(tokens[0].type).toBe('for');
            expect(tokens[0].reverse).toBe(true);
        });

        it('should tokenize {/foreach}', () => {
            const tokens = tokenize('{/foreach}');
            expect(tokens[0].type).toBe('endfor');
        });

        it('should tokenize {foreachelse}', () => {
            const tokens = tokenize('{foreachelse}');
            expect(tokens[0].type).toBe('foreachelse');
        });

        it('should tokenize {break}', () => {
            const tokens = tokenize('{break}');
            expect(tokens[0].type).toBe('break');
        });

        it('should tokenize {continue}', () => {
            const tokens = tokenize('{continue}');
            expect(tokens[0].type).toBe('continue');
        });
    });

    describe('Switch', () => {
        it('should tokenize {switch $var}', () => {
            const tokens = tokenize('{switch $var}');
            expect(tokens[0].type).toBe('switch');
        });

        it('should tokenize {case value}', () => {
            const tokens = tokenize('{case 1}');
            expect(tokens[0].type).toBe('case');
        });

        it('should tokenize {default}', () => {
            const tokens = tokenize('{default}');
            expect(tokens[0].type).toBe('default');
        });

        it('should tokenize {/switch}', () => {
            const tokens = tokenize('{/switch}');
            expect(tokens[0].type).toBe('endswitch');
        });
    });

    describe('Template Inheritance', () => {
        it('should tokenize {extends \'file:path\'}', () => {
            const tokens = tokenize("{extends 'file:path'}");
            expect(tokens[0].type).toBe('extends');
            expect(tokens[0].file).toBe('path');
        });

        it('should tokenize {block "name"}', () => {
            const tokens = tokenize('{block "name"}');
            expect(tokens[0].type).toBe('block_open');
            expect(tokens[0].name).toBe('name');
        });

        it('should tokenize {/block}', () => {
            const tokens = tokenize('{/block}');
            expect(tokens[0].type).toBe('block_close');
        });

        it('should tokenize {parent}', () => {
            const tokens = tokenize('{parent}');
            expect(tokens[0].type).toBe('parent');
        });
    });

    describe('Output', () => {
        it('should tokenize {$var}', () => {
            const tokens = tokenize('{$var}');
            expect(tokens[0].type).toBe('output');
            expect(tokens[0].name).toBe('$var');
        });

        it('should tokenize {$var|upper}', () => {
            const tokens = tokenize('{$var|upper}');
            expect(tokens[0].type).toBe('output');
            expect(tokens[0].name).toBe('$var');
            expect(tokens[0].filters).toContain('upper');
        });

        it('should tokenize {$var|filter:"arg"}', () => {
            const tokens = tokenize('{$var|filter:"arg"}');
            expect(tokens[0].filters).toContain('filter:"arg"');
        });

        it('should tokenize {$a + $b}', () => {
            const tokens = tokenize('{$a + $b}');
            expect(tokens[0].type).toBe('output');
            expect(tokens[0].name).toBe('$a + $b');
        });
    });

    describe('Comments and Ignore', () => {
        it('should tokenize {* comment *}', () => {
            const tokens = tokenize('{* comment *}');
            expect(tokens[0].type).toBe('comment');
        });

        it('should tokenize {ignore}...{/ignore}', () => {
            const tokens = tokenize('{ignore}{if $a}{/ignore}');
            expect(tokens[0].type).toBe('ignore_block');
        });
    });

    describe('Operators', () => {
        it('should tokenize {$var++}', () => {
            const tokens = tokenize('{$var++}');
            expect(tokens[0].type).toBe('operator');
            expect(tokens[0].operator).toBe('++');
        });

        it('should tokenize {$var += 1}', () => {
            const tokens = tokenize('{$var += 1}');
            expect(tokens[0].type).toBe('operator');
            expect(tokens[0].operator).toBe('+=');
        });
    });
});
