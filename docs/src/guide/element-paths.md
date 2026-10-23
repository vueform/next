---
outline: [2,3]
---

# Element Paths

Every element in a form is addressed by a **path** — its `name`, prefixed by the names of the containers it sits in and joined with dots, like `email`, `address.city`, or `contacts.0.phone`. One addressing scheme runs through the whole API — `find()`, `get()`, and `set()`, condition targets, expression references, rule parameters that point at other elements, and `conditionsTrigger` all take the same paths, so you learn the scheme once.

## Names Become Paths

A top-level element's path is its `name`. Each container element it sits in prefixes its own name — one segment per level, nesting arbitrarily deep:

```ts
{
  email: { type: 'text', label: 'Email' },
  address: {
    type: 'group',
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
}
```

This form has three paths — `email`, `address`, and `address.city` — and `form$.find('address.city')` reaches the inner field.

Only Vueform's container elements add segments — `!VfGroup`, `!VfGrid`, `!VfList`, and `!VfMatrix`. Splitting a form across your own components adds nothing to the path, and neither do `!VfRow` / `!VfCol` layout or plain wrapper markup — see [splitting across files](/guide/rendering#splitting-across-files).

Grid cells are elements of the grid the same way a group's children are elements of the group. A schema cell without a `name` gets the generated name `{grid}_{row}_{col}` from its position, so name any cell you want to address.

Elements without a value — buttons, content — have paths too and can be found; they just have no value to read.

## Tree Path vs Data Path

Every element context carries two paths. `path` is its place in the **element tree**, where every container contributes a segment. `dataPath` is its place in the [model](/guide/model), where only containers that own a level of data contribute.

The two diverge at flat containers. A `!VfGroup` or `!VfGrid` without `nested` writes its children into its parent's data level, while `nested: true` makes it own a sub-object under its name — [nesting data](/guide/form-structure#nesting-data) covers the mechanics.

```ts
{
  billing: {
    type: 'group',
    schema: {
      company: { type: 'text', label: 'Company' },
    },
  },
  shipping: {
    type: 'group',
    nested: true,
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
}
```

| Element | `path` | `dataPath` |
| --- | --- | --- |
| `company` | `billing.company` | `company` |
| `city` | `shipping.city` | `shipping.city` |

The model this schema produces is `{ company, shipping: { city } }`. A flat container owns no level of data itself, so its tree path is its only address.

### Which Spelling Resolves

`find()` tries the tree path first and falls back to the data path, so `find('billing.company')` and `find('company')` return the same element. The same lookup serves `get` / `set`, condition targets, `@prop` references, rule parameters, [`conditionsTrigger`](/guide/conditions#async-conditions), and the error keys `setInvalid` applies after a [server validation error](/guide/validation#server-validation-errors).

The one consumer that flips the order is expressions — a reference resolves as a data path first, then as a tree path through the same lookup. When one string is both a valid data path and a *different* element's tree path, the data value wins and development builds warn about the ambiguous reference.

Prefer the tree path. It is the element's complete address, and it is what [typed paths](#typed-paths) suggest. To look an element up strictly by data path, use [`findByDataPath()`](/components/VfForm#context.findByDataPath).

### Unique Data Paths

Because flat containers share their parent's data level, two elements can land on the same data path — a top-level `company` and a `company` inside a plain `billing` group both write the `company` key, and the form logs a console error naming the colliding tree paths. The rule is that names must be unique per **data** level, not just per container — set `nested` on the group or rename one of the fields.

## List Paths

`!VfList` rows are addressed by index. Each row adds a numeric segment — `contacts.0.name` is the `name` field of the first row, and the row itself is `contacts.0` — row anatomy is covered by [repeaters](/guide/repeaters). In a [flat list](/guide/repeaters#flat-lists) the row's value is the entry itself, so the index is the last segment — `tags.0`. Nested lists stack their indices — `orders.2.items.0.qty`.

Indices re-path as rows are added, removed, and reordered, so a fixed index only fits code running at a known moment. Schemas reference list rows with [wildcards](#wildcards) instead.

In its default mode, `!VfMatrix` addresses rows by their row value and cells by their column value — `permissions.posts.read` is the `read` cell of the `posts` row. A dynamic matrix repeats rows like a list, so its rows are addressed by index — `line_items.0.qty`. See [matrix layout](/guide/form-structure#matrix-layout).

### Wildcards

A `*` segment stands for the current row's index, filled from the referencing element's own path at evaluation time — `contacts.*.type`, read by an element in row 1, means `contacts.1.type`. Nested lists take one `*` per level, as in `orders.*.items.*.qty`.

Wildcards resolve in [conditions](/guide/conditions#conditions-in-repeated-rows), [expressions](/guide/expressions#expressions-in-lists), and [rule parameters](/guide/validation#referencing-other-elements) — each use has its own example at its home. `find()`, `get()`, `set()`, and `conditionsTrigger` take concrete paths only.

Outside the list, only expressions give `*` a meaning — aggregate functions expand it over every existing row, as in `SUM(items.*.price)`. A condition outside the list that uses `*` matches no element and stays unmet.

## Prop Paths

Appending `@prop` to a path targets a property of the element's [context](/guide/context#element-context) instead of its value. The part after `@` is itself a dot path into the context, so nested and native properties are reachable too — `@model.country`, `@model.length`:

```ts
form$.get('country@selectedLabel') // the select's displayed label
form$.get('settings@available') // whether its conditions are met
```

The same suffix works in [condition targets](/guide/conditions#referencing-element-properties) and [expressions](/guide/expressions#element-props), where a bare `@prop` addresses the current element. Which props conditions and expressions may read is a security policy — see [prop references](/guide/security#prop-references).

## Paths in Code

The form context has three path methods. `find(path)` returns the element's context, or `undefined` when nothing matches. `get(path)` returns the element's value, and `set(path, value)` writes through the element's own `update` — see the [reference](/components/VfForm#context.find).

When a path matches no element, `get` and `set` fall through to the model and read or write the raw data path, so data without an element — a server-assigned `id`, say — is reachable the same way.

With an [attached](/guide/model#attaching-the-model) `!useModel` instance, `find` also resolves schema elements that aren't mounted, returning a virtual context. On a headless `!useModel` instance, `find` takes tree paths while `get` / `set` address the data directly by data path — the two spellings only differ under flat containers.

### Typed Paths

When the form or model is typed from a `!defineSchema` result, `find`, `get`, and `set` suggest every tree path. List rows show up as `.0` while any index is accepted, `get` types its result — `@prop` paths included — and `set` type-checks the value against the element's model:

```ts
const schema = defineSchema({
  address: {
    type: 'group',
    nested: true,
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
})

const [MyForm, form$] = useForm({ schema })

form$.set('address.city', 'Berlin') // ✅ string | number | null
form$.set('address.city', true) // ❌ compile error — not a text value
```

Unknown strings still compile, so paths built at runtime keep working — they just resolve without types, and `find` returns `undefined` when nothing is registered there. The path autocomplete demo lives at [element context](/guide/context#element-context). [Inline forms](/guide/rendering#inline-forms) carry no schema type, so their paths are plain strings.
