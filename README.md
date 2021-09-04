<!--
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC0-1.0
-->

# markdown-it-better-task-lists

This is a typescript port of [markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists) markdown-it plugin for generating GitHub style task-lists.

## What it does

- Builds [task/todo lists](https://github.com/blog/1825-task-lists-in-all-markdown-documents) out of markdown lists with items starting with `[ ]` or `[x]`.
- Nothing else

### Why is this useful?

When you have markdown documentation with checklists, rendering HTML checkboxes
out of the list items looks nicer than the raw square brackets.

## Usage

Use it the same as a normal markdown-it plugin:

```ts
import MarkdownIt from 'markdown-it'
import taskLists from '@hedgedoc/markdown-it-task-lists'

const parser = new MarkdownIt().use(taskLists)

const result = parser.render(`
- [ ] Open task
- [x] Done task
- Not a task
`) // markdown string containing task list items
```

The rendered checkboxes are disabled; to change this, set `enabled` property of the
plugin options to `true`:

```ts
const parser = new MarkdownIt().use(taskLists, { enabled: true })
```

If you need to know which line in the markdown document the generated checkbox comes
set the `lineNumber` property of the plugin options to `true` for the
`<input>` tag to be created with a data-line attribute containing the line number:

```ts
const parser = new MarkdownIt().use(taskLists, { lineNumber: true })
```

If you'd like to wrap the rendered list items in a `<label>` element for UX
purposes, set the `label` property of the plugin options to `true`:

```ts
const parser = new MarkdownIt().use(taskLists, { label: true })
```

To add the label after the checkbox set the `labelAfter` property of the plugin
options to `true`:

```ts
const parser = new MarkdownIt().use(taskLists, { label: true, labelAfter: true })
```

**Note:** This option does require the `label` option to be truthy.

The options can be combined, of course.

## Tests

```sh
yarn install
yarn test
```

## License

ISC
