---
outline: [2,3]
---

# Form Structure

By default a form is a vertical stack — every element on its own row, in declaration order. This chapter is about everything beyond that stack: placing elements side by side, grouping related fields, lining inputs up in tables, and separating sections. Vueform gives you a small set of tools that cover the whole range:

- A **12-column responsive grid** sizes and places individual elements — the workhorse for everyday layouts.
- `VfGroup` **groups** a set of elements — visually, structurally, or in the data model.
- `VfGrid` and `VfMatrix` build **two-dimensional layouts** — table-like forms where cells align across rows.
- **Spacing and divider props** separate sections without custom CSS.

The chapter walks through them in that order, from the everyday to the specialized.

## The 12-Column Grid

Elements inside a `VfForm` (or any container element) sit on a grid that divides the available width into **12 columns**. An element with no `columns` prop takes all 12 — that's where the one-per-row default comes from:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="first_name" label="First name" />
  <VfText name="last_name" label="Last name" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  first_name: { type: 'text', label: 'First name' },
  last_name: { type: 'text', label: 'Last name' },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Everything in this section is a variation on one prop: `columns` tells an element how many of those 12 columns to occupy.

## Multiple Elements Per Row

Set `columns` to a number and the element takes that share of the row instead of all of it:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="first_name" :columns="6" />
  <VfText name="last_name" :columns="6" />
