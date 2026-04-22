import { describe, it, expect } from 'vitest';
import { FenomJs } from '../build/fenom-js/fenom-js.mjs';

describe('Integration Tests', () => {
    describe('Complex templates', () => {
        it('should render nested foreach with if', async () => {
            const template = `{foreach $users as $user}
  {if $user.active}
    {$user.name}
  {/if}
{/foreach}`;

            const data = {
                users: [
                    { name: 'Alice', active: true },
                    { name: 'Bob', active: false },
                    { name: 'Charlie', active: true }
                ]
            };

            const result = await FenomJs(template, { context: data });
            expect(result).toContain('Alice');
            expect(result).not.toContain('Bob');
            expect(result).toContain('Charlie');
        });

        it('should handle multiple filters', async () => {
            const result = await FenomJs('{$name|lower|upper|lower}', {
                context: { name: 'JoHn' }
            });
            expect(result).toBe('john');
        });

        it('should handle nested object access', async () => {
            const result = await FenomJs('{$user.profile.address.city}', {
                context: {
                    user: {
                        profile: {
                            address: { city: 'Moscow' }
                        }
                    }
                }
            });
            expect(result).toBe('Moscow');
        });

        it('should handle empty arrays', async () => {
            const result = await FenomJs('{foreach $items as $item}{$item}{foreachelse}empty{/foreach}', {
                context: { items: [] }
            });
            expect(result).toBe('empty');
        });

        it('should handle whitespace in expressions', async () => {
            const result = await FenomJs('{if $a > 5}yes{/if}', {
                context: { a: 10 }
            });
            expect(result).toBe('yes');
        });
    });

    describe('Error handling', () => {
        it('should handle missing variables gracefully', async () => {
            const result = await FenomJs('{$missing}', { context: {} });
            expect(result).toBe('');
        });

        it('should handle undefined context', async () => {
            const result = await FenomJs('{$var}', { context: {} });
            expect(result).toBe('');
        });
    });

    describe('Edge cases', () => {
        it('should handle empty template', async () => {
            const result = await FenomJs('');
            expect(result).toBe('');
        });

        it('should handle template with only text', async () => {
            const result = await FenomJs('Hello World');
            expect(result).toBe('Hello World');
        });

        it('should handle special characters', async () => {
            const result = await FenomJs('{$text}', {
                context: { text: 'a & b < c > d "quoted"' }
            });
            expect(result).toBe('a & b < c > d "quoted"');
        });

        it('should handle unicode', async () => {
            const result = await FenomJs('{$text}', {
                context: { text: 'Привет мир' }
            });
            expect(result).toBe('Привет мир');
        });
    });

    describe('Loop variables', () => {
        it('should provide loop.index', async () => {
            const result = await FenomJs('{foreach $items as $item}{$loop.index}{/foreach}', {
                context: { items: ['a', 'b'] }
            });
            expect(result).toContain('1');
            expect(result).toContain('2');
        });

        it('should provide loop.first', async () => {
            const result = await FenomJs('{foreach $items as $item}{if $loop.first}first{/if}{/foreach}', {
                context: { items: ['a', 'b'] }
            });
            expect(result).toContain('first');
        });

        it('should provide loop.last', async () => {
            const result = await FenomJs('{foreach $items as $item}{if $loop.last}last{/if}{/foreach}', {
                context: { items: ['a', 'b'] }
            });
            expect(result).toContain('last');
        });
    });

    describe('Arithmetic operations', () => {
        it('should handle addition', async () => {
            const result = await FenomJs('{$a + $b}', { context: { a: 5, b: 3 } });
            expect(result).toBe('8');
        });

        it('should handle subtraction', async () => {
            const result = await FenomJs('{$a - $b}', { context: { a: 5, b: 3 } });
            expect(result).toBe('2');
        });

        it('should handle multiplication', async () => {
            const result = await FenomJs('{$a * $b}', { context: { a: 5, b: 3 } });
            expect(result).toBe('15');
        });

        it('should handle division', async () => {
            const result = await FenomJs('{$a / $b}', { context: { a: 6, b: 3 } });
            expect(result).toBe('2');
        });

        it('should handle operator precedence', async () => {
            const result = await FenomJs('{$a + $b * $c}', { context: { a: 1, b: 2, c: 3 } });
            expect(result).toBe('7');
        });
    });

    describe('Comparison operators', () => {
        it('should handle ==', async () => {
            const result = await FenomJs('{if $a == 5}yes{/if}', { context: { a: 5 } });
            expect(result).toBe('yes');
        });

        it('should handle !=', async () => {
            const result = await FenomJs('{if $a != 5}yes{/if}', { context: { a: 3 } });
            expect(result).toBe('yes');
        });

        it('should handle <', async () => {
            const result = await FenomJs('{if $a < 5}yes{/if}', { context: { a: 3 } });
            expect(result).toBe('yes');
        });

        it('should handle >', async () => {
            const result = await FenomJs('{if $a > 5}yes{/if}', { context: { a: 10 } });
            expect(result).toBe('yes');
        });

        it('should handle <=', async () => {
            const result = await FenomJs('{if $a <= 5}yes{/if}', { context: { a: 5 } });
            expect(result).toBe('yes');
        });

        it('should handle >=', async () => {
            const result = await FenomJs('{if $a >= 5}yes{/if}', { context: { a: 5 } });
            expect(result).toBe('yes');
        });
    });

    describe('Logical operators', () => {
        it('should handle &&', async () => {
            const result = await FenomJs('{if $a && $b}yes{/if}', { context: { a: true, b: true } });
            expect(result).toBe('yes');
        });

        it('should handle ||', async () => {
            const result = await FenomJs('{if $a || $b}yes{/if}', { context: { a: true, b: false } });
            expect(result).toBe('yes');
        });

        it('should handle !', async () => {
            const result = await FenomJs('{if !$a}yes{/if}', { context: { a: false } });
            expect(result).toBe('yes');
        });
    });

    describe('String concatenation', () => {
        it('should handle ~ operator', async () => {
            const result = await FenomJs('{$a ~ $b}', { context: { a: 'Hello ', b: 'World' } });
            expect(result).toBe('Hello World');
        });
    });
});
