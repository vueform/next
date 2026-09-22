---
outline: [2,3]
---

# Element Paths

Every element in a form is addressable by a **path** — its name, prefixed by the names of the containers it sits in, joined with dots: `email`, `address.city`, `contacts.0.phone`. One addressing scheme runs through the whole API: `find()`, `get()` and `set()`, [condition](/guide/conditions) targets, [expression](/guide/expressions) references, and validation rules that point at other elements all take the same paths.

This chapter explains how paths are formed, how the element **tree** path relates to the **data** path, and the extra syntax — numeric row segments, `*` wildcards, `@prop` suffixes — that builds on top.

## Names Become Paths

At the top level of a form, an element's path is simply its `name`:

::: code-group

```vue [Template]
<VfForm>
  <VfText name="email" label="Email" />
</VfForm>
```

```ts [Schema]
defineSchema({
  email: { type: 'text', label: 'Email' },
})
```

:::

```ts
form$.find('email')  // the element context
form$.get('email')   // its value
```

Put the element inside a named container and the container's name becomes a prefix:

::: code-group

```vue [Template]
<VfForm>
  <VfGroup name="address">
    <VfText name="city" label="City" />
  </VfGroup>
</VfForm>
```

```ts [Schema]
defineSchema({
  address: {
    type: 'group',
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
})
```

:::

```ts
form$.find('address.city')  // the element context
form$.get('address.city')   // its value
```

The same `address.city` path also works as a condition target or an expression reference. Containers nest arbitrarily, and each named level adds one segment.

## Tree Path vs Data Path

An element actually carries **two** paths, available on its [Context](/guide/context):

- `path` — its location in the form's element tree. Every named ancestor contributes a segment.
- `dataPath` — its location in the form's **model**. Only ancestors that own a level of data contribute.

The two diverge because containers don't necessarily nest data. A plain `VfGroup` is purely organizational — its children write straight into the parent's data — while a `nested` group owns a sub-object (see [Nesting Data](/guide/form-structure#nesting-data)):

::: usage model

```vue [Preview]
<VfGroup name="billing">
  <VfText name="company" label="Company" />
</VfGroup>
<VfGroup name="shipping" nested>
  <VfText name="city" label="City" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  billing: {
    type: 'group',
    schema: {
      company: { type: 'text', label: 'Company' },
    },
  },
  shipping: {
    type: 'group',
    nested: true, // [!code highlight]
    schema: {
      city: { type: 'text', label: 'City' },
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

| Element | `path`            | `dataPath`      | Model                         |
| ------- | ----------------- | --------------- | ----------------------------- |
| Company | `billing.company` | `company`       | `{ company: ... }`            |
| City    | `shipping.city`   | `shipping.city` | `{ shipping: { city: ... } }` |

The APIs are forgiving about the difference: `find()` looks the path up in the element tree first and falls back to matching by data path, so `find('billing.company')` and `find('company')` both resolve the same element. [Condition](/guide/conditions) targets and `@prop` references go through the same lookup, and [expression](/guide/expressions) `{...}` references read the model first and fall back to it — either spelling works everywhere. Prefer the **tree path**: it's the complete address (a data-less container like `billing` has no other), and it's the one the typed `find()` autocompletes.

## List Paths

Rows of a [`VfList`](/guide/repeaters) are addressed by their **index**. Each row adds a numeric segment between the list's name and the row's elements:

```
contacts.0.name   // first row's name field
contacts.1.email  // second row's email field
```

With [`flat`](/guide/repeaters#flat-lists) lists the row's value _is_ the entry, so the numeric segment is the last one: `tags.0`, `tags.1`. Nested lists stack their indices: `orders.2.items.0.qty`.

Because indices shift as rows are added, removed, and reordered, hard-coding them only makes sense for programmatic access at a known moment — inside schemas, use wildcards.

### Wildcards

In a condition or expression defined **inside** a list row, the `*` segment stands for "the current row's index" — resolved per row at evaluation time:

::: code-group

```vue [Template]
<VfList name="contacts">
  <template #default="{ index }">
    <VfGroup :name="index" nested>
      <VfRadios
        name="type"
        :items="{ email: 'Email', phone: 'Phone' }"
        default="email"
      />
      <VfText name="email" :conditions="[['contacts.*.type', '==', 'email']]" />
    </VfGroup>
  </template>
</VfList>
```

```ts [Schema]
defineSchema({
  contacts: {
    type: 'list',
    schema: {
      type: {
        type: 'radios',
        items: { email: 'Email', phone: 'Phone' },
        default: 'email',
      },
      email: {
        type: 'text',
        conditions: [['contacts.*.type', '==', 'email']], // [!code highlight]
      },
    },
  },
})
```

:::

Each row evaluates against its own `type` — row 0 reads `contacts.0.type`, row 1 reads `contacts.1.type`. From **outside** the list, a wildcard in an aggregate expression means "every row": `SUM(items.*.price)` expands over all existing rows. See [Wildcard Paths](/guide/conditions#wildcard-paths) and [Expressions in Lists](/guide/expressions#expressions-in-lists).

## Prop Paths

Appending `@propName` to a path targets a **property** of the element's [Context](/guide/context) instead of its value. This is the same `path@prop` syntax as [Expressions](/guide/expressions#referencing-element-props), and it works in structured [conditions](/guide/conditions#conditions-on-element-properties) and in `form$.get()`:

```ts
form$.get('country@selectedLabel')  // the select's visible label
form$.get('settings@available')     // whether its conditions are met

conditions: [['address@model.country', '==', 'US']]
```

The part after `@` is itself a dot path into the context, so nested props (`@model.country`) and native properties (`@model.length`) are reachable.

## Where Paths Are Used

The same paths appear across the API — learn them once, use them everywhere:

| API                                                            | Example                               |
| -------------------------------------------------------------- | ------------------------------------- |
| [`find()`](/guide/context#finding-elements)                    | `form$.find('address.city')`          |
| `get()` / `set()`                                              | `form$.set('address.city', 'Berlin')` |
| [Conditions](/guide/conditions)                                | `conditions: [['plan', '==', 'Pro']]` |
| [Expressions](/guide/expressions)                              | `default: '{price * quantity}'`       |
| [Rule params](/guide/validation#rules-with-element-references) | `rules: 'required\|same:password'`    |
| [`conditionsTrigger`](/guide/conditions#async-conditions)      | `conditionsTrigger: ['username']`     |

When the form is typed from a `!defineSchema` result, TypeScript knows the valid paths — `find()`, `get()`, and `set()` autocomplete them, and a matched path types its result:

```ts
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  address: {
    type: 'group',
    nested: true,
    schema: {
      city: { type: 'text', label: 'City' },
    },
  },
})

const [Form, form$] = useForm({ schema })

form$?.find('')
//           <22|*text:name@"name"|text:address@"address"|text:address.city@"address.city"
```

<br />

Typos aren't rejected, though: the path parameter deliberately keeps accepting any string, so dynamic paths built at runtime still compile — an unknown path resolves to an untyped element, or `undefined` when nothing is registered there.
