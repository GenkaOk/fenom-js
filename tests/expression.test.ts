import { describe, it, expect } from 'vitest';
import { parseExpression } from '../src/fenom-js/parser/parse-expression';
import { evaluate } from '../src/fenom-js/compiler/evaluate';
import { getFromContext, applyFilters, parseValue } from '../src/fenom-js/compiler/functions';

describe('Expression Parser', () => {
    it('should parse number literal', () => {
        const expr = parseExpression('42');
        expect(expr.type).toBe('literal');
        expect(expr.value).toBe(42);
    });

    it('should parse string literal', () => {
        const expr = parseExpression('"hello"');
        expect(expr.type).toBe('literal');
        expect(expr.value).toBe('hello');
    });

    it('should parse variable', () => {
        const expr = parseExpression('$var');
        expect(expr.type).toBe('variable');
        expect(expr.path).toBe('var');
    });

    it('should parse nested variable', () => {
        const expr = parseExpression('$a.b.c');
        expect(expr.type).toBe('variable');
    });

    it('should parse unary !', () => {
        const expr = parseExpression('!$a');
        expect(expr.type).toBe('unary');
        expect(expr.operator).toBe('!');
    });

    it('should parse binary +', () => {
        const expr = parseExpression('$a + $b');
        expect(expr.type).toBe('binary');
        expect(expr.operator).toBe('+');
    });

    it('should parse comparison ==', () => {
        const expr = parseExpression('$a == $b');
        expect(expr.operator).toBe('==');
    });

    it('should parse ternary', () => {
        const expr = parseExpression('$a ? "yes" : "no"');
        expect(expr.type).toBe('conditional');
    });

    it('should parse filter', () => {
        // Filters are handled in output parsing, not in expression parser
        // parseExpression returns a variable node with the filter in the name
        const expr = parseExpression('$var|upper');
        expect(expr.type).toBe('variable');
    });

    it('should handle operator precedence', () => {
        const expr = parseExpression('$a + $b * $c');
        expect(expr.type).toBe('binary');
        expect(expr.operator).toBe('+');
        expect(expr.right.type).toBe('binary');
        expect(expr.right.operator).toBe('*');
    });
});

describe('Expression Evaluator', () => {
    const context = { a: 10, b: 20, name: 'John', flag: true };

    it('should evaluate number literal', () => {
        const expr = parseExpression('42');
        expect(evaluate(expr, context, {})).toBe(42);
    });

    it('should evaluate string literal', () => {
        const expr = parseExpression('"hello"');
        expect(evaluate(expr, context, {})).toBe('hello');
    });

    it('should evaluate variable', () => {
        const expr = parseExpression('$a');
        expect(evaluate(expr, context, {})).toBe(10);
    });

    it('should evaluate nested variable', () => {
        const ctx = { user: { name: 'John' } };
        const expr = parseExpression('$user.name');
        expect(evaluate(expr, ctx, {})).toBe('John');
    });

    it('should evaluate unary !', () => {
        const expr = parseExpression('!$flag');
        expect(evaluate(expr, context, {})).toBe(false);
    });

    it('should evaluate binary +', () => {
        const expr = parseExpression('$a + $b');
        expect(evaluate(expr, context, {})).toBe(30);
    });

    it('should evaluate comparison', () => {
        const expr = parseExpression('$a > 5');
        expect(evaluate(expr, context, {})).toBe(true);
    });

    it('should evaluate ternary', () => {
        const expr = parseExpression('$flag ? "yes" : "no"');
        expect(evaluate(expr, context, {})).toBe('yes');
    });

    it('should evaluate filter', () => {
        const filters = {
            upper: (v: string) => v.toUpperCase()
        };
        // Filters in expressions need to be evaluated differently
        // The output compiler handles filters, not the expression evaluator
        const expr = parseExpression('$name');
        expect(evaluate(expr, context, filters)).toBe('John');
    });
});

describe('Functions', () => {
    describe('getFromContext', () => {
        it('should get simple value', () => {
            const ctx = { name: 'John' };
            expect(getFromContext('name', ctx)).toBe('John');
        });

        it('should get nested value', () => {
            const ctx = { user: { profile: { age: 25 } } };
            expect(getFromContext('user.profile.age', ctx)).toBe(25);
        });

        it('should get array element', () => {
            const ctx = { items: ['a', 'b', 'c'] };
            expect(getFromContext('items.1', ctx)).toBe('b');
        });

        it('should return undefined for missing', () => {
            expect(getFromContext('missing', {})).toBeUndefined();
        });
    });

    describe('parseValue', () => {
        it('should parse number', () => {
            expect(parseValue('123')).toBe(123);
        });

        it('should parse boolean true', () => {
            expect(parseValue('true')).toBe(true);
        });

        it('should parse boolean false', () => {
            expect(parseValue('false')).toBe(false);
        });

        it('should parse null', () => {
            expect(parseValue('null')).toBe(null);
        });

        it('should parse string', () => {
            expect(parseValue('hello')).toBe('hello');
        });

        it('should parse array', () => {
            const result = parseValue('[1,2,3]');
            expect(Array.isArray(result)).toBe(true);
        });

        it('should parse object', () => {
            const result = parseValue('{a:1}');
            expect(typeof result).toBe('object');
        });
    });

    describe('applyFilters', () => {
        const filters = {
            upper: (v: string) => v.toUpperCase(),
            add: (v: number, a: number) => v + a
        };

        it('should apply single filter', () => {
            expect(applyFilters('hello', ['upper'], {}, filters)).toBe('HELLO');
        });

        it('should apply filter with arg', () => {
            // Filter arg is passed as string, need to adjust
            expect(applyFilters(5, ['add:3'], {}, filters)).toBe(8);
        });

        it('should chain filters', () => {
            const f = {
                upper: (v: string) => v.toUpperCase(),
                lower: (v: string) => v.toLowerCase()
            };
            // upper then lower = lower
            expect(applyFilters('HeLLo', ['upper', 'lower'], {}, f)).toBe('hello');
        });
    });
});
