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

        it('complex template with multiple foreach and nested if/elseif/else', async () => {
            const template = `{if $brand && $model}
{foreach $rows as $row}
{if $city !== $row.city}
<a href="{$row.url}">{$row.templateStr} {$city} {$row.city}</a>
{/if}
{/foreach}
{elseif $brand}

{foreach $rows as $row}
{if $city !== $row.city}
<a href="{$row.url}">{$row.templateStr} {$city} {$row.city}</a>
{/if}
{/foreach}
{else}

{foreach $rows as $row}
{if $city !== $row.city}
<a href="{$row.url}">{$row.templateStr} {$city} {$row.city}</a>
{/if}
{/foreach}
{/if}`;

            const context = {
                brand: 'BMW',
                model: 'X5',
                city: 'Moscow',
                rows: [
                    { city: 'Moscow', url: '/moscow', templateStr: 'Moscow Link' },
                    { city: 'SPB', url: '/spb', templateStr: 'SPB Link' },
                ],
            };

            const result = await FenomJs(template, { context });

            expect(result).not.toContain('Moscow Link');
            expect(result).toContain('SPB Link');
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

        it('should handle invalid tags gracefully', async () => {
            const result = await FenomJs('{invalid tag}');
            expect(result).toBeDefined();
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

        it('should handle whitespace in expressions', async () => {
            const result = await FenomJs('{if $a > 5}yes{/if}', { context: { a: 10 } });
            expect(result).toBe('yes');
        });

        it('should handle newlines in template', async () => {
            const result = await FenomJs('{if $a}\nyes\n{/if}', { context: { a: true } });
            expect(result).toContain('yes');
        });
    });
});
