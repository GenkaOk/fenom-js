// parseIf.ts
import type { Token } from './../types/token';
import { parse } from './../parser/parser';

export function parseIf(tokens: Token[], index: number): { node: any; nextIndex: number; } {
    const ifToken = tokens[index];
    const node: any = {
        type: 'if',
        condition: ifToken.condition,
        body: [],
        elseIfs: [],
        elseBody: []
    };

    let i = index + 1;
    let depth = 0;

    // Собираем токены для каждой ветки
    const bodyTokens: Token[] = [];
    const elseIfs: { condition: string; tokens: Token[]; }[] = [];
    const elseTokens: Token[] = [];

    let currentElseIf: { condition: string; tokens: Token[]; } | null = null;
    let inElseBranch = false;

    while (i < tokens.length) {
        const token = tokens[i];

        // Увеличиваем глубину для всех вложенных блоков
        if (token.type === 'if') {
            depth++;
        }
        if (token.type === 'for' || token.type === 'foreach' || token.type === 'for_range') {
            depth++;
        }

        if (depth > 0) {
            // Внутри вложенного блока — собираем токены и обновляем глубину
            if (!currentElseIf && !inElseBranch) {
                bodyTokens.push(token);
            } else if (currentElseIf) {
                currentElseIf.tokens.push(token);
            } else if (inElseBranch) {
                elseTokens.push(token);
            }
            // Уменьшаем глубину для закрывающих тегов
            if (token.type === 'endif') {
                depth--;
            }
            if (token.type === 'endfor' || token.type === 'endforeach') {
                depth--;
            }
            i++;
            continue;
        }

        // Обработка веток
        if (token.type === 'elseif') {
            if (inElseBranch) {
                elseTokens.push(token);
            } else {
                currentElseIf = {
                    condition: token.condition,
                    tokens: []
                };
                elseIfs.push(currentElseIf);
            }
            i++;
            continue;
        }

        if (token.type === 'else') {
            // 🔴 Завершаем текущий elseif
            currentElseIf = null;
            inElseBranch = true;
            i++;
            continue;
        }

        if (token.type === 'endif') {
            break;
        }

        // Собираем токены
        if (!currentElseIf && !inElseBranch) {
            bodyTokens.push(token);
        } else if (currentElseIf) {
            currentElseIf.tokens.push(token);
        } else if (inElseBranch) {
            elseTokens.push(token);
        }

        i++;
    }

    // 🔥 ПАРСИМ собранные токены → в AST
    node.body = parse(bodyTokens);

    node.elseIfs = elseIfs.map(elif => ({
        condition: elif.condition,
        body: parse(elif.tokens)
    }));

    node.elseBody = parse(elseTokens);

    // Возвращаем следующий индекс после {/if}
    return {
        node,
        nextIndex: i + 1 // пропускаем {/if}
    };
}
