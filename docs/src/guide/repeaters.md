---
outline: [2,3]
---

# Repeaters

A contact list, invoice lines, a set of tags — some parts of a form repeat a number of times only the user knows, growing, shrinking, and reordering at runtime. `!VfList` is Vueform's repeater. You describe a single row, the list renders as many of it as its data holds — add and remove controls included — and its value is a plain array.

## Defining a Row

The `schema` prop holds the elements of one row — the same element definitions a form or a [group](/guide/form-structure#grouping-elements) takes:

```ts
contacts: {
  type: 'list',
  label: 'Contacts',
  schema: {
    name: { type: 'text', label: 'Name' },
    email: { type: 'text', label: 'Email' },
  },
},
```

This renders one row to start with, an add button below the rows, and a remove button beside each row. Under the hood each row is wrapped in a nested group, so the list's value is an array of objects — `[{ name: null, email: null }]` here — where adding a row appends an object and removing one splices it out.

### In a Template

In template form the `#default` slot replaces `schema`. It receives the row's `index`, and the element named by that `index` **is** the row — so a multi-element row goes in a nested `!VfGroup`:

```vue
<template>
  <VfForm>
    <VfList name="contacts" label="Contacts" #default="{ index }">
      <VfGroup :name="index" nested>
        <VfText name="name" label="Name" />
        <VfText name="email" label="Email" />
      </VfGroup>
    </VfList>
  </VfForm>
</template>
```

The slot renders exactly one element, named by `index` — anything else doesn't register as the row. Besides `index` the slot also receives `component` and `props`, the resolved prototype of a schema-defined row, for wrapping that row instead of replacing it. Custom rows can also come from a schema by passing a component through the `slots` prop — see [slots](/guide/slots).

## Flat Lists

When each row is a single value — a tag, a URL — the row object is pure overhead. `flat` collapses each row into its one element's value, so the array becomes `['vue', 'react']` instead of `[{ tag: 'vue' }, { tag: 'react' }]`:

```ts
tags: {
  type: 'list',
  label: 'Tags',
  flat: true,
  schema: {
    tag: { type: 'text', placeholder: 'Tag' },
  },
},
```

`flat` needs exactly one element in `schema` — with more, the list warns in development and keeps object rows. In a template the flat shape needs no prop at all, since `flat` only shapes the prototype built from `schema`. A single element placed directly in the slot already writes its value as the row:

```vue
<VfList name="tags" label="Tags" #default="{ index }">
  <VfText :name="index" placeholder="Tag" />
</VfList>
```

A `!defineSchema` list types its model from `schema` and `flat` — object rows for a regular list, plain values for a flat one — which is exactly what the model seed in the next section is checked against.

## Rows Follow the Data

`initial` sets how many empty rows the list starts with when it has no data — the default is `1`, and `0` starts the list [empty](#empty-state). The moment the form's data already holds an array for the list, though, rows follow its length and `initial` is ignored. The usual way to pre-fill a list is therefore the form's [external model](/guide/model#external-model):

```ts
const model = useModel({ schema }, {
  contacts: [
    { name: 'Ada Lovelace', email: 'ada@example.com' },
    { name: 'Grace Hopper', email: 'grace@example.com' },
  ],
})

const [Form] = useForm({ schema }, model)
```

The form starts with these two rows filled in, and the seed is type-checked against the row shape. Lists have no `default` prop — a list bound on its own takes `v-model` / `modelValue` like any element, with the binding semantics covered in [other model shapes](/guide/model#other-model-shapes).

Replacing the array from code works the same way. `set`, `update`, and `load` re-size the rows to match the new array, `reset()` restores the initial rows, and `clear()` empties the list to zero rows.

### Empty State

`placeholder` renders a message whenever the list has no rows — whether it started with `initial: 0` or the user removed them all. It's a translatable text prop, so it takes [locale maps](/guide/translating-props) too. The rendered placeholder is a `status` region the add button points at via `aria-describedby`, so screen readers announce the empty state together with the button.

The `#placeholder` slot replaces it. Its `bindings` carry that `id` and `role` (plus [part](/guide/parts) overrides) and must be applied with `v-bind` to keep the button's description intact. The default styling class is not among them, so bring your own:

```vue
<VfList name="tags" flat :initial="0" :schema="{ tag: { type: 'text' } }">
  <template #placeholder="{ bindings }">
    <div v-bind="bindings" class="empty-note">No tags yet — add the first one.</div>
  </template>
</VfList>
```

## Controlling Rows

The built-in controls are all tunable — capped, hidden, relabeled, reordered, or driven from code.

### Row Limits

`min` hides the remove buttons once the row count reaches it, and `max` does the same to the add button:

```ts
phones: {
  type: 'list',
  label: 'Phone Numbers',
  flat: true,
  initial: 1,
  min: 1,
  max: 3,
  schema: {
    phone: { type: 'text', placeholder: 'Phone' },
  },
},
```

The limits only gate the buttons. They don't create rows, don't stop [code](#from-code) from adding or removing, and don't validate — enforcing a row count is a rule's job, covered in [Validation](#validation).

### Turning Controls Off

`add: false` removes the add button and `remove: false` the remove buttons, each leaving the rest of the list working. `disabled` goes further — it removes every control, the sort handle included, and disables every element inside the rows too. Like everywhere else, it accepts [conditions](/guide/conditions#disabled-and-readonly).

### Labels and Icons

The add and remove buttons are icon-only by default, with localized accessible names. `addLabel` and `removeLabel` add visible text — translatable props, like `placeholder` above. The icons come from `addIcon`, `removeIcon`, and `sortIcon`, defaulting to the semantic names `$add`, `$remove`, and `$sort`, which map through the `icons` config — see [configuration](/guide/configuration#icons) and [element layout](/guide/element-layout#icons).

### Sorting

`sort` adds a drag handle to each row for drag-and-drop reordering:

```ts
tasks: {
  type: 'list',
  label: 'Tasks',
  flat: true,
  sort: true,
  schema: {
    task: { type: 'text', placeholder: 'Task' },
  },
},
```

Reordering moves the data, and because rows are keyed by stable ids, each row's component state moves with its data.

### From Code

The list's [context](/guide/context#element-context) exposes the same operations programmatically — `add(count = 1)`, `remove(index?)` removing the last row when the index is omitted, and `sort(fromIndex, toIndex)`:

```ts
const contacts$ = form$.find('contacts')

contacts$?.add() // append a row
contacts$?.remove(0) // remove the first row
contacts$?.sort(2, 0) // move the third row to the top
```

These bypass `min` and `max` — the limits belong to the buttons only.

## Wrapped Rows

`wrap` puts each row in a bordered, padded container, so rows with several fields read as units:

```ts
contacts: { type: 'list', wrap: true, schema: { /* … */ } }
```

The container uses the same `groupWrapped*` tokens as [wrapped groups](/guide/form-structure#wrapped-groups), while the list's own look — row gutters, dragging opacity, the placeholder — has [tokens of its own](/components/VfList#tokens).

## Validation

Rules apply on two levels. Rules on the list validate the **array** — `required` means at least one row, the size rules (`min:2`, `max:5`) count rows, and `distinct` rejects duplicate values in a flat list — while rules on the row elements validate each row on its own, with errors rendered inside the row:

```ts
emails: {
  type: 'list',
  label: 'Emails',
  flat: true,
  rules: 'required|min:2|distinct',
  schema: {
    email: { type: 'text', rules: 'required|email' },
  },
},
```

This list needs at least two distinct rows, and every row must hold a valid email — the list counts as invalid while any of its rows is. Row-count rules, not the `min` / `max` [props](#row-limits), are how a count is enforced. Triggers, messages, and the rest of the rule language live in [validation](/guide/validation).

## Referencing Row Siblings

Inside a row, a `*` path segment stands for the row's own index — `contacts.*.type` read from within a row resolves to that same row's `type`. From outside the list the same wildcard means every row, as in `SUM(items.*.price)`. The syntax lives at [wildcards](/guide/element-paths#wildcards), and each use has its home — per-row conditions at [conditions in repeated rows](/guide/conditions#conditions-in-repeated-rows), per-row computed values and aggregates at [expressions in lists](/guide/expressions#expressions-in-lists), and rule parameters at [referencing other elements](/guide/validation#referencing-other-elements). To address a specific row from code, use its fixed index — `contacts.0.name` — as covered in [list paths](/guide/element-paths#list-paths).

## Nesting Lists

A list can sit in another list's row schema. Each inner list is a full `!VfList` with its own controls, and the model nests accordingly — each row object carries its own array:

```ts
categories: {
  type: 'list',
  label: 'Categories',
  schema: {
    name: { type: 'text', label: 'Name' },
    tasks: {
      type: 'list',
      label: 'Tasks',
      flat: true,
      schema: {
        task: { type: 'text', placeholder: 'Task' },
      },
    },
  },
},
```

In templates both `#default` slots expose `index`, so rename the inner one when destructuring — `#default="{ index: taskIndex }"`. Wildcard paths take one `*` per level, as in `categories.*.tasks.*`.

## Customizing Controls

The control slots mirror the built-ins. `#add`, `#remove`, and `#sort` replace the add button, the remove buttons, and the drag handle — each receives its action (`handleAdd`, `handleRemove`, or the drag handlers) plus `bindings`, which carry the accessible names and must be applied with `v-bind`. `#item` takes over a whole row, controls included. The full slot props are listed at [VfList slots](/components/VfList#slots), attribute-level tweaks go through [parts](/components/VfList#parts), and passing slot components from a schema works through the `slots` prop as covered in [slots](/guide/slots).

## Matrix Repeater

When the rows are records under shared column headers — line items, an order table — a dynamic `!VfMatrix` is the better repeater. Setting `rows` to a number makes the matrix dynamic with that many starting rows (so does omitting `rows` when there's no `endpoint`, starting with one), users add and remove rows the same way, and the value is an array of row objects:

```ts
line_items: {
  type: 'matrix',
  label: 'Line Items',
  cols: ['Item', 'Qty', 'Price'],
  rows: 2,
  min: 1,
  max: 10,
},
```

A dynamic matrix takes the same `min` / `max`, `add` / `remove`, `addLabel` / `removeLabel`, and `sort` props as a list. The matrix itself — column sources, cell inputs, its value modes — is introduced at [matrix layout](/guide/form-structure#matrix-layout), and every dynamic-row option is at [dynamic rows](/components/VfMatrix#dynamic-rows).

The rule of thumb — reach for `!VfList` when each row is a small form of its own, and for `!VfMatrix` when rows are records in a table.
