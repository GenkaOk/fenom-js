# fenom-js

[![CI](https://github.com/GenkaOk/fenom-js/actions/workflows/ci.yml/badge.svg)](https://github.com/GenkaOk/fenom-js/actions/workflows/ci.yml)

JavaScript-шаблонизатор — аналог [Fenom для PHP](https://github.com/fenom-template/fenom), используемого в CMS **MODX Revolution**. Позволяет верстальщикам работать локально без запуска сервера.

**Асинхронный**, **без зависимости от сборщиков**, работает **в браузере** и **в Node.js**.

---

## Возможности

- Переменные: `{$var}`
- Условия: `{if}`, `{elseif}`, `{else}`
- Операторы: `==`, `!=`, `!==`, `>`, `<`, `>=`, `<=`, `===`, `!`, `&&`, `||`, `in`
- Тернарный оператор: `{$age >= 18 ? 'Да' : 'Нет'}`
- Циклы: `{foreach}` с вложенностью, синтаксис `$key => $item`, `{foreachelse}`
- `{switch}` / `{case}` / `{default}`
- `{set $var = value}`, `{$var++}`, `{$var--}`, `{$var += N}`
- Фильтры через `|`: `{$name|upper}`, `{$date|date:"Y-m-d"}`, `{$var|default:"...")}`
- Комментарии: `{* текст *}`
- Исключение блоков: `{ignore}...{/ignore}`
- Наследование шаблонов: `{extends}`, `{block}`
- Работает в браузере и Node.js
- В браузере: без `{include}` и `{extends}` (ограничение среды)

---

## Установка

```bash
npm install @genkaok/fenom-js
```

### Vite-плагин

```bash
npm install @genkaok/vite-plugin-fenom --save-dev
```

---

## Использование

### В браузере

```javascript
import { FenomJs } from "@genkaok/fenom-js";

const html = await FenomJs(templateHTML, {
    context: { name: "Анна", isAdmin: true },
});
```

### В Node.js

```javascript
import { FenomJs } from "@genkaok/fenom-js/node";

const html = await FenomJs(template, {
    context: { name: "Анна" },
    loader: async (path) => fs.readFile(path, "utf-8"),
});
```

### Шаблон .tpl

```html
<body>
    <h1>Привет, {$name}!</h1>
    {if $isAdmin}
    <p>Вы администратор.</p>
    {/if}

    {foreach $items as $item}
    <li>{$item|upper}</li>
    {foreachelse}
    <li>Нет элементов</li>
    {/foreach}

    {switch $role}
    {case "admin"}Админ{/case}
    {case "user"}Пользователь{/case}
    {default}Гость{/default}
    {/switch}
</body>
```

---

## vite-plugin-fenom

```ts
// vite.config.ts
import { defineConfig } from "vite";
import fenom from "@genkaok/vite-plugin-fenom";

export default defineConfig({
    plugins: [
        fenom({
            pages: "src/pages/",
            data: "src/data/**/*.json",
            root: "src/",
        }),
    ],
});
```

### Структура проекта

```
src/
├── data/
│   ├── site.json           // {$site.title}
│   └── pages/
│       └── index.json      // контекст для index.tpl
├── pages/
│   └── index.tpl
├── blocks/
│   └── header.tpl
└── layouts/
    └── main.tpl            // {extends 'layouts/main.tpl'}
```

---

## Разработка

```bash
pnpm install
pnpm build:all
pnpm test
```

---

[Сообщить об ошибке](https://github.com/GenkaOk/fenom-js/issues)
