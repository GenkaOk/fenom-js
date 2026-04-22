import { describe, it, expect } from 'vitest';
import { FenomJs } from '../build/fenom-js/fenom-js.mjs';

describe('Multi-level arrays', () => {
    it('should handle nested foreach -> foreach', async () => {
        const template = `{foreach $users as $user}
  {foreach $user.posts as $post}
    {$post.title}
  {/foreach}
{/foreach}`;

        const data = {
            users: [
                { posts: [{ title: 'Post 1' }, { title: 'Post 2' }] },
                { posts: [{ title: 'Post 3' }] }
            ]
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('Post 1');
        expect(result).toContain('Post 2');
        expect(result).toContain('Post 3');
    });

    it('should handle foreach -> if -> foreach', async () => {
        const template = `{foreach $items as $item}
  {if $item.active}
    {foreach $item.subitems as $sub}
      {$sub.name}
    {/foreach}
  {/if}
{/foreach}`;

        const data = {
            items: [
                { active: true, subitems: [{ name: 'Sub 1' }, { name: 'Sub 2' }] },
                { active: false, subitems: [{ name: 'Sub 3' }] },
                { active: true, subitems: [{ name: 'Sub 4' }] }
            ]
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('Sub 1');
        expect(result).toContain('Sub 2');
        expect(result).toContain('Sub 4');
        expect(result).not.toContain('Sub 3');
    });

    it('should handle three-level nested loops', async () => {
        const template = `{foreach $regions as $region}
  {foreach $region.cities as $city}
    {foreach $city.streets as $street}
      {$street.name}
    {/foreach}
  {/foreach}
{/foreach}`;

        const data = {
            regions: [
                {
                    cities: [
                        { streets: [{ name: 'Main St' }, { name: 'Oak Ave' }] },
                        { streets: [{ name: 'First St' }] }
                    ]
                }
            ]
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('Main St');
        expect(result).toContain('Oak Ave');
        expect(result).toContain('First St');
    });

    it('should handle foreach -> if -> foreach -> if', async () => {
        const template = `{foreach $categories as $cat}
  {if $cat.visible}
    {foreach $cat.products as $product}
      {if $product.inStock}
        {$product.name}
      {/if}
    {/foreach}
  {/if}
{/foreach}`;

        const data = {
            categories: [
                {
                    visible: true,
                    products: [
                        { name: 'Product A', inStock: true },
                        { name: 'Product B', inStock: false }
                    ]
                },
                {
                    visible: false,
                    products: [
                        { name: 'Product C', inStock: true }
                    ]
                }
            ]
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('Product A');
        expect(result).not.toContain('Product B');
        expect(result).not.toContain('Product C');
    });

    it('should handle mixed nesting with else branches', async () => {
        const template = `{foreach $items as $item}
  {if $item.type == 'A'}
    {foreach $item.values as $val}
      {$val}
    {/foreach}
  {else}
    {$item.default}
  {/if}
{/foreach}`;

        const data = {
            items: [
                { type: 'A', values: ['X', 'Y'] },
                { type: 'B', default: 'Z' }
            ]
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('X');
        expect(result).toContain('Y');
        expect(result).toContain('Z');
    });

    it('should handle foreachelse with nested structures', async () => {
        const template = `{foreach $items as $item}
  {$item}
{foreachelse}
  No items
{/foreach}`;

        const data = {
            items: []
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('No items');
    });

    it('should handle foreachelse with nested foreach', async () => {
        const template = `{foreach $categories as $cat}
  {foreach $cat.products as $product}
    {$product}
  {/foreach}
{foreachelse}
  No categories
{/foreach}`;

        const data = {
            categories: []
        };

        const result = await FenomJs(template, { context: data });
        expect(result).toContain('No categories');
    });
});