</VfForm>
```

```vue [Template]
<VfForm>
  <VfText name="first_name" label="First name" :columns="6" />
  <VfText name="last_name" label="Last name" :columns="6" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  first_name: {
    type: 'text',
    label: 'First name',
    columns: 6,
  },
  last_name: {
    type: 'text',
    label: 'Last name',
    columns: 6,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The two inputs each take half the row. Elements flow in row direction and wrap automatically: when the next element's `columns` value would push the total past 12, it starts a new row — nothing ever overflows.

### Responsive Breakpoints

A `6`-column input that looks right on desktop is usually too narrow on a phone. To set different widths at different viewport sizes, pass an object keyed by breakpoint name:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="first_name" :columns="{ md: 6 }" />
  <VfText name="last_name" :columns="{ md: 6 }" />
</VfForm>
```

```vue [Template]
<VfForm>
  <VfText name="first_name" label="First name" :columns="{ md: 6 }" />
  <VfText name="last_name" label="Last name" :columns="{ md: 6 }" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  first_name: {
    type: 'text',
    label: 'First name',
    columns: { md: 6 },
  },
  last_name: {
    type: 'text',
    label: 'Last name',
    columns: { md: 6 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

These elements take the full row on mobile and half the row from the `md` breakpoint up:

| Viewport  | Columns         |
| --------- | --------------- |
| `≥ 768px` | `6`             |
| `< 768px` | `12` (full row) |

There are five breakpoints by default, each one activating at the listed viewport width and staying active for everything wider:

| Breakpoint | Active from |
| ---------- | ----------- |
| `sm`       | `≥ 640px`   |
| `md`       | `≥ 768px`   |
| `lg`       | `≥ 1024px`  |
| `xl`       | `≥ 1280px`  |
| `2xl`      | `≥ 1536px`  |

Multiple breakpoint keys can be combined — each one takes over once its threshold is reached. So `:columns="{ sm: 6, md: 3 }"` resolves like this:

| Viewport  | Columns         |
| --------- | --------------- |
| `≥ 768px` | `3`             |
| `≥ 640px` | `6`             |
| `< 640px` | `12` (full row) |

Below the smallest defined breakpoint, the element falls back to **full width**. To set a different starting width inside the breakpoint object, use the special `base` key:

::: usage nolive

```vue [Preview]
<VfText name="text" :columns="{ base: 6, md: 3 }" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  text: {
    type: 'text',
    columns: { base: 6, md: 3 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The element is now 6 columns below `md` and 3 columns from `md` up — the equivalent of Tailwind's `col-span-6 md:col-span-3` or Bootstrap's `col-6 col-md-3`. This is the **mobile-first** model used by most modern design systems: start from a sensible narrow-viewport default and refine as the viewport grows.

::: tip
The breakpoint names and widths can be customized globally — see [Configuration](/guide/configuration). The column count itself is fixed at 12.
:::

### Desktop-First

To flip the model — each breakpoint applying from that viewport size **downward** instead of upward — set `mobileFirst: false` globally:

```ts
createVueform({
  mobileFirst: false,
})
```

In this mode the breakpoint media queries become `max-width` instead of `min-width`, and `base` becomes the _starting_ width of the layout: viewports above the largest defined breakpoint match no other key. So `:columns="{ base: 3, md: 6, sm: 12 }"` resolves like this:

| Viewport  | Columns |
| --------- | ------- |
| `> 768px` | `3`     |
| `≤ 768px` | `6`     |
| `≤ 640px` | `12`    |

This is the same `12 / 6 / 3` layout the mobile-first example produced (give or take a pixel at each boundary) — just authored from the opposite end. Pick whichever direction matches how you think about the design.

::: info
`mobileFirst` is a global setting — it can't be toggled per form or per element. Pick one mode at app initialization and stay with it.
:::

## Horizontal Labels

So far `columns` sized the element as a whole. It can also divide the width **inside** the element — between the label and the control. Set `columns.label` to anything less than 12 and the label moves next to the input, taking that many columns; the input takes the rest:

::: usage

```vue [Preview]
<VfForm>
  <VfText name="first_name" label="First name" :columns="{ label: 4 }" />
  <VfText name="last_name" label="Last name" :columns="{ label: 4 }" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  first_name: {
    type: 'text',
    label: 'First name',
    columns: { label: 4 },
  },
  last_name: {
    type: 'text',
    label: 'Last name',
    columns: { label: 4 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The label takes 4 columns, the input takes the remaining 8, and the layout switches to horizontal automatically.

This pairs well with breakpoints — vertical labels on mobile, horizontal labels on wider screens:

::: usage nolive

```vue [Preview]
<VfText name="text" label="Text" :columns="{ md: { label: 4 } }" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  text: {
    type: 'text',
    label: 'Text'
    columns: { md: { label: 4 } },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

### RTL

Horizontal labels are mirrored automatically under right-to-left writing direction — set `dir="rtl"` on `html` (or any ancestor of the element) and the label moves to the **right** of the input:

::: usage rtl

```vue [Live]
<VfForm>
  <VfText name="first_name" label="الاسم الأول" :columns="{ label: 4 }" />
  <VfText name="last_name" label="اسم العائلة" :columns="{ label: 4 }" />
</VfForm>
```

```vue [Preview]
<div dir="rtl">
  <VfForm>
    <VfText name="first_name" label="الاسم الأول" :columns="{ label: 4 }" />
    <VfText name="last_name" label="اسم العائلة" :columns="{ label: 4 }" />
  </VfForm>
</div>
```

```vue [Template]
<div dir="rtl">
  <VfForm>
    <VfText name="first_name" label="الاسم الأول" :columns="{ label: 4 }" />
    <VfText name="last_name" label="اسم العائلة" :columns="{ label: 4 }" />
  </VfForm>
</div>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  first_name: {
    type: 'text',
    label: 'الاسم الأول',
    columns: { label: 4 },
  },
  last_name: {
    type: 'text',
    label: 'اسم العائلة',
    columns: { label: 4 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Narrowing Inputs

By default every input is **fluid** — it stretches to fill the space available to it. `columns.wrapper` shrinks the input itself while the element keeps its own full row:

::: usage

```vue [Preview]
<VfForm>
  <VfText
    name="one"
    label="How much is 1+1?"
    description="Write your answer as a whole number."
    :columns="{ wrapper: 2 }"
  />
  <VfText
    name="two"
    label="How much is 2+2?"
    description="Write your answer as a whole number."
    :columns="{ wrapper: 2 }"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  one: {
    type: 'text',
    label: 'How much is 1+1?',
    description: 'Write your answer as a whole number.',
    columns: { wrapper: 2 },
  },
  two: {
    type: 'text',
    label: 'How much is 2+2?',
    description: 'Write your answer as a whole number.',
    columns: { wrapper: 2 },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Each input is now 2 columns wide, but the elements **don't stack** side by side the way `columns: 2` would make them — the label, description, and error messages still get the full row to render in.

## Dynamic Column Widths

`columns` also accepts a **function** that receives the element's [Context](/guide/context) and returns any of the value forms above. Use it when the layout should react to the element's own state, another field, or any reactive data:

::: usage w-lg

```vue [Preview]
<VfForm>
  <VfSelect
    name="country"
    :columns="({ model }) => model === 'US' ? 4 : 6"
  />
  <VfSelect
    name="state"
    :columns="4"
    :conditions="[['country', '==', 'US']]"
  />
  <VfText
    name="city"
    :columns="({ form$ }) => form$.model.country === 'US' ? 4 : 6"
  />
</VfForm>
```

```vue [Template]
<VfForm>
  <VfSelect
    name="country"
    label="Country"
    placeholder="Select a country"
    :items="{ US: 'United States', nonUS: 'Outside of US' }"
    :columns="(el$) => el$.model === 'US' ? 4 : 6"
  />
  <VfSelect name="state" label="State" placeholder="Select state" :columns="4" :items="{
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
    CT: 'Connecticut', DE: 'Delaware', DC: 'District Of Columbia', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
    LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
    NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
    OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
    WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
  }" :conditions="[['country', '==', 'US']]" />
  <VfText name="city" label="City" :columns="({ form$ }) => form$.model.country === 'US' ? 4 : 6" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    placeholder: 'Select a country',
    items: { US: 'United States', nonUS: 'Outside of US' },
    columns: ({ model }) => model === 'US' ? 4 : 6,
  },
  state: {
    type: 'select',
    label: 'State',
    placeholder: 'Select state',
    columns: 4,
    items: {
      AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
      CT: 'Connecticut', DE: 'Delaware', DC: 'District Of Columbia', FL: 'Florida', GA: 'Georgia',
      HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
      LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
      MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
      NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
      OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
      SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
      WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
    },
    conditions: [['country', '==', 'US']],
  },
  city: {
    type: 'text',
    label: 'City',
    columns: ({ form$ }) => form$.model.country === 'US' ? 4 : 6,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Selecting _United States_ narrows the country and city fields to make room for the state select that appears between them. The function argument is the element's [context](/guide/context) — destructure `model` for the element's own value, `form$` to reach into the form, or any other property the context exposes.

For declarative cross-field layout, the same effect can be expressed as an [Expression](/guide/expressions) — a plain string resolved against the form's data, no function needed:

::: usage

```vue [Preview]
<VfSelect name="country" columns="@model == 'US' ? 4 : 6" />
<VfText name="city" columns="country == 'US' ? 4 : 6" />
```

```vue [Template]
<VfForm>
  <VfSelect
    name="country"
    label="Country"
    placeholder="Select a country"
    :items="{ US: 'United States', nonUS: 'Outside of US' }"
    columns="@model == 'US' ? 4 : 6"
  />
  <VfSelect name="state" label="State" placeholder="Select state" :columns="4" :items="{
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
    CT: 'Connecticut', DE: 'Delaware', DC: 'District Of Columbia', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
    LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
    NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
    OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
    WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
  }" conditions="country == 'US'" />
  <VfText name="city" label="City" columns="country == 'US' ? 4 : 6" />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'


const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    placeholder: 'Select a country',
    items: { US: 'United States', nonUS: 'Outside of US' },
    columns: "country == 'US' ? 4 : 6",
  },
  state: {
    type: 'select',
    label: 'State',
    placeholder: 'Select state',
    columns: 4,
    items: {
      AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
      CT: 'Connecticut', DE: 'Delaware', DC: 'District Of Columbia', FL: 'Florida', GA: 'Georgia',
      HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
      LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
      MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
      NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
      OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
      SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
      WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
    },
    conditions: "country == 'US'",
  },
  city: {
    type: 'text',
    label: 'City',
    columns: "country == 'US' ? 4 : 6",
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Grouping Elements

Column widths arrange individual elements. When several elements belong _together_ — a name split into first and last, an address block, a row of buttons — wrap them in a `VfGroup`:

::: usage

```vue [Preview]
<VfGroup
  name="name"
  label="Name"
  help="Enter your full name as it appears on your ID."
>
  <VfText name="first" placeholder="First name" :columns="6" />
  <VfText name="last" placeholder="Last name" :columns="6" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: {
    type: 'group',
    label: 'Name',
    help: 'Enter your full name as it appears on your ID.',
    schema: {
      first: { type: 'text', placeholder: 'First name',
        columns: 6,
      },
      last: { type: 'text', placeholder: 'Last name',
        columns: 6,
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

By default a group adds no styling of its own — children render on the same 12-column grid as if they were placed directly in the form. What it adds is **structure**: a single `label` / `help` / `description` for the whole set instead of per-input, an HTML scaffold that can be targeted with styling, and one place to hang props that should affect all children — like `columns` for the group as a whole, or [`conditions`](/guide/conditions) that include or exclude the entire branch together.

::: tip
To promote a group's label to a section heading (`<h1>`–`<h6>`), use the `heading` prop — see [Headings](/guide/element-layout#headings) in the Element Layout chapter.
:::

### Hoisting Errors

Validation errors can follow the group's logic too. When a group represents one logical field — like a name split into two inputs — per-input error messages break the illusion. Set `hoist` on the children and their errors surface on the **group** instead, rendered as a single error block below the whole set:

::: usage validate

```vue [Preview]
<VfGroup name="name" label="Name">
  <VfText name="first" rules="required" :columns="6" hoist />
  <VfText name="last" rules="required" :columns="6" hoist />
</VfGroup>
```

```vue [Template]
<VfGroup name="name" label="Name">
  <VfText
    name="first"
    placeholder="First name"
    rules="required"
    :columns="6"
    hoist
  />
  <VfText
    name="last"
    placeholder="Last name"
    rules="required"
    :columns="6"
    hoist
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: {
    type: 'group',
    label: 'Name',
    schema: {
      first: {
        type: 'text',
        placeholder: 'First name',
        rules: 'required',
        columns: 6,
        hoist: true,
      },
      last: {
        type: 'text',
        placeholder: 'Last name',
        rules: 'required',
        columns: 6,
        hoist: true,
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

See [Hoisting Errors](/guide/validation#hoisting-errors) in the Validation chapter.

### Wrapped Groups

Set the `wrap` prop to give the group a visual container — border, background, and padding:

::: usage

```vue [Preview]
<VfGroup name="address" label="Address" :heading="2" wrap>
  <VfText name="street" label="Street" />
  <VfText name="city" label="City" :columns="6" />
  <VfText name="zip" label="ZIP" :columns="6" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  address: {
    type: 'group',
    label: 'Address',
    wrap: true, // [!code highlight]
    schema: {
      street: { type: 'text', label: 'Street' },
      city: { type: 'text', label: 'City', columns: 6 },
      zip: { type: 'text', label: 'ZIP', columns: 6 },
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

`wrap` puts the whole group — label included — inside the container; the related `innerWrap` prop wraps only the children, leaving the label outside the box. The border, background, padding, and radius are controlled by the `groupWrapped*` theming tokens — see the [Tokens tab on VfGroup](/components/VfGroup#tokens) for the full list, or [Themes & Tokens](/guide/themes-tokens#overriding-tokens) for how token overrides work.

### Nesting Data

A group is purely organizational by default: its children write straight into the parent's data, and the group registers no entry of its own in the model. Set `nested` and the group owns a sub-object keyed by its name:

::: usage model

```vue [Preview]
<VfGroup name="address" nested>
  <VfText name="street" label="Street" default="Main St 1" />
  <VfText name="city" label="City" default="Springfield" :columns="6" />
  <VfText name="zip" label="ZIP" default="12345" :columns="6" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  address: {
    type: 'group',
    nested: true, // [!code highlight]
    schema: {
      street: { type: 'text', label: 'Street', default: 'Main St 1' },
      city: { type: 'text', label: 'City', default: 'Springfield', columns: 6 },
      zip: { type: 'text', label: 'ZIP', default: '12345', columns: 6 },
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

The form's model now contains `{ address: { street, city, zip } }` instead of `{ street, city, zip }`. Groups nest arbitrarily — a `nested` group inside another `nested` group builds multi-level data structures, while non-nested groups in between keep contributing to whatever level they sit on. See [Model](/guide/model) for how the model assembles.

### Stacked Groups

A group lays its children out on the same 12-column grid as the form — each child takes its own row unless given a `columns` width. For small inline elements like buttons, that's the wrong tool: you want them side by side at their natural width, wrapping as the row fills. The `stacked` prop switches the group's inner layout from grid to a wrapping flex row:

::: usage

```vue [Preview]
<VfGroup name="actions" stacked>
  <VfButton text="Save" severity="primary" action="submit" />
  <VfButton text="Reset" action="reset" />
  <VfButton text="Delete" severity="danger" />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  actions: { type: 'group',
    stacked: true, // [!code highlight]
    schema: {
      save: { type: 'button', text: 'Save', severity: 'primary', action: 'submit' },
      reset: { type: 'button', text: 'Reset', action: 'reset' },
      delete: { type: 'button', text: 'Delete', severity: 'danger' },
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

The same layout works for any children with an intrinsic width — buttons, checkbox and radio controls. `VfForm` also accepts `stacked`, applying the same flow to the form's direct children.

### Tabbed Groups

A group with the `tabbed` prop splits its direct children across tabs. Each child's `page` prop provides the tab label; to put multiple elements on one tab, make that child a group:

::: usage

```vue [Preview]
<VfGroup name="settings" tabbed>
  <VfGroup name="account" page="Account">
    <VfText name="email" label="Email" />
    <VfText name="password" label="Password" />
    <VfRadios
      name="type"
      label="Account type"
      :items="{ personal: 'Personal', company: 'Company' }"
      default="personal"
    />
  </VfGroup>
  <VfGroup name="profile" page="Profile">
    <VfText name="name" label="Display name" />
    <VfText name="bio" label="Bio" />
  </VfGroup>
  <VfGroup
    name="billing"
    page="Billing address"
    :conditions="[['settings.account.type', '==', 'company']]"
  >
    <VfText name="street" label="Street" />
    <VfText name="city" label="City" :columns="6" />
    <VfText name="zip" label="ZIP" :columns="6" />
  </VfGroup>
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  settings: {
    type: 'group',
    tabbed: true, // [!code highlight]
    schema: {
      account: {
        type: 'group',
        page: 'Account',
        schema: {
          email: { type: 'text', label: 'Email' },
          password: { type: 'text', label: 'Password' },
          type: {
            type: 'radios',
            label: 'Account type',
            items: { personal: 'Personal', company: 'Company' },
            default: 'personal',
          },
        },
      },
      profile: {
        type: 'group',
        page: 'Profile',
        schema: {
          name: { type: 'text', label: 'Display name' },
          bio: { type: 'text', label: 'Bio' },
        },
      },
      billing: {
        type: 'group',
        page: 'Billing address',
        conditions: [['settings.account.type', '==', 'company']],
        schema: {
          street: { type: 'text', label: 'Street' },
          city: { type: 'text', label: 'City', columns: 6 },
          zip: { type: 'text', label: 'ZIP', columns: 6 },
        },
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

Tabs respect [Conditions](/guide/conditions#conditions-on-tabs-and-steps) — the _Billing address_ tab only exists while the account type on the first tab is _Company_. The same `tabbed` mechanism is available on the form itself, along with a sequential `stepped` wizard mode — both are covered in [Multi-Page Forms](/guide/multi-page-forms).

## Grid Layout

The 12-column system is **one-dimensional**: elements flow in row direction and wrap. Each row is independent — column edges don't have to line up across rows, and usually that's fine. When you need **two-dimensional** alignment — labels and inputs lining up across multiple rows, cells spanning rows and columns, table-like panels — reach for `VfGrid`, a true CSS Grid described declaratively.

In templates, the natural form is `VfRow` and `VfCol` components nested inside `VfGrid` — it reads like HTML table markup and gives you full template control inside each cell. In schemas, the `grid` prop takes a 2D array:

::: usage

```vue [Preview]
<VfGrid name="contact">
  <VfRow>
    <VfCol>
      <VfText name="first" label="First name" />
    </VfCol>
    <VfCol>
      <VfText name="last" label="Last name" />
    </VfCol>
  </VfRow>
  <VfRow>
    <VfCol>
      <VfText name="email" label="Email" />
    </VfCol>
    <VfCol>
      <VfText name="phone" label="Phone" />
    </VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contact: {
    type: 'grid',
    grid: [
      [
        { type: 'text', name: 'first', label: 'First name' },
        { type: 'text', name: 'last', label: 'Last name' },
      ],
      [
        { type: 'text', name: 'email', label: 'Email' },
        { type: 'text', name: 'phone', label: 'Phone' },
      ],
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Four inputs in a 2×2 layout. Visually similar to two `:columns="6"` rows — but here the column edges line up across both rows, because every cell shares the same grid track. Like a group, a grid contributes its children's values to the parent's data by default; set `nested` to collect them under the grid's own key.

### Cells

In the schema's `grid` array, each inner array is a row and each item a cell. A cell can be:

- An **element schema object** — rendered as a Vueform element (any element type works).
- A **string** — rendered as plain text content. It may also carry `{...}` [expressions](/guide/expressions), and renders as **HTML** when the `grid` area is listed in [`$security.allowHtml`](/guide/security#html-sanitization) — sanitized like every other HTML area.
- `null` — an empty placeholder cell.

To make a cell span multiple columns or rows, or align its content, add the grid layout props — `colspan`, `rowspan`, `align`, `valign` — directly to the cell object (paired with a `content` key for text cells). In templates, the same props go on `VfCol`:

::: usage

```vue [Preview]
<VfGrid name="contact">
  <VfRow>
    <VfCol>
      <VfText name="first" label="First name" />
    </VfCol>
    <VfCol>
      <VfText name="last" label="Last name" />
    </VfCol>
  </VfRow>
  <VfRow>
    <VfCol :colspan="2">
      <VfTextarea name="bio" label="Bio" />
    </VfCol>
  </VfRow>
</VfGrid>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contact: {
    type: 'grid',
    grid: [
      [
        { type: 'text', name: 'first', label: 'First name' },
        { type: 'text', name: 'last', label: 'Last name' },
      ],
      [
        { type: 'textarea', name: 'bio', label: 'Bio', colspan: 2 }, // [!code highlight]
      ],
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The structural rules in templates: `VfRow` must be a direct child of `VfGrid`, and `VfCol` a direct child of `VfRow`.

### More Options

`VfGrid` supports much more — column and row headers (`colHeaders`, `rowHeaders`, or the `header` prop on individual `VfCol`s), explicit column `widths` (anything `grid-template-columns` accepts), grid-wide `align` / `valign` defaults, and horizontal scrolling via `scrollable` with `minWidth`. See [VfGrid](/components/VfGrid) for the full list with examples.

## Matrix Layout

`VfGrid` is free-form — every cell is whatever you put in it. `VfMatrix` is its structured sibling: you define `cols` and `rows`, and it renders the matching input in every intersection, with headers. Think survey grids, availability schedules, scoring tables — any form where each row shares the same set of columns.

::: usage

```vue [Preview]
<VfMatrix
  name="schedule"
  :cols="{ mon: 'Mon', tue: 'Tue', wed: 'Wed' }"
  :rows="{ morning: 'Morning', afternoon: 'Afternoon' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  schedule: {
    type: 'matrix',
    cols: { mon: 'Mon', tue: 'Tue', wed: 'Wed' },
    rows: {
      morning: 'Morning',
      afternoon: 'Afternoon',
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

By default each cell is an independent text input, and the value is an object of row objects: `{ morning: { mon, tue, wed }, afternoon: { mon, tue, wed } }`.

### Selection Modes

The `mode` prop controls what the cells are:

| Mode             | Cell element                | Row value                        | Use case                            |
| ---------------- | --------------------------- | -------------------------------- | ----------------------------------- |
| `auto` (default) | Independent input per cell. | Object of column values.         | Spreadsheet-style data entry.       |
| `single`         | Radio per cell.             | The selected column's value.     | One choice per row (survey scales). |
| `multiple`       | Checkbox per cell.          | Array of selected column values. | Any number of choices per row.      |

In `single` mode each row becomes a radio group:

::: usage w-fit

```vue [Preview]
<VfMatrix
  name="survey"
  mode="single"
  :cols="{
    disagree: 'Disagree',
    neutral: 'Neutral',
    agree: 'Agree',
  }"
  :rows="{
    quality: 'Product quality',
    support: 'Customer support',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  survey: {
    type: 'matrix',
    mode: 'single', // [!code highlight]
    cols: {
      disagree: 'Disagree',
      neutral: 'Neutral',
      agree: 'Agree',
    },
    rows: {
      quality: 'Product quality',
      support: 'Customer support',
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

And in `multiple` mode each row becomes a checkbox group:

::: usage

```vue [Preview]
<VfMatrix
  name="availability"
  mode="multiple"
  :cols="{
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
  }"
  :rows="{
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  availability: {
    type: 'matrix',
    mode: 'multiple', // [!code highlight]
    cols: {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
    },
    rows: {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
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

### Custom Cell Types

To override the input type per column, use the detailed column format and give the column a `schema`:

::: usage w-lg

```vue [Preview]
<VfMatrix
  name="scores"
  :cols="[
    {
      value: 'score',
      label: 'Score',
      schema: {
        type: 'select',
        items: [1, 2, 3, 4, 5],
        placeholder: '-',
      },
    },
    {
      value: 'notes',
      label: 'Notes',
      schema: { type: 'textarea', rows: 1 },
    },
  ]"
  :rows="{
    design: 'Design',
    performance: 'Performance',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  scores: {
    type: 'matrix',
    cols: [
      {
        value: 'score',
        label: 'Score',
        schema: { // [!code highlight]
          type: 'select', // [!code highlight]
          items: [1, 2, 3, 4, 5], // [!code highlight]
          placeholder: '-', // [!code highlight]
        }, // [!code highlight]
      },
      {
        value: 'notes',
        label: 'Notes',
        schema: { type: 'textarea', rows: 1 }, // [!code highlight]
      },
    ],
    rows: {
      design: 'Design',
      performance: 'Performance',
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

The column `schema` accepts any element schema object — `type` is required, everything else is passed through to the cell element.

### More Options

There's a lot more to `VfMatrix`: **dynamic rows** that turn it into an add/remove repeater (covered in [Repeaters](/guide/repeaters#matrix-repeater)), conditional columns and rows (see [Conditions](/guide/conditions#conditions-on-matrix-columns-and-rows)), loading `cols` and `rows` from an endpoint, per-column width constraints, scrollable layouts with sticky headers, and drag-and-drop row sorting. See [VfMatrix](/components/VfMatrix) for the full list with examples.

## Tabular Mode

Both `VfGrid` and `VfMatrix` accept a `tabular` prop that renders them as a bordered table — cells share borders, headers get distinct background styling, corner cells get rounded edges. Elements inside tabular cells render inline, without their own labels and wrappers, so they fill the cell cleanly.

A tabular grid:

::: usage w-lg

```vue [Live]
<VfGrid name="order" tabular col-headers row-headers :grid="[
  [null, 'Qty', 'Price'],
  ['Premium plan', { type: 'text', name: 'qty1', default: '3' }, '$29'],
  ['Add-on storage', { type: 'text', name: 'qty2', default: '0' }, '$5'],
]" />
```

```vue [Preview]
<VfForm>
  <VfGrid name="order" col-headers row-headers tabular>
    <VfRow>
      <VfCol></VfCol>
      <VfCol>Qty</VfCol>
      <VfCol>Price</VfCol>
    </VfRow>
    <VfRow>
      <VfCol>Premium plan</VfCol>
      <VfCol><VfText name="qty1" default="3" /></VfCol>
      <VfCol>$29</VfCol>
    </VfRow>
    <VfRow>
      <VfCol>Add-on storage</VfCol>
      <VfCol><VfText name="qty2" default="0" /></VfCol>
      <VfCol>$5</VfCol>
    </VfRow>
  </VfGrid>
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  order: {
    type: 'grid',
    tabular: true, // [!code highlight]
    colHeaders: true,
    rowHeaders: true,
    grid: [
      [null, 'Qty', 'Price'],
      ['Premium plan', { type: 'text', name: 'qty1', default: '3' }, '$29'],
      ['Add-on storage', { type: 'text', name: 'qty2', default: '0' }, '$5'],
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

And a tabular matrix:

::: usage w-fit

```vue [Preview]
<VfMatrix
  name="availability"
  tabular
  mode="multiple"
  :cols="{ morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }"
  :rows="{ mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  availability: {
    type: 'matrix',
    tabular: true, // [!code highlight]
    mode: 'multiple',
    cols: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    rows: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The tabular appearance — backgrounds, borders, header styling, radius, padding — is controlled by the `tabular*` theming tokens, overridable globally or per component:

```ts
import { createVueform } from '@vueform/ui/origin'

createVueform({
  tokens: {
    tabularHeaderPadding: '0.25rem 0.5rem',
    tabularColHeaderBg: '#eef4ff',
    tabularBorderColor: '#cbd5e1',
    tabularRadius: '0.5rem',
  },
})
```

See the Tokens tab on [VfGrid](/components/VfGrid#tokens) and [VfMatrix](/components/VfMatrix#tokens) for the full list, or [Themes & Tokens](/guide/themes-tokens) for how the token system works.

## Spacing & Dividers

Finally, the finishing touches. Every element accepts four props for adding vertical breathing room and visual separators above or below itself — the quick way to break a long form into sections without custom CSS or an extra container:

| Prop          | Type          | Description                                     |
| ------------- | ------------- | ----------------------------------------------- |
| `spaceTop`    | `1 \| 2 \| 3` | Adds vertical padding above the element.        |
| `spaceBottom` | `1 \| 2 \| 3` | Adds vertical padding below the element.        |
| `lineTop`     | `boolean`     | Renders a horizontal divider above the element. |
| `lineBottom`  | `boolean`     | Renders a horizontal divider below the element. |

::: usage

```vue [Preview]
<VfText name="email" label="Email" />
<VfText name="phone" label="Phone" :space-bottom="2" />
<VfText name="address" label="Address" :space-top="2" line-top />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  email: { type: 'text', label: 'Email' },
  phone: { type: 'text', label: 'Phone',
    spaceBottom: 2, // [!code highlight]
  },
  address: { type: 'text', label: 'Address',
    spaceTop: 2, // [!code highlight]
    lineTop: true, // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

The `1`–`3` values map to the `space1`, `space2`, and `space3` [theming tokens](/guide/themes-tokens#token-tiers) (`1rem`, `2rem`, and `3rem` by default), and the space around dividers comes from `spaceHr`:

```ts
import { createVueform } from '@vueform/ui/origin'

createVueform({
  tokens: {
    space1: '0.75rem',
    space2: '1.5rem',
    space3: '2.5rem',
    spaceHr: '0.5rem',
  },
})
```

These props work on **any element**, including containers — handy for putting a divider above a whole section rather than a single field. When a section deserves more than a line — a shared label, a border, a background — reach back to [`VfGroup`](#grouping-elements).
