---
outline: [2,3]
---

# Expressions

Expressions are short templates — wrapped in `{...}` — that Vueform resolves against the form's live data. They turn static strings into computed ones: a label that reads back another field, a default that calculates a total, a condition written as one line of logic. Because they're plain strings, they survive serialization — an expression works the same whether it's typed in a template, defined in a schema, or loaded from a database as JSON.

Out of the box, expressions handle **path interpolation**: `{name}` inside a string becomes that element's current value. Everything beyond that — operators, comparisons, functions — comes from the **expression engine**, a small plugin you install once. This chapter covers the syntax first, then the places expressions plug in, then the full language the engine unlocks.

## Basic Syntax

An expression is a piece of code inside curly braces. Anything outside the braces is literal text, and a string can mix several expression blocks:

```
Hello {first_name}!
```

The path inside the braces references an element the same way [`form$.find()`](/guide/context#finding-elements) does — `name`, `user.name`, `items.0.price`. Both the element's [tree path and its data path](/guide/element-paths#tree-path-vs-data-path) resolve; prefer the tree path, the same full address you'd pass to `find()`. Whenever a referenced value changes, the resolved string updates. Empty values resolve to an empty string.

Any prop that displays text — `label`, `placeholder`, `help`, `description`, and every other [TextProp](/guide/dynamic-props) — resolves expressions:

::: usage

```vue [Preview]
<VfText name="name" label="Name" default="Jane" />
<VfTextarea
  name="bio"
  label="Bio of {name}"
  placeholder="Tell us about {name}..."
  help="This will be public on {name}'s profile."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name', default: 'Jane' },
  bio: {
    type: 'textarea',
    label: 'Bio of {name}', // [!code highlight]
    placeholder: 'Tell us about {name}...', // [!code highlight]
    help: "This will be public on {name}'s profile.", // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Plain `{path}` interpolation like the above needs no setup. As soon as an expression contains more than a path — an operator, a function call — it needs the expression engine.

## Installing the Expression Engine

The official engine is [`@vueform/expr-eval`](https://github.com/vueform/expr-eval), a thin adapter around the `expr-eval-fork` parser:

```bash
npm install @vueform/expr-eval
```

Register it as a plugin in `createVueform`:

```ts
import { createVueform } from '@vueform/ui/origin'
import exprEval from '@vueform/expr-eval'

app.use(
  createVueform({
    plugins: [exprEval()], // [!code highlight]
  })
)
```

With the engine installed, expressions gain operators, comparisons, ternaries, built-in and custom functions, and element-prop references — everything in the rest of this chapter. Without it, non-path expressions are left as-is (with a one-time dev warning telling you to install the engine).

## Computed Defaults

The `default` prop is special: an expression there doesn't produce display text — it produces the element's **value**, and it's actively **tracked**, re-evaluating whenever a referenced field changes:

::: usage model

```vue [Preview]
<VfText name="price" label="Price" :default="10" />
<VfText name="quantity" label="Quantity" :default="2" />
<VfText name="total" label="Total" default="{price * quantity}" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  price: { type: 'text', default: 10, label: 'Price' },
  quantity: { type: 'text', default: 2, label: 'Quantity' },
  total: {
    type: 'text',
    label: 'Total',
    default: '{price * quantity}', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`total` starts at `20` and follows `price` and `quantity` as they change.

Computed elements chain: an element whose value comes from an expression can itself be referenced by another expression, and changes cascade through the whole chain:

::: usage model

```vue [Preview]
<VfText name="price" label="Price" :default="100" />
<VfText name="tax_rate" label="Tax Rate (%)" :default="20" />
<VfText name="tax" label="Tax" default="{price * tax_rate / 100}" />
<VfText name="total" label="Total" default="{price + tax}" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  price: { type: 'text', label: 'Price', default: 100 },
  tax_rate: { type: 'text', label: 'Tax Rate (%)', default: 20 },
  tax: {
    type: 'text',
    label: 'Tax',
    default: '{price * tax_rate / 100}', // [!code highlight]
  },
  total: {
    type: 'text',
    label: 'Total',
    default: '{price + tax}', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Change `price` or `tax_rate` and the update flows through `tax` into `total`.

### When Tracking Stops

A computed default keeps updating only until the user takes over. The `untrackOn` prop lists the events that stop tracking — its default is `['input', 'load']`:

- `'input'` — the user edits the element directly; their value wins from then on.
- `'load'` — data is loaded into the form (e.g. `form$.load()`); the loaded value is treated as user data, not a template to overwrite.

To keep a total recalculating even after data loads, narrow the list:

::: code-group

```ts [Schema]
defineSchema({
  total: {
    type: 'text',
    label: 'Total',
    default: '{price * quantity}',
    untrackOn: ['input'], // [!code highlight]
  },
})
```

```vue [Template]
<VfText
  name="total"
  label="Total"
  default="{price * quantity}"
  :untrack-on="['input']"
/>
```

:::

An expression with no element references at all (say `{1 + 1}`) resolves once and is never tracked.

::: warning
A `default` expression cannot reference its **own** element — that would recurse forever, so evaluation aborts with an error instead.
:::

## Displaying Computed Text

To show a computed result as content rather than an input, use `VfContent` — its `content` prop resolves expression blocks mixed with plain text:

::: usage

```vue [Preview]
<VfText name="a" label="A" :default="3" />
<VfText name="b" label="B" :default="5" />
<VfContent name="summary" content="{a} + {b} = {a + b}" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  a: { type: 'text', label: 'A', default: 3 },
  b: { type: 'text', label: 'B', default: 5 },
  summary: {
    type: 'content',
    content: '{a} + {b} = {a + b}', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

This renders `3 + 5 = 8` and stays current as the inputs change.

## Expression Conditions

A string passed to the `conditions` prop is evaluated as a boolean expression — the braces are added for you, so write the logic bare:

::: code-group

```ts [Schema]
defineSchema({
  plan: { type: 'radios', label: 'Plan', items: ['Free', 'Pro'] },
  billing: { type: 'radios', label: 'Billing', items: ['Monthly', 'Annual'] },
  loyalty_points: {
    type: 'text',
    label: 'Loyalty Points',
    conditions: "plan == 'Pro' and billing == 'Annual'", // [!code highlight]
  },
})
```

```vue [Template]
<VfRadios name="plan" label="Plan" :items="['Free', 'Pro']" />
<VfRadios name="billing" label="Billing" :items="['Monthly', 'Annual']" />
<VfText
  name="loyalty_points"
  label="Loyalty Points"
  conditions="plan == 'Pro' and billing == 'Annual'"
/>
```

:::

The result must be a boolean; anything else counts as `false`. See [Expression Conditions](/guide/conditions#expression-conditions) for how this fits into the wider condition system.

## Operators

The engine supports math, comparison, logical, and membership operators, plus the ternary:

| Category    | Operators                                      |
| ----------- | ---------------------------------------------- |
| Math        | `+`, `-`, `*`, `/`, `%`, `^` (power)           |
| Comparison  | `==`, `!=`, `>`, `>=`, `<`, `<=`               |
| Logical     | `and` / `AND`, `or` / `OR`, `not` / `NOT`, `!` |
| Membership  | `in`                                           |
| Conditional | `cond ? a : b`                                 |

Logical operators work in either case — `AND` and `and` are the same operator.

::: usage model

```vue [Preview]
<VfText name="a" label="A" :default="10" />
<VfText name="b" label="B" :default="5" />
<VfText name="sum" label="Sum" default="{a + b}" />
<VfContent name="status" content="Status: {a > b ? 'ok' : 'low'}" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  a: { type: 'text', label: 'A', default: 10 },
  b: { type: 'text', label: 'B', default: 5 },
  sum: { type: 'text', label: 'Sum', default: '{a + b}' },
  status: {
    type: 'content',
    content: "Status: {a > b ? 'ok' : 'low'}",
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Built-in Functions

The engine ships a library of helpers, called with parentheses inside a `{...}` block. Names are uppercase by convention.

### Logic

| Function           | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `NOT(value)`       | Negation of `value`.                                     |
| `EMPTY(value)`     | `true` for `''`, `null`, `undefined`, or an empty array. |
| `NOT_EMPTY(value)` | The inverse of `EMPTY`.                                  |

::: code-group

```ts [Schema]
defineSchema({
  name: { type: 'text', label: 'Name' },
  greeting: {
    type: 'text',
    label: 'Welcome',
    conditions: 'NOT_EMPTY(name)',
  },
})
```

```vue [Template]
<VfText name="name" label="Name" />
<VfText name="greeting" label="Welcome" conditions="NOT_EMPTY(name)" />
```

:::

### Numbers

| Function               | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `SUM(...args)`         | Sum of all arguments. Non-numeric values count as `0`. |
| `AVG(...args)`         | Average of non-empty values.                           |
| `MIN(...args)`         | Smallest non-empty value.                              |
| `MAX(...args)`         | Largest non-empty value.                               |
| `COUNT(...args)`       | Count of non-empty values.                             |
| `ROUND(value, places)` | Rounds `value` to `places` decimals.                   |

All of them accept multiple arguments **and flatten arrays**, which makes them a natural fit for [wildcard list paths](#expressions-in-lists) like `SUM(items.*.amount)`.

### Text

| Function                                                      | Description                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `CONCAT(...args)`                                             | Joins all arguments into one string; empty values contribute nothing. |
| `LC(value)`                                                   | Lowercase.                                                            |
| `UC(value)`                                                   | Uppercase.                                                            |
| `UCF(value)`                                                  | Uppercase first letter.                                               |
| `ENCODE_URI(value)` / `DECODE_URI(value)`                     | URI encoding / decoding.                                              |
| `ENCODE_URI_COMPONENT(value)` / `DECODE_URI_COMPONENT(value)` | URI-component encoding / decoding.                                    |

### Dates

| Function                        | Description                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `TODAY()`                       | Today's date as `YYYY-MM-DD`.                                                              |
| `NOW()`                         | Current timestamp as an ISO string.                                                        |
| `AGE(date)`                     | Whole years between `date` and today.                                                      |
| `DATE_ADD(value, amount, unit)` | Adds an amount of `unit` (`'day'`, `'month'`, …) to a date, preserving the input's format. |
| `FORMAT_DATE(value, format)`    | Formats a date using the date adapter's format tokens.                                     |

::: usage model

```vue [Preview]
<VfText
  name="dob"
  label="Date of Birth"
  input-type="date"
  default="1990-05-15"
/>
<VfText name="age" label="Age" default="{AGE(dob)}" />
<VfText
  name="deadline"
  label="Deadline (30 days from today)"
  default="{DATE_ADD(TODAY(), 30, 'day')}"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  dob: {
    type: 'text',
    label: 'Date of Birth',
    inputType: 'date',
    default: '1990-05-15',
  },
  age: {
    type: 'text',
    label: 'Age',
    default: '{AGE(dob)}', // [!code highlight]
  },
  deadline: {
    type: 'text',
    label: 'Deadline (30 days from today)',
    default: "{DATE_ADD(TODAY(), 30, 'day')}", // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`AGE`, `DATE_ADD`, and `FORMAT_DATE` go through the `$date` module. The built-in native adapter handles standard formats (`YYYY-MM-DD`, with optional time); for custom date formats install a date plugin (`@vueform/date-dayjs`, `@vueform/date-fns`, or `@vueform/date-luxon`).

## Referencing Element Props

Expressions normally read element **values**. The `@` shorthand reads element **props** — anything on the element's [Context](/guide/context):

- `path@prop` — a prop of the element at `path`, e.g. `country@selectedLabel`.
- `@prop` — a prop of the **current** element, e.g. `@label`.

::: usage

```vue [Preview]
<VfSelect
  name="country"
  label="Country"
  :items="{ us: 'United States', de: 'Germany' }"
  default="us"
/>
<VfContent
  name="shipping_note"
  content="Shipping to: {country@selectedLabel}"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    items: { us: 'United States', de: 'Germany' },
    default: 'us',
  },
  shipping_note: {
    type: 'content',
    content: 'Shipping to: {country@selectedLabel}', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The model holds `us`, but the note shows _United States_ — the select's `selectedLabel` prop instead of its value. Any context property is reachable, with dot paths drilling deeper (`@model.city`) and other useful targets like `settings@available` (whether another element's [conditions](/guide/conditions) are met) or `@path`.

The shorthand desugars to the `PROP("path", "prop")` and `SELF("prop")` functions, which you can also call directly. Literal `@` inside quoted strings — an email address, say — is left alone.

## Expressions in Lists

Inside a [`VfList`](/guide/repeaters), the `*` wildcard resolves to the current row's index, so every row can compute from its own siblings:

::: usage model

```vue [Preview]
<VfList
  name="items"
  label="Items"
  :schema="{
    quantity: { type: 'text', label: 'Quantity', default: 1 },
    price: { type: 'text', label: 'Price', default: 10 },
    total: {
      type: 'text',
      label: 'Total',
      default: '{items.*.quantity * items.*.price}',
    },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  items: {
    type: 'list',
    label: 'Items',
    schema: {
      quantity: { type: 'text', label: 'Quantity', default: 1 },
      price: { type: 'text', label: 'Price', default: 10 },
      total: {
        type: 'text',
        label: 'Total',
        default: '{items.*.quantity * items.*.price}', // [!code highlight]
      },
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For row `0` the wildcard resolves to `items.0.quantity * items.0.price`, for row `1` to the `items.1.*` pair — each row computes independently. Nested lists take one `*` per level: `outer.*.inner.*.amount`.

### Aggregating over Rows

From **outside** the list, a wildcard means "every row": aggregate functions expand `items.*.price` into one argument per existing row, tracking rows as they're added and removed:

::: usage model

```vue [Preview]
<VfList
  name="amounts"
  label="Amounts"
  flat
  :initial="3"
  :schema="{ amount: { type: 'text', default: 10 } }"
/>
<VfText name="total" label="Total" default="{SUM(amounts.*)}" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  amounts: {
    type: 'list',
    label: 'Amounts',
    flat: true,
    initial: 3,
    schema: {
      amount: { type: 'text', default: 10 },
    },
  },
  total: {
    type: 'text',
    label: 'Total',
    default: '{SUM(amounts.*)}', // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

With object rows, name the field: `SUM(items.*.price)`.

## Constants

Constants are values expressions can reference like variables, without being part of the form data. Define them globally in the config:

```ts
app.use(
  createVueform({
    plugins: [exprEval()],
    $expression: {
      consts: {
        TAX_RATE: 0.2,
        APP_NAME: 'Vueform',
      },
    },
  })
)
```

::: code-group

```ts [Schema]
defineSchema({
  net: { type: 'text', default: 100 },
  gross: { type: 'text', default: '{net * (1 + TAX_RATE)}' },
  footer: { type: 'content', content: 'Powered by {APP_NAME}' },
})
```

```vue [Template]
<VfText name="net" :default="100" />
<VfText name="gross" default="{net * (1 + TAX_RATE)}" />
<VfContent name="footer" content="Powered by {APP_NAME}" />
```

:::

A form can also carry its own constants via the `consts` prop:

```ts
const [Form] = useForm({
  schema,
  consts: {
    REGION: 'EU', // [!code highlight]
  },
})
```

Form-level constants are TextProps — they can be locale maps or functions, so a "constant" can still differ per locale or per context.

::: warning
If a name is already registered in `$expression.consts`, the config value is used. The form-level entry is ignored.
:::

## Custom Functions

Register your own functions via `$expression.functions`. The `defineFunction` helper types the factory — the outer function runs once at startup, the inner one on every evaluation:

```ts
import { createVueform } from '@vueform/ui/origin'
import exprEval, { defineFunction } from '@vueform/expr-eval'

const SLUGIFY = defineFunction(() => (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
)

app.use(
  createVueform({
    plugins: [exprEval()],
    $expression: {
      functions: { SLUGIFY }, // [!code highlight]
    },
  })
)
```

Once registered, it's available in any expression:

::: code-group

```ts [Schema]
defineSchema({
  title: { type: 'text', default: 'Hello World' },
  slug: {
    type: 'text',
    label: 'Slug',
    default: '{SLUGIFY(title)}',
  },
})
```

```vue [Template]
<VfText name="title" default="Hello World" />
<VfText name="slug" label="Slug" default="{SLUGIFY(title)}" />
```

:::

The factory receives a context with the evaluating element (`el$`), its form (`form$`), and the `date` and `locale` modules — read them **inside** the inner function, where they're bound to the current evaluation:

```ts
const FULL_NAME = defineFunction((ctx) => () => {
  const first = ctx.form$?.find('first_name')?.value ?? ''
  const last = ctx.form$?.find('last_name')?.value ?? ''
  return `${first} ${last}`.trim()
})
```

A custom function with a built-in's name overrides the built-in.

## Escaping Braces

For a literal `{...}` that shouldn't be evaluated, escape the opening brace with a backslash:

::: code-group

```ts [Schema]
defineSchema({
  el: {
    type: 'text',
    label: 'Use \\{name} as a placeholder in your template',
  },
})
```

```vue [Template]
<VfText name="el" label="Use \{name} as a placeholder in your template" />
```

:::

The label renders as `Use {name} as a placeholder in your template` — the backslash is consumed, the braces stay. Escaped and active blocks can share a string:

```ts
label: 'Hello \\{literal} from {user}'
// → Hello {literal} from John
```

## Restricting Expression Resolution

Sometimes a string should stay literal without escaping every brace — user-generated content, or a label that documents the syntax itself. Resolution can be restricted at three levels; the most specific wins:

1. **Element** — the `expressions` prop: `false` disables the element's expression resolution entirely, an array of prop keys (`['label', 'help']`) allows only those.
2. **Form** — the same `expressions` prop on `VfForm` / `useForm` applies to every child element.
3. **Global** — `$expression.trigger` in the config takes the same array of allowed prop keys for the whole app.

::: usage

```vue [Preview]
<VfText name="name" label="Name" default="World" />
<VfText
  name="literal"
  label="Hello {name}"
  :expressions="false"
/>
<VfText
  name="partial"
  label="Hello {name}"
  help="Hello {name}"
  :expressions="['label']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name', default: 'World' },
  literal: {
    type: 'text',
    label: 'Hello {name}',
    expressions: false, // [!code highlight]
  },
  partial: {
    type: 'text',
    label: 'Hello {name}',
    help: 'Hello {name}',
    expressions: ['label'], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`literal` renders its braces as-is; `partial` resolves only the label while the help text stays literal. The `default` key is part of the same system — omit it from an allow-list and computed defaults stop resolving too.

To switch the whole system off, set `$expression.enabled: false` in the config — expression strings then pass through untouched everywhere.

## Edge Cases

| Input                                               | Resolves to |
| --------------------------------------------------- | ----------- |
| Referenced field is `null`, `undefined`, or missing | `''`        |
| Result is `NaN`                                     | `'0'`       |
| Result is `null`, `undefined`, or `[object Object]` | `''`        |
| Expression cannot be parsed                         | Left as-is  |

Expressions can span multiple lines inside one `{...}` block, so longer logic doesn't have to be squeezed onto one line.

### Debugging

Parse and evaluation problems warn in the console during development:

- `Failed to parse expression "..."` — a syntax error; the parser rejected the expression.
- `Expression error in "...": ...` — parsed fine but threw at evaluation (a missing function, a self-reference, a type error).

Warnings are on by default in development and off in production; set `$expression.debug: false` to silence them entirely.
