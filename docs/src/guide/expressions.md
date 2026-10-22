---
outline: [2,3]
---

# Expressions

A form's texts and values often depend on the form's own data — a help text that addresses the user by the name they just typed, a total that multiplies two other fields, a deadline that defaults to thirty days from today. Expressions describe these dependencies as **plain strings**. An expression is a `{...}` block embedded in a prop's value, and Vueform re-resolves it against the live form data every time that data changes.

Because an expression is just a string, it **survives serialization**. The same `{price * quantity}` behaves identically whether it's typed into a template, defined in a schema object, or loaded from a database as part of a JSON form definition. Wherever a function prop can't travel, an expression can.

## Referencing Other Fields

The simplest expression is a path wrapped in curly braces. Inside any text-bearing prop, `{name}` resolves to the current value of the element named `name`, while everything outside the braces stays literal text:

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

Every prop that displays text resolves expressions — `label`, `placeholder`, `help`, `description`, and the rest of the [dynamic props](/guide/dynamic-props).

The path between the braces is an [element path](/guide/element-paths). Dot segments walk into nested structures — `user.name` reaches an element inside a group, `items.0.price` a field in a list's first row. <!-- @todo: this information should be rather mentioned more generally in Element Paths because it applies to all the places where element paths are used: Both the element's [tree path and its data path](/guide/element-paths#tree-path-vs-data-path) resolve; **prefer the tree path**, the element's full address in the form. -->

A reference is live. Whenever a referenced element's value changes, every string that mentions it updates, so the bio label above rewrites itself with each keystroke in the name field. An empty, `null`, or missing value resolves to an empty string rather than printing `null` or `undefined` into the text.

Path interpolation works out of the box, with no plugin and no configuration. It's also the boundary of the built-in behavior — the moment an expression contains more than a bare path, an operator or a function call, it needs the expression engine.

## The Expression Engine

Everything beyond interpolation — operators, comparisons, ternaries, functions — comes from the expression engine, a plugin installed once per app. The official engine is [`@vueform/expr-eval`](/plugins/expr-eval), a thin adapter around the `expr-eval-fork` parser:

::: code-group

```bash [npm]
npm install @vueform/expr-eval
```

```bash [pnpm]
pnpm add @vueform/expr-eval
```

```bash [yarn]
yarn add @vueform/expr-eval
```

```bash [bun]
bun add @vueform/expr-eval
```

:::

Register it in `createVueform`:

```ts
import { createVueform } from '@vueform/ui/origin'
import exprEval from '@vueform/expr-eval'

app.use(
  createVueform({
    plugins: [exprEval()], // [!code highlight]
  })
)
```

Without the engine, an expression that holds more than a bare path is left in the string as-is, and development builds warn once that the engine is missing. Plain path interpolation keeps working either way.

### Syntax and Operators

Expressions are not JavaScript. The engine parses a small, self-contained language in which only its own operators and the registered functions can run — a string loaded from a database is as safe to evaluate as one typed into a template, and parsing stays fast because there's so little to parse.

| Category | Operators |
| --- | --- |
| Math | `+`, `-`, `*`, `/`, `%`, `^` (power) |
| Comparison | `==`, `!=`, `>`, `>=`, `<`, `<=` |
| Logical | `and` / `AND`, `or` / `OR`, `not` / `NOT`, `!` |
| Membership | `in` |
| Conditional | `cond ? a : b` |

Logical operators work in either case — `and` and `AND` are the same operator. String literals inside an expression use quotes, as the ternary below shows:

```ts
defineSchema({
  price: { type: 'text', label: 'Price', default: 100 },
  quantity: { type: 'text', label: 'Quantity', default: 3 },
  note: {
    type: 'text',
    label: 'Order total is {price * quantity}', // [!code highlight]
    help: "{quantity == 1 ? 'Single item order.' : 'Multi-item order.'}", // [!code highlight]
  },
})
```

A string can mix literal text with any number of `{...}` blocks, and a single block can span multiple lines, so longer logic doesn't have to be squeezed onto one line.

## Computing Values

The order total above lives in a label — the user can read it, but the form never submits it. Moving the same expression into the `default` prop turns it into the element's **value**. The field holds the computed result as real form data, included in submissions like anything the user typed.

### Computed Defaults

A `default` expression is **tracked** — the element re-computes its value whenever a referenced field changes:

```ts
defineSchema({
  price: { type: 'text', label: 'Price', default: 10 },
  quantity: { type: 'text', label: 'Quantity', default: 2 },
  total: {
    type: 'text',
    label: 'Total',
    default: '{price * quantity}', // [!code highlight]
  },
})
```

`total` starts at `20` and follows `price` and `quantity` as they change.

Computed elements chain. An element whose value comes from an expression can itself be referenced by another expression, and a change cascades through the whole chain:

```ts
defineSchema({
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
```

Change `price` or `tax_rate` and the update flows through `tax` into `total`.

### When Tracking Stops

A computed default keeps updating only until the user takes over. The `untrackOn` prop lists the events that stop tracking, and its default is `['input', 'load']`:

- `'input'` — the user edits the element directly; their value wins from then on.
- `'load'` — data is loaded into the form (e.g. `form$.load()`); the loaded value is treated as user data, not a template to overwrite.

To keep a total recalculating even after data loads, narrow the list:

::: usage

```vue [Preview]
<VfText name="price" :default="10" />
<VfText name="quantity" :default="2" />
<VfText
  name="total"
  default="{price * quantity}"
  :untrack-on="['input']"
/>
```

```vue [Template]
<VfText
  name="price"
  label="Price"
  input-type="number"
  :columns="6"
  :default="10"
/>
<VfText
  name="quantity"
  label="Quantity"
  input-type="number"
  :columns="6"
  :default="2"
/>
<VfText
  name="total"
  label="Total"
  input-type="number"
  default="{price * quantity}"
  :untrack-on="['input']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  price: {
    type: 'text',
    label: 'Price',
    inputType: 'number',
    columns: 6,
    default: 10,
  },
  quantity: {
    type: 'text',
    label: 'Quantity',
    inputType: 'number',
    columns: 6,
    default: 2,
  },
  total: {
    type: 'text',
    label: 'Total',
    inputType: 'number',
    default: '{price * quantity}',
    untrackOn: ['input'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

As long as the total input itself is left untouched, it keeps updating — change `price` or `quantity` and it follows, even after data is loaded. The moment the user types into `total`, tracking stops for good.

A computed field is still an input, so the user can overwrite it. Add `readonly: true` or `disabled: true` to the element to rule that out — with no way to edit, the value is guaranteed to stay computed.

### Computed Display Text

A computed result doesn't have to occupy an input. `VfContent` renders its `content` prop as plain content, resolving expression blocks mixed with literal text:

```ts
defineSchema({
  a: { type: 'text', label: 'A', default: 3 },
  b: { type: 'text', label: 'B', default: 5 },
  summary: {
    type: 'content',
    content: '{a} + {b} = {a + b}', // [!code highlight]
  },
})
```

This renders `3 + 5 = 8` and stays current as the inputs change.

### Expressions in Lists

Inside a [list](/guide/repeaters), the `*` wildcard resolves to the current row's index, so every row can compute from its own siblings:

```ts
defineSchema({
  items: {
    type: 'list',
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
```

For row `0` the wildcard resolves to `items.0.quantity * items.0.price`, for row `1` to the `items.1.*` pair — each row computes independently. Nested lists take one `*` per level, as in `outer.*.inner.*.amount`.

From **outside** the list, a wildcard means **every row**. Aggregate functions expand `amounts.*` into one argument per existing row, tracking rows as they're added and removed:

```ts
defineSchema({
  amounts: {
    type: 'list',
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
```

With object rows, name the field — `SUM(items.*.price)`. `SUM` is one of the [built-in functions](#built-in-functions), which all flatten the arrays a wildcard produces.

## Conditions with Expressions

Expressions also drive conditional logic. A string passed to the `conditions` prop is evaluated as a boolean expression — written bare, without braces, since the whole string is the expression:

```ts
defineSchema({
  plan: { type: 'radios', label: 'Plan', items: ['Free', 'Pro'] },
  discount_code: {
    type: 'text',
    label: 'Discount Code',
    conditions: "plan == 'Pro'", // [!code highlight]
  },
})
```

The condition uses the same language as every other expression in this chapter — references, operators, and functions included. What happens once it evaluates — hiding, clearing data, conditional validation, combining with other condition formats — is covered by the [conditions](/guide/conditions#expression-conditions) chapter.

## Functions

The engine ships a library of helpers, called with parentheses inside a `{...}` block. Names are uppercase by convention, arguments accept anything an expression can produce, and calls nest — `{DATE_ADD(TODAY(), 30, 'day')}` is a function fed by another function.

### Built-in Functions

**Logic**

| Function | Description |
| --- | --- |
| `NOT(value)` | Negation of `value`. |
| `EMPTY(value)` | `true` for `''`, `null`, `undefined`, or an empty array. |
| `NOT_EMPTY(value)` | The inverse of `EMPTY`. |

**Numbers**

| Function | Description |
| --- | --- |
| `SUM(...args)` | Sum of all arguments. Non-numeric values count as `0`. |
| `AVG(...args)` | Average of non-empty values. |
| `MIN(...args)` | Smallest non-empty value. |
| `MAX(...args)` | Largest non-empty value. |
| `COUNT(...args)` | Count of non-empty values. |
| `ROUND(value, places)` | Rounds `value` to `places` decimals. |

All of the number functions accept multiple arguments **and flatten arrays**, which makes them a natural fit for [wildcard list paths](#expressions-in-lists) like `SUM(items.*.price)`.

**Text**

| Function | Description |
| --- | --- |
| `CONCAT(...args)` | Joins all arguments into one string; empty values contribute nothing. |
| `LC(value)` / `UC(value)` | Lowercase / uppercase. |
| `UCF(value)` | Uppercase first letter. |
| `ENCODE_URI(value)` / `DECODE_URI(value)` | URI encoding / decoding. |
| `ENCODE_URI_COMPONENT(value)` / `DECODE_URI_COMPONENT(value)` | URI-component encoding / decoding. |

**Dates**

| Function | Description |
| --- | --- |
| `TODAY()` | Today's date as `YYYY-MM-DD`. |
| `NOW()` | Current timestamp as an ISO string. |
| `AGE(date)` | Whole years between `date` and today. |
| `DATE_ADD(value, amount, unit)` | Adds an amount of `unit` (`'day'`, `'month'`, …) to a date, preserving the input's format. |
| `FORMAT_DATE(value, format)` | Formats a date using the date adapter's format tokens. |

```ts
defineSchema({
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
    label: 'Deadline',
    default: "{DATE_ADD(TODAY(), 30, 'day')}", // [!code highlight]
  },
})
```

`AGE`, `DATE_ADD`, and `FORMAT_DATE` go through the [date module](/guide/date). The built-in native adapter handles standard formats (`YYYY-MM-DD`, with optional time); for custom date formats install a date plugin ([`@vueform/dayjs`](/plugins/dayjs), [`@vueform/date-fns`](/plugins/date-fns), or [`@vueform/luxon`](/plugins/luxon)).

### Custom Functions

Register your own functions under `$expression.functions`. The `defineFunction` helper types the factory — the outer function runs once at startup, the inner one on every evaluation:

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

```ts
defineSchema({
  title: { type: 'text', label: 'Title', default: 'Hello World' },
  slug: { type: 'text', label: 'Slug', default: '{SLUGIFY(title)}' },
})
```

The factory receives a context carrying the evaluating element ([`el$`](/guide/context#element-context)), its form ([`form$`](/guide/context#form-context)), and the owning Vueform instance. Read them **inside** the inner function, where they're bound to the current evaluation:

```ts
const SHARE_OF = defineFunction(
  (ctx: ExpressionFunctionContext) => (value: any, path: string) => {
    const total = Number(ctx.form$?.find(path)?.value) || 0
    return total ? `${Math.round(((Number(value) || 0) / total) * 100)}%` : ''
  }
)
```

An element using `help: "{SHARE_OF(amount, 'total')}"` shows what share `amount` makes up of the form's `total`. The `amount` argument arrives already resolved to that element's value, the quoted `'total'` passes through as a plain string for `form$` to look up — and `el$` is the element the expression runs on, bound the same way.

A custom function with a built-in's name overrides the built-in.

## Advanced References

So far every reference has read an element's **value**. Two more reference forms reach beyond values — element props and constants.

### Element Props

The `@` shorthand reads element **props** — properties on the element's [context](/guide/context):

- `path@prop` — a prop of the element at `path`, e.g. `country@selectedLabel`.
- `@prop` — a prop of the **current** element, e.g. `@label`.

A prop must be allowlisted in [`$security.safePropRefs`](/guide/configuration#security) before it resolves — unlisted references render as empty, with a dev warning naming the missing entry:

```ts
app.use(
  createVueform({
    plugins: [exprEval()],
    $security: {
      safePropRefs: ['selectedLabel'], // [!code highlight]
    },
  })
)
```

With `selectedLabel` listed, an expression can read it off another element:

```ts
defineSchema({
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
```

The model holds `us`, but the note shows _United States_ — the select's `selectedLabel` prop instead of its value. Any listed context property is reachable the same way, with dot paths drilling deeper (`@model.city`), `[n]` index segments (`@model[0]`), and targets like `settings@available`, which tells whether another element's [conditions](/guide/conditions) are met. Nested paths need a pattern that covers them, such as `model.*` — see [Prop References](/guide/security#prop-references) for the full syntax `safePropRefs` accepts.

The shorthand desugars to the `PROP("path", "prop")` and `SELF("prop")` functions, which you can also call directly and which pass through the same allowlist. A literal `@` inside a quoted string — an email address, say — is left alone.

### Constants

Constants are values expressions can reference like variables, without being part of the form data. Define them globally in the config:

```ts
app.use(
  createVueform({
    plugins: [exprEval()],
    $expression: {
      consts: {
        TAX_RATE: 0.2, // [!code highlight]
        APP_NAME: 'Vueform', // [!code highlight]
      },
    },
  })
)
```

```ts
defineSchema({
  net: { type: 'text', label: 'Net', default: 100 },
  gross: { type: 'text', label: 'Gross', default: '{net * (1 + TAX_RATE)}' },
  footer: { type: 'content', content: 'Powered by {APP_NAME}' },
})
```

A form can also carry its own constants via the `consts` prop:

```ts
const [Form] = useForm({
  schema,
  consts: {
    REGION: 'EU', // [!code highlight]
  },
})
```

Form-level constants are [dynamic props](/guide/dynamic-props) — they can be locale maps or functions, so a "constant" can still differ per locale or per context.

::: warning
If a name is already registered in `$expression.consts`, the config value is used. The form-level entry is ignored.
:::

Form-level constants can be disabled app-wide with [`$expression.localConsts: false`](/guide/configuration#expression) — `consts` props then have no effect, and only `$expression.consts` entries remain available.

## Controlling Resolution

Sometimes a string should stay literal — user-generated content, or a label that documents the expression syntax itself. Braces can be escaped one by one, or resolution can be switched off at the element, form, or app level.

### Escaping Braces

For a literal `{...}` that shouldn't be evaluated, escape the opening brace with a backslash:

```ts
defineSchema({
  el: {
    type: 'text',
    label: 'Use \\{name} as a placeholder in your template', // [!code highlight]
  },
})
```

The label renders as `Use {name} as a placeholder in your template` — the backslash is consumed, the braces stay. What the resolver needs is one real backslash in the string's runtime value; how that's typed depends on where the string lives. JavaScript string literals and JSON (a schema stored in a database, say) both escape the **backslash itself**, so they're written `\\{` — while a template attribute takes it as-is, `label="Use \{name} …"`. Escaped and active blocks can share a string:

```ts
label: 'Hello \\{literal} from {user}'
// → Hello {literal} from John
```

### Restriction Levels

Resolution can be restricted at three levels:

1. **Element** — the `no-expressions` prop disables the element's expression resolution entirely. It applies to that element alone — a container's `no-expressions` does not cascade to its children.
2. **Form** — `no-expressions` on the form disables resolution for the form and **every element** in it. An element cannot opt back in under it.
3. **Global** — `$expression.whitelist` in the [config](/guide/configuration#expression) lists the prop keys that resolve for the whole app — when it isn't set, every expressionable prop resolves. Members are exact strings or RegExps (`/^lab/` covers `label`).

```ts
defineSchema({
  name: { type: 'text', label: 'Name', default: 'World' },
  literal: {
    type: 'text',
    label: 'Hello {name}',
    noExpressions: true, // [!code highlight]
  },
  greeting: {
    type: 'text',
    label: 'Hello {name}',
    help: 'Hello {name}',
  },
})
```

`literal` renders its braces as-is, while `greeting` resolves both. With a global whitelist the resolved set narrows app-wide:

```ts
createVueform({
  $expression: {
    whitelist: ['label'], // [!code highlight]
  },
})
```

Now `greeting` resolves only its label and leaves the help text literal. The `default` key is part of the same system — omit it from the whitelist and computed defaults stop resolving too.

To switch the whole system off, set `$expression.enabled: false` in the config — expression strings then pass through untouched everywhere.

## Troubleshooting

An expression never leaks raw error output into rendered text — problematic results degrade to predictable values:

| Input | Resolves to |
| --- | --- |
| Referenced field is `null`, `undefined`, or missing | `''` |
| Result is `NaN` | `'0'` |
| Result is `null`, `undefined`, or `[object Object]` | `''` |
| Expression cannot be parsed | `''` + a dev warning |

### Debugging

Parse and evaluation problems warn in the console during development:

- `Failed to parse expression "..."` — a syntax error; the parser rejected the expression.
- `Expression error in "...": ...` — parsed fine but threw at evaluation (a missing function, a self-reference, a type error).

Warnings are on by default in development and off in production; set `$expression.debug: false` to silence them entirely.
